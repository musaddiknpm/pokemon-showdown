# Process Manager Library Reference

This document describes the multiprocess abstraction exported from `process-manager.ts`. It manages child processes/cluster workers for offloading expensive or blocking work (e.g. SQLite queries, validation, chat filtering) off the main process.

**Nothing here is global** — everything must be explicitly imported from `lib/process-manager.ts` before use.

```ts
import { QueryProcessManager, StreamProcessManager, RawProcessManager, exec, processManagers } from '../lib/process-manager';
```

**Audience note:** Unlike `Utils`, `FS`, `Net`, and `SQL`, this module is **low-level infrastructure**, not something most chat-plugin code touches directly. You'll mostly interact with it indirectly — e.g. `sql.ts`'s `SQLDatabaseManager` is built on top of `QueryProcessManager`. Reach for this module directly only when building a new subsystem that genuinely needs its own dedicated worker process(es) — e.g. a CPU-heavy validator, a sandboxed eval service, or another SQLite-style offloaded resource. For ordinary chat-plugin logic, prefer the higher-level libraries (`SQL`, `FS`, `Net`) that already use this underneath.

---

## ⚠️ Memory & CPU Consumption — Read Before Using

Every "spawn" here is a **real OS-level process** (via `child_process.fork` or `cluster.fork`), not a lightweight thread. This makes the cost model very different from the other lib files:

- **Each spawned process has its own Node.js runtime, V8 heap, and event loop.** A handful of extra processes is usually fine; spawning many (or spawning per-request instead of reusing a pool) will exhaust system memory and file descriptors quickly. Always spawn a small, bounded pool up front (via `.spawn(count)`) and reuse it — don't call `createProcess()`/`spawnOne()` per query.
- **`queryTemporaryProcess()` and `RawProcessManager`'s on-demand spawning bypass the pool** and create a fresh process per call/worker. Use `queryTemporaryProcess` only for rare, deliberately-isolated one-off work (e.g. "run this in a totally fresh process so a crash can't affect anything else") — never in a hot path, since each call pays full process-startup cost (V8 init, module loading) on top of the actual work.
- **Load balancing via `.acquire()` is purely queue-depth (`getLoad()`), not actual CPU/memory usage.** A process that's slow due to CPU starvation (rather than queue depth) won't be deprioritized — keep individual query handlers fast and predictable, since the load balancer can't detect "this worker is struggling," only "this worker has many pending tasks."
- **Crash respawning can spiral under sustained failure.** `releaseCrashed()` automatically respawns a replacement process on crash, but stops auto-respawning after 5 crashes within a 30-minute window — protecting against a crash loop that would otherwise repeatedly fork new processes (each with full startup cost) in a tight loop. Don't disable or work around this safeguard without understanding why it's there.
- **`exec()` shells out to a separate OS process per call** (via `child_process.exec`/`execFile`), entirely outside the pooling system. Each call pays full process-spawn overhead — fine for occasional admin/maintenance commands, but never call this in a loop or per-message/per-user code path.
- **`debug` strings accumulate per-process** (`StreamProcessWrapper`/`RawProcessWrapper`'s `setDebug` keeps the last 32,768 characters). This is bounded, so it's not a leak, but be aware it holds onto a meaningful chunk of memory per active process for crash-diagnostics purposes.
- **Streams and pending queries held per-process must be cleaned up.** `activeStreams`/`pendingTasks` maps grow with in-flight work; always `.release()` or `.destroy()` processes you're done with rather than abandoning references to them, or those maps (and the OS process itself) will leak for the life of the server.

In short: **spawn a small fixed pool once, reuse it, avoid `queryTemporaryProcess`/`exec` in hot paths, and always release processes you no longer need.**

---

## Standalone Helper

### `exec(args, execOptions?): Promise<{ stdout, stderr }>` (or `Promise<string>`)
Runs a shell command in a brand-new OS process and returns its output, wrapping Node's `child_process.exec`/`execFile` in a Promise.

- **Two call forms:**
  - `exec(commandString, options?)` — runs via a shell (`child_process.exec`), resolves with just `stdout` as a string.
  - `exec([command, ...args], options?)` — runs the executable directly without a shell (`child_process.execFile`, safer — no shell-injection risk from argument content), resolves with `{ stdout, stderr }`.
- **When to use:** Occasional one-off shell commands (e.g. an admin command that runs `git pull`, or a maintenance script) — not for anything performance-sensitive or frequently invoked (see Memory & CPU note above).
- **Example:**
  ```ts
  const { stdout, stderr } = await exec(['git', 'log', '-1']);
  ```
- **Caution:** Prefer the array form over the string form when any part of the command includes dynamic/user-influenced input, since `execFile` avoids shell interpretation of that input.

### `processManagers: ProcessManager[]`
A module-level array that every constructed `ProcessManager` (of any subclass) automatically registers itself into.

- **When to use:** Introspection/administration — e.g. a `/debug` command that lists all active process managers and their current process counts/loads across the whole server.

---

## `ProcessManager<T>` — Abstract Base Class

The shared pooling/lifecycle logic underlying all three concrete manager types below (`QueryProcessManager`, `StreamProcessManager`, `RawProcessManager`). You don't instantiate this directly — but its methods are inherited by all three, so they're documented once here.

### `.acquire(): T | null`
Picks the least-loaded process currently in the pool (by comparing `getLoad()` across all processes), or `null` if the pool is empty.

- **When to use:** Internal — called automatically by `.query()`/`.createStream()` to pick a worker. You generally won't call this directly.
- **Caution:** See the Memory & CPU note — this is queue-depth load balancing only, not CPU-aware.

### `.spawn(count = 1, force?): void`
Ensures the pool has at least `count` processes, spawning as many new ones as needed to reach that number. Does nothing if called in a child process, or if `ProcessManager.disabled` is set (unless `force` is passed).

- **When to use:** Once at startup, to size your worker pool — e.g. `myManager.spawn(4)` to run with 4 worker processes. This is the normal way to populate the pool; avoid spawning incrementally per-request.
- **Example:**
  ```ts
  myQueryManager.spawn(2); // maintain a pool of 2 workers
  ```

### `.spawnOne(force?): T | null`
Spawns exactly one new process and adds it to the pool, returning the wrapper (or `null` if disabled and not forced). Throws if called from a non-parent process.

- **When to use:** Lower-level than `.spawn()` — used internally, or if you need a reference to the specific freshly-spawned process. Most code should use `.spawn(count)` instead.

### `.respawn(count = null): Promise<void>`
Tears down the entire current pool and spawns a fresh pool of `count` processes (or the same size as before, if `count` is omitted).

- **When to use:** Reloading code in worker processes without restarting the whole server — e.g. an admin `/respawn` style command after deploying updated worker code.
- **Caution:** Throws if the manager was configured with 0 worker processes (i.e. it runs queries in the main process) — there's nothing to respawn in that case.

### `.unspawn(): Promise<void[]>`
Gracefully releases and removes every process currently in the pool.

- **When to use:** Shutting down a subsystem cleanly — releases each process via `.release()` (letting in-flight work finish) rather than abruptly killing them.

### `.unspawnOne(process): Promise<void>`
Releases and removes a single specific process from the pool.

- **When to use:** Internal — used by `.unspawn()` and `queryTemporaryProcess()`. Direct use is rare.

### `.releaseCrashed(process): void`
Internal — called automatically when a pooled process disconnects unexpectedly (crashes). Removes it from the pool, logs/reports the crash, and respawns a replacement **unless** there have been more than 5 crashes within the last 30 minutes (a safety valve against crash-loop process-spawn storms).

- **When to use:** Never call this directly — it's wired up automatically in `.spawnOne()` via the process's `'disconnect'` event.

### `.startRepl(options): void`
Starts a REPL (read-eval-print loop, for live debugging) attached to this manager, via the project's `Repl` module.

- **When to use:** Debugging/ops tooling — attaching an interactive console to inspect a running manager's state. Not relevant to typical chat-plugin work.

### `.destroy(): Promise<void[]>`
Removes this manager from the global `processManagers` list and unspawns its entire pool.

- **When to use:** Permanently shutting down a process manager and all its workers — e.g. during a clean server shutdown sequence.

### `abstract .listen(): void` / `abstract .createProcess(...): T`
Abstract methods every subclass must implement: `.listen()` sets up the message-handling logic when running *inside* a worker process; `.createProcess()` constructs and returns a new wrapper instance for the pool. Not called directly — they're invoked internally by the base class's lifecycle methods.

### `.destroyProcess(process): void`
No-op hook in the base class, overridden by subclasses that need extra cleanup (e.g. `RawProcessManager` removes the process from its `workers` array). Not normally called directly.

---

## `QueryProcessManager<T, U>` — Request/Response Style

The most common pattern: send one input, get back one output (optionally async on the worker side). This is what `SQLDatabaseManager` (from `sql.ts`) extends.

```ts
const manager = new QueryProcessManager<MyInput, MyOutput>('my-feature', module, input => {
    // runs in the WORKER process
    return doExpensiveWork(input);
});
manager.spawn(2); // pool of 2 workers
```

### Constructor: `new QueryProcessManager(id, ctx, query, timeout = 900000, debugCallback?)`
- `id` — unique identifier for this manager.
- `ctx` — pass the calling file's `module` object.
- `query` — the function that actually processes a query; this code runs **inside the worker process**, not the parent. Can return synchronously or a Promise.
- `timeout` — milliseconds to wait for a response before assuming the worker is stuck; defaults to 15 minutes. If exceeded, the stuck process is destroyed and a replacement is spawned, and an error is thrown describing the timeout (including any `debug` info the process reported).
- `debugCallback` — optional callback invoked when the worker sends a `CALLBACK\n`-prefixed message (a side-channel for progress/debug info distinct from the main query response).

### `.query(input, process = this.acquire()): Promise<U>`
Sends `input` to a worker process (the least-loaded one, by default) and resolves with its response.

- **How:** If there's no pool (`this.acquire()` returns `null` — e.g. the manager is configured to run with 0 worker processes), runs the `query` function **directly in the current (parent) process** instead — this is what lets a `QueryProcessManager` transparently work even with zero spawned workers, just without the offloading benefit.
- **When to use:** The standard way to send work to the pool.
- **Example:**
  ```ts
  const result = await manager.query({ someField: 'value' });
  ```

### `.queryTemporaryProcess(input, force?): Promise<U>`
Spawns a brand-new, one-off process just for this single query, then immediately releases it afterward.

- **When to use:** Rare — only when you specifically need isolation guarantees (e.g. "this one query must run in a fresh process so it can't be affected by/affect other pending work"). See the Memory & CPU warning: this pays full process-spawn cost every call and should never be used in a hot path.

### `.createProcess(): QueryProcessWrapper<T, U>`
Internal — implements the abstract base method; constructs a new `QueryProcessWrapper` for the pool. Not called directly.

### `.listen(): void`
Internal — sets up the message handler that runs **inside a worker process**, receiving serialized queries, running the user-supplied `query` function, and sending back the JSON-serialized result. Also supports a special `EVAL`-prefixed task ID for running arbitrary code (used by the REPL/debug tooling). Not called directly — invoked automatically by the constructor via the base class.

---

## `QueryProcessWrapper<T, U>` — Parent-Side Handle to a Query Worker

What `.acquire()`/`.createProcess()` return for a `QueryProcessManager`. Represents one live worker process from the parent's perspective.

- **`.query(input): Promise<U>`** — sends a single query and resolves with the response (matches responses to requests via an internal incrementing `taskId`).
- **`.getLoad(): number`** — number of currently pending (unanswered) queries on this process; used by `.acquire()` for load balancing.
- **`.getProcess(): ChildProcess`** — the raw underlying Node `ChildProcess`/`Worker` object, if you need lower-level access (e.g. its PID for logging).
- **`.release(): Promise<void>`** — gracefully retires this process: if it has no pending work, destroys it immediately; otherwise waits for pending queries to finish first, then destroys it. Resolves once the process is fully shut down.
- **`.destroy(): void`** — immediately disconnects the process and force-resolves any still-pending queries (with an empty string), without waiting for them to finish naturally. More abrupt than `.release()`.
- **`.safeJSON(str): any`** — internal helper that safely parses a response string as JSON, logging to the crash monitor (rather than throwing) if parsing fails — since a worker producing unparseable output shouldn't crash the parent.

**When you'd touch this directly:** Rare — `QueryProcessManager.query()` handles acquiring and querying a wrapper for you. You might use `.getProcess()` for logging/debugging, or `.release()`/`.destroy()` when manually managing a specific process's lifecycle outside the normal pool flow.

---

## `StreamProcessManager` — Long-Lived Bidirectional Streams

For work that isn't a single request/response, but an ongoing bidirectional stream of data with a worker (e.g. a long-running conversion/processing pipeline).

```ts
const manager = new StreamProcessManager('my-stream-feature', module, () => {
    // runs in the WORKER process; returns a fresh ObjectReadWriteStream per createStream() call
    return createMyProcessingStream();
});
manager.spawn(1);
```

### Constructor: `new StreamProcessManager(id, ctx, createStream, messageCallback?)`
- `createStream` — a factory function (run in the **worker**) that produces a fresh `Streams.ObjectReadWriteStream<string>` each time the parent requests a new stream.
- `messageCallback` — optional debug-side-channel callback, same purpose as in `QueryProcessManager`.

### `.createStream(): SubprocessStream`
Requests a new stream from the least-loaded worker (or runs `createStream()` directly in the parent if the pool is empty, same zero-worker fallback pattern as `QueryProcessManager`).

- **When to use:** Starting a new long-lived piece of work with a worker — write data into the returned stream, read results back out of it, same interface as any other PS stream.
- **Example:**
  ```ts
  const stream = manager.createStream();
  void stream.write(chunk);
  for await (const result of stream) { /* handle each pushed result */ }
  ```

### `.createProcess(): StreamProcessWrapper`
Internal — constructs a new `StreamProcessWrapper` for the pool. Not called directly.

### `.pipeStream(taskId, stream): Promise<void>`
Internal — runs **inside the worker**, reading from a local stream and forwarding each value back to the parent process tagged with `taskId`, until the stream ends or errors. Not called directly.

### `.listen(): void`
Internal — sets up the worker-side message handler that creates/writes-to/destroys per-task streams based on `NEW`/`WRITE`/`WRITEEND`/`DESTROY` messages from the parent. Not called directly.

---

## `StreamProcessWrapper` — Parent-Side Handle to a Stream Worker

What `.acquire()`/`.createProcess()` return for a `StreamProcessManager`. Manages potentially many concurrent streams multiplexed over one worker process.

- **`.createStream(): SubprocessStream`** — opens a new multiplexed stream (assigns it a fresh `taskId`) against this worker.
- **`.getLoad(): number`** — number of currently active streams on this process.
- **`.getProcess() / .deleteStream(taskId) / .release() / .destroy()`** — analogous to `QueryProcessWrapper`'s equivalents, but operating over the set of active streams (`activeStreams`) rather than pending queries. `.destroy()` also destroys every active stream on this process.
- **`.setDebug(message)`** — appends to a rolling debug log (capped at the last 32,768 characters) for crash diagnostics.

**When you'd touch this directly:** Rare — same as `QueryProcessWrapper`, mostly used internally by `StreamProcessManager`.

### `SubprocessStream` (internal class)
The actual stream object returned by `.createStream()`. A `Streams.ObjectReadWriteStream<string>` whose `_write`/`_writeEnd`/`_destroy` methods translate local stream operations into `WRITE`/`WRITEEND`/`DESTROY` messages sent to the worker. You use it like any other PS stream (`.write()`, async iteration, `.destroy()`) — you don't need to know about its internal message protocol.

---

## `RawProcessManager` — Persistent Worker Pool / Cluster Mode

The most specialized manager: for long-running worker processes that aren't queried request/response style, but instead act as standing servers (optionally using Node's `cluster` module for things like load-balanced socket listeners).

```ts
const manager = new RawProcessManager({
    id: 'my-raw-workers',
    module,
    setupChild: () => createMyWorkerStream(),
    isCluster: true,
});
```

### Constructor: `new RawProcessManager(options)`
- `options.setupChild` — factory (run in the **worker**) producing the stream the worker will pipe its messages through.
- `options.isCluster` — if `true`, uses Node's `cluster` module (`cluster.fork`) instead of plain `child_process.fork` — appropriate for workers that need to share a listening socket (e.g. multiple processes serving the same port).
- `options.env` — extra environment variables passed to forked processes.

### `.spawn(count?): void`
Same as the base class's `.spawn()`, but with a special case: if configured for **zero** worker processes, it instead creates a single in-process "master worker" (`this.masterWorker`) wrapping a directly-created stream, rather than truly spawning nothing — ensuring there's always at least one usable stream/worker reference even in single-process mode.

### `.createProcess(): RawProcessWrapper`
Creates a new `RawProcessWrapper`, adds it to `this.workers`, and notifies any spawn subscriber.

### `.subscribeSpawn(callback)` / `.subscribeUnspawn(callback)`
Registers a callback to be notified whenever a new worker is spawned / removed.

- **When to use:** Reacting to pool size changes — e.g. updating a load-balancer's list of available workers whenever one comes online or goes away.

### `.pipeStream(stream): Promise<void>`
Internal — runs in the worker, continuously reading from a local stream and `process.send`-ing each value to the parent (or a `THROW` message on error). Not called directly.

### `.listen(): void`
Internal — sets up the worker-side message handling: lazily creates the child's stream (via `setupChild`) on first tick, pipes incoming parent messages into it, and exits cleanly on disconnect. Not called directly.

---

## `RawProcessWrapper` — Parent-Side Handle to a Raw Worker

What `.createProcess()` returns for `RawProcessManager`. Represents one persistent worker (cluster worker or plain child process).

- **`.stream: RawSubprocessStream`** — the bidirectional stream for communicating with this worker; write to it to send messages, read from it to receive them.
- **`.getProcess()`** — the underlying `ChildProcess`/`Worker`.
- **`.getLoad()`** — returns `this.load`, a field that is **not managed by `RawProcessWrapper` itself** — calling code is responsible for tracking and updating load manually for this manager type (unlike `QueryProcessWrapper`/`StreamProcessWrapper`, which compute load automatically from pending work).
- **`.release() / .destroy()`** — same release/destroy lifecycle pattern as the other wrapper types.
- **`.setDebug(message)`** — same rolling debug-log pattern (last 32,768 characters).

### `RawSubprocessStream` (internal class)
The stream backing `.stream` above — writes are sent directly as raw messages to the worker process (no task-multiplexing protocol, unlike `SubprocessStream`, since `RawProcessManager` workers are 1:1 with their stream, not handling multiple concurrent logical streams).

### `StreamWorker` (internal class)
A minimal container (`{ load, workerid, stream }`) used to represent a worker uniformly, including the special "zero spawned processes" case where `RawProcessManager.masterWorker` wraps a stream that isn't backed by a real separate OS process at all.

---

## Shared Types

| Type | Purpose |
|---|---|
| `ProcessWrapper` | The common interface (`getLoad`, `process`, `release`, `getProcess`) all three wrapper classes implement |
| `ChildProcess` | Alias for `child_process.ChildProcess` |
| `Worker` | Alias for `cluster.Worker` |

---

## Quick Reference Table

| Member | Category | One-line purpose |
|---|---|---|
| `exec(args, opts?)` | Standalone | Run a one-off shell command in a new OS process |
| `processManagers` | Standalone | Global list of all constructed managers |
| `ProcessManager.spawn/spawnOne` | Base class | Populate the worker pool |
| `ProcessManager.respawn` | Base class | Tear down + recreate the whole pool |
| `ProcessManager.unspawn/unspawnOne` | Base class | Gracefully release pooled process(es) |
| `ProcessManager.acquire` | Base class | Pick the least-loaded process (internal) |
| `ProcessManager.destroy` | Base class | Shut down this manager entirely |
| `QueryProcessManager` | Manager | Request → response style, runs query fn in worker |
| `.query(input)` | QueryProcessManager | Send one query, await one response |
| `.queryTemporaryProcess(input)` | QueryProcessManager | One-off query in a disposable fresh process (expensive — avoid in hot paths) |
| `QueryProcessWrapper` | Wrapper | Parent-side handle to one query worker |
| `StreamProcessManager` | Manager | Long-lived bidirectional stream per task, multiplexed over a worker |
| `.createStream()` | StreamProcessManager | Open a new multiplexed stream with a worker |
| `StreamProcessWrapper` | Wrapper | Parent-side handle managing multiple streams on one worker |
| `RawProcessManager` | Manager | Persistent worker pool, optional cluster-mode |
| `RawProcessWrapper` | Wrapper | Parent-side handle to one persistent raw worker |
| `StreamWorker` | Internal | Uniform worker container, incl. zero-process fallback |

---

## Summary: Resource Usage Checklist

- [ ] Spawn a small, fixed-size pool once at startup (`.spawn(count)`) — don't spawn per-request.
- [ ] Avoid `queryTemporaryProcess()` and `exec()` in any frequently-hit or per-user/per-message code path — both pay full process-spawn cost every call.
- [ ] Keep individual worker query/stream handlers fast — the load balancer only sees queue depth, not actual CPU load.
- [ ] Always `.release()` (graceful) or `.destroy()` (immediate) processes/streams you're done with — don't let references to them leak.
- [ ] Don't fight the crash-respawn safety valve (stops after 5 crashes / 30 minutes) — if you're hitting it, fix the underlying crash instead of forcing more respawns.
- [ ] Reach for this module directly only when building new infrastructure — for typical feature work, use the higher-level libraries (`SQL`, etc.) that already wrap it.
