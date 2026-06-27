# FS Library Reference

This document describes the `FS` abstraction layer exported from `fs.ts`. It wraps Node's filesystem module with PS-specific conventions.

**`FS` is not a global** — it must always be explicitly imported from `lib/fs.ts` before use, in every file (including chat-plugins).

```ts
import { FS } from '../lib/fs';

const data = await FS('config/example.json').readIfExists();
```

**Design philosophy / advantages over raw `fs`:**
- All write-type operations (`write`, `append`, `mkdir`, etc.) become safe no-ops in unit tests / when `Config.nofswriting` is set, instead of touching disk.
- Paths are always resolved relative to PS's root directory (`ROOT_PATH`), not the current working directory or the calling file's location.
- Returns real Promises instead of Node's callback-style APIs.
- PS-style calling convention: `FS("foo.txt").write("bar")` instead of `fs.writeFile("foo.txt", "bar", cb)` — the path comes first, which reads more naturally and groups all operations on one file together.
- Built-in `mkdirp` (recursive directory creation) and several higher-level safety helpers (`safeWrite`, `writeUpdate`) not present in raw `fs`.

**Where FS is intentionally *not* used:** `crashlogger` (in case the crash originates in here), `repl` (uses raw Unix sockets), the launch script (runs before modules load), and `sim/` (kept fully self-contained). Don't introduce an `FS` dependency into those areas.

---

## Calling Convention

`FS` is a callable function (not a class you `new`) that takes a path and returns an `FSPath` instance with all the methods below.

```ts
FS(path: string): FSPath
```

- **How:** `FS('relative/path.txt')` resolves the path against `ROOT_PATH` (PS's base directory, computed once from `__dirname`, accounting for whether the code is running from `dist/`). You then chain a method off the result.
- **When to use:** This is the only way to get an `FSPath` — always start a file operation with `FS(path)`.
- **Example:**
  ```ts
  await FS('logs/modlog/today.txt').append('User was banned.\n');
  ```

`FS` also exposes some static members for advanced/rare use:
- `FS.FSPath` — the `FSPath` class itself, if you need the type or want to construct one in an unusual way.
- `FS.FileReadStream` — the internal read-stream class (see Streams section).
- `FS.ROOT_PATH` — the resolved absolute path PS treats as its root; all relative paths passed to `FS()` are resolved against this.

---

## Reading Files

### `.read(options = 'utf8'): Promise<string>`
Reads a file's full contents as text.

- **How:** Wraps `fs.readFile`. If `options` is an object without an explicit `encoding`, defaults it to `'utf8'`.
- **When to use:** Reading a config file, data file, or any text file where you expect it to exist and want to `await` the contents.
- **Caution:** Throws (rejects) if the file doesn't exist — use `.readIfExists()` instead if a missing file is an expected, non-error case.
- **Example:**
  ```ts
  const raw = await FS('config/config.js').read();
  ```

### `.readSync(options = 'utf8'): string`
Synchronous version of `.read()`.

- **When to use:** Startup/config-loading code that runs before the event loop is doing meaningful async work, where synchronous simplicity is preferred over a Promise.

### `.readBuffer(options = {}): Promise<Buffer>`
Reads a file's full contents as raw bytes (`Buffer`), instead of decoding as text.

- **When to use:** Reading binary files — images, compressed data, anything that isn't meant to be interpreted as a text encoding.

### `.readBufferSync(options = {}): Buffer`
Synchronous version of `.readBuffer()`.

### `.exists(): Promise<boolean>`
Checks whether the file/path exists.

- **When to use:** Before conditionally reading/writing a file when you specifically need a boolean rather than try/catch-based control flow. In most cases prefer `.readIfExists()` / `.mkdirIfNonexistent()` instead of checking existence then acting separately, to avoid a race between the check and the action.

### `.existsSync(): boolean`
Synchronous version of `.exists()`.

### `.readIfExists(): Promise<string>`
Reads a file as text, but returns `''` instead of throwing if the file doesn't exist.

- **How:** Catches the `ENOENT` error code specifically and resolves `''`; any other error still rejects.
- **When to use:** The standard way to read an "optional" file — e.g. a data file that may not have been created yet, a per-room config override, a cache file. This is almost always preferable to calling `.exists()` then `.read()` separately, since it avoids a race condition and is a single call.
- **Example (chat-plugin):**
  ```ts
  const customRules = await FS(`config/chatrooms/${room.roomid}.txt`).readIfExists();
  ```

### `.readIfExistsSync(): string`
Synchronous version of `.readIfExists()`.

---

## Writing Files

### `.write(data, options = {}): Promise<void>`
Writes (overwrites) a file's full contents.

- **How:** Wraps `fs.writeFile`. If `global.Config.nofswriting` is set (e.g. in unit tests), it's a no-op that resolves immediately without touching disk.
- **When to use:** Simple, infrequent writes where you don't need crash-safety or race protection — e.g. one-off data dumps, log rotation output. For anything important or frequently updated, prefer `.safeWrite()` or `.writeUpdate()` below.
- **Example:**
  ```ts
  await FS('logs/dump.json').write(JSON.stringify(data));
  ```

### `.writeSync(data, options = {}): void`
Synchronous version of `.write()`.

### `.safeWrite(data, options = {}): Promise<void>`
Crash-safe overwrite: writes to a temporary `.NEW` file first, then renames it over the target.

- **How:** Writes to `path + '.NEW'`, then renames that file to `path`. Since rename is atomic on most filesystems, a crash mid-write leaves the original file intact rather than corrupted/truncated.
- **When to use:** Any time you're overwriting an existing file whose previous contents matter if the write fails partway (e.g. persisted ladder data, saved replays, important config). This is the safe default for "save this file" operations.
- **Caution:** Does **not** protect against two `safeWrite` calls racing each other on the same file — use `.writeUpdate()` if multiple writes to the same path could be triggered close together.
- **Example:**
  ```ts
  await FS('config/usergroups.csv').safeWrite(csvData);
  ```

### `.safeWriteSync(data, options = {}): void`
Synchronous version of `.safeWrite()`.

### `.writeUpdate(dataFetcher, options = {}): void`
The safest way to persist frequently-changing in-memory state to disk — handles both crash-safety (via `safeWrite`) and race/throttling concerns.

- **How:** Instead of passing the data directly, you pass a *callback* (`dataFetcher`) that returns the data to write. If a write to this path is already pending/in-flight, the new callback simply replaces the old pending one (so rapid successive calls collapse into a single write of the latest data, rather than queuing redundant writes). If `options.throttle` is set, writes are spaced out to occur no more than once per `throttle` milliseconds.
- **Why a callback instead of data directly:** Because the call may be deferred (due to throttling or an in-flight write), the data must be fetched fresh at actual write-time — not at call-time — or you'd risk writing stale data.
- **When to use:** Persisting frequently-mutated in-memory state — e.g. saving room settings, battle stats, or any data structure that changes often and gets saved on every change. This avoids hammering the disk with redundant writes and avoids write-write races.
- **Example:**
  ```ts
  // Called every time room settings change; actual disk write is throttled/deduplicated
  FS('config/chatrooms.json').writeUpdate(() => JSON.stringify(Rooms.global.chatRoomData), { throttle: 5000 });
  ```
- **Caution:** No synchronous equivalent exists — there's no race to protect against in synchronous code, so just use `.safeWriteSync()` directly if you're in a sync context.

### `.writeUpdateNow(dataFetcher, options): void`
Internal helper used by `.writeUpdate()` to immediately perform a write and manage the pending-update bookkeeping. Not normally called directly from chat-plugins — call `.writeUpdate()` instead and let it decide timing.

### `.checkNextUpdate(): void`
Internal helper used by `.writeUpdate()`'s throttle timer to trigger the next pending write once the throttle window has passed. Not meant to be called directly.

### `.finishUpdate(): void`
Internal helper called after a `.writeUpdate()`-triggered write completes, to either start the next queued write or schedule the next throttle window. Not meant to be called directly.

---

## Appending

### `.append(data, options = {}): Promise<void>`
Appends data to the end of a file (creating it if it doesn't exist).

- **When to use:** Log files, modlogs, any file you're continuously adding lines to rather than overwriting.
- **Example:**
  ```ts
  await FS('logs/errors.txt').append(`${Date.now()}: ${error.message}\n`);
  ```

### `.appendSync(data, options = {}): void`
Synchronous version of `.append()`.

---

## File Management

### `.symlinkTo(target): Promise<void>`
Creates a symlink at this path pointing to `target`.

- **When to use:** Rare — e.g. linking a "latest" log file name to the most recent dated log file.

### `.symlinkToSync(target): void`
Synchronous version of `.symlinkTo()`.

### `.copyFile(dest): Promise<void>`
Copies this file to `dest`.

- **When to use:** Duplicating a file (e.g. backing up a data file before modifying it).

### `.rename(target): Promise<void>`
Renames/moves this file to `target`.

- **When to use:** Moving a file, or as the second half of a manual safe-write pattern (see `.safeWrite()`, which uses this internally).

### `.renameSync(target): void`
Synchronous version of `.rename()`.

### `.unlinkIfExists(): Promise<void>`
Deletes the file, silently doing nothing if it doesn't exist.

- **How:** Catches `ENOENT` specifically; other errors still reject.
- **When to use:** The standard way to delete a file when you don't care whether it was already missing — e.g. cleaning up a temp file, removing a cache entry. Prefer this over checking `.exists()` first.
- **Example:**
  ```ts
  await FS(`logs/tmp/${sessionId}.json`).unlinkIfExists();
  ```

### `.unlinkIfExistsSync(): void`
Synchronous version of `.unlinkIfExists()`.

---

## Directories

### `.parentDir(): FSPath`
Returns an `FSPath` for this path's parent directory.

- **When to use:** Building up paths, or as part of recursive directory creation (used internally by `.mkdirp()`).
- **Example:**
  ```ts
  const parent = FS('logs/modlog/room-battle.txt').parentDir(); // -> logs/modlog
  ```

### `.mkdir(mode = 0o755): Promise<void>`
Creates this directory. Throws if it already exists or if the parent doesn't exist.

- **When to use:** Rare directly — usually you want `.mkdirIfNonexistent()` or `.mkdirp()` instead, which handle the common "might already exist" / "parents might not exist" cases gracefully.

### `.mkdirSync(mode = 0o755): void`
Synchronous version of `.mkdir()`.

### `.mkdirIfNonexistent(mode = 0o755): Promise<void>`
Creates this directory, silently succeeding if it already exists.

- **How:** Catches `EEXIST` specifically.
- **When to use:** Ensuring a single directory exists where you know the parent already exists.

### `.mkdirIfNonexistentSync(mode = 0o755): void`
Synchronous version of `.mkdirIfNonexistent()`.

### `.mkdirp(mode = 0o755): Promise<void>`
Creates this directory **and any missing parent directories**, succeeding silently if it already exists (like `mkdir -p`).

- **How:** Tries `.mkdirIfNonexistent()`; if that fails with `ENOENT` (parent doesn't exist), recursively `mkdirp`s the parent first, then retries.
- **When to use:** The standard way to ensure a directory path exists before writing into it, especially for nested paths where you're not sure which ancestor directories already exist — e.g. setting up a new room's log directory.
- **Example:**
  ```ts
  await FS(`logs/chat/${room.roomid}`).mkdirp();
  await FS(`logs/chat/${room.roomid}/${today}.txt`).append(line);
  ```

### `.mkdirpSync(mode = 0o755): void`
Synchronous version of `.mkdirp()`.

### `.readdir(): Promise<string[]>`
Lists the names of entries (files/subdirectories) inside this directory.

- **Caution:** Throws if the directory doesn't exist — use `.readdirIfExists()` if that's a normal possibility.
- **Example:**
  ```ts
  const files = await FS('logs/modlog').readdir();
  ```

### `.readdirSync(): string[]`
Synchronous version of `.readdir()`.

### `.readdirIfExists(): Promise<string[]>`
Lists directory entries, returning `[]` instead of throwing if the directory doesn't exist.

- **When to use:** The standard way to list a directory that might not have been created yet — e.g. listing per-room log files when the room might never have generated any. Preferred over separately checking `.exists()` first.
- **Example:**
  ```ts
  const logFiles = await FS(`logs/chat/${room.roomid}`).readdirIfExists();
  ```

### `.readdirIfExistsSync(): string[]`
Synchronous version of `.readdirIfExists()`.

### `.rmdir(recursive?): Promise<void>`
Removes this directory; pass `true` to recursively remove its contents too.

- **When to use:** Cleaning up a directory and (optionally) everything inside it — e.g. purging an old room's log folder.

### `.rmdirSync(recursive?): void`
Synchronous version of `.rmdir()`.

---

## Streams

### `.createReadStream(): FileReadStream`
Returns a custom readable stream (PS's own `FileReadStream`, built on the `ReadStream` from `./streams`, not Node's native stream) for this file.

- **When to use:** Reading a large file incrementally instead of loading it entirely into memory — e.g. processing a large log file line by line.

### `.createWriteStream(options = {}): WriteStream`
Returns a writable stream for this file (overwriting).

- **How:** If `global.Config.nofswriting` is set, returns a stub `WriteStream` whose `write()` does nothing, so test code doesn't touch disk.
- **When to use:** Writing a large amount of data incrementally rather than building a full string/buffer in memory first.

### `.createAppendStream(options = {}): WriteStream`
Returns a writable stream for this file in append mode (defaults `options.flags` to `'a'`).

- **How:** Same `nofswriting` stub behavior as `.createWriteStream()`.
- **When to use:** Streaming continuous output into a growing file — e.g. a long-running log writer that keeps a stream open rather than calling `.append()` repeatedly.

---

## Watching for Changes

### `.onModify(callback): void`
Registers `callback` to run whenever the file's modification time changes.

- **How:** Wraps `fs.watchFile`, comparing `curr.mtime` to `prev.mtime`.
- **When to use:** Reacting to external edits of a file PS doesn't control itself — e.g. reloading a config file when an admin edits it directly on disk while the server is running.
- **Caution:** Uses polling (`fs.watchFile`) under the hood, not OS-level file system events, so there's some inherent latency. Don't forget to pair with `.unwatch()` when you no longer need to watch the file.

### `.unwatch(): void`
Removes all `onModify` watchers registered on this path.

- **When to use:** Cleanup — call when you no longer need to react to changes (e.g. a room/plugin being unloaded).

---

## File Info

### `.isFile(): Promise<boolean>`
Checks whether the path points to a regular file.

- **Caution:** Throws if the path doesn't exist at all (unlike `.exists()`), since it relies on `fs.stat`.

### `.isFileSync(): boolean`
Synchronous version of `.isFile()`.

### `.isDirectory(): Promise<boolean>`
Checks whether the path points to a directory.

- **Caution:** Same as `.isFile()` — throws if the path doesn't exist.

### `.isDirectorySync(): boolean`
Synchronous version of `.isDirectory()`.

### `.realpath(): Promise<string>`
Resolves the path to its canonical absolute form, following any symlinks.

- **When to use:** Rare — useful if you need to compare two `FSPath`s for actually pointing to the same underlying file, accounting for symlinks.

### `.realpathSync(): string`
Synchronous version of `.realpath()`.

---

## Special Behavior: `Config.nofswriting`

Every write-type method (`write`, `writeSync`, `append`, `appendSync`, `safeWrite`* via `write`, `writeUpdate`, `symlinkTo`*, `copyFile`*, `rename`*, `unlinkIfExists`*, `rmdir`*, `mkdir`*, `createWriteStream`, `createAppendStream`, etc.) checks `global.Config?.nofswriting` and either no-ops or returns a resolved Promise instead of touching disk when it's set.

- **Why:** This is what makes `FS` safe to use in unit tests and other contexts where real disk I/O is undesirable — code under test can call `FS(...).write(...)` freely without actually creating files, with no special test-only code paths needed in the calling code.
- **Practical implication for chat-plugins:** You never need to guard your own code with "if not in test mode" checks before calling `FS` write methods — `FS` already handles that for you globally via `Config.nofswriting`.

---

## Quick Reference Table

| Method | Category | One-line purpose |
|---|---|---|
| `FS(path)` | Entry point | Get an `FSPath` for a root-relative path |
| `.read` / `.readSync` | Reading | Read full file contents as text |
| `.readBuffer` / `.readBufferSync` | Reading | Read full file contents as binary |
| `.exists` / `.existsSync` | Reading | Check if path exists |
| `.readIfExists` / `.readIfExistsSync` | Reading | Read text, `''` if missing |
| `.write` / `.writeSync` | Writing | Overwrite file contents |
| `.safeWrite` / `.safeWriteSync` | Writing | Crash-safe overwrite (write-then-rename) |
| `.writeUpdate` | Writing | Throttled, dedup'd, crash-safe state persistence |
| `.append` / `.appendSync` | Writing | Append data to end of file |
| `.symlinkTo` / `.symlinkToSync` | File mgmt | Create a symlink to target |
| `.copyFile` | File mgmt | Copy file to destination |
| `.rename` / `.renameSync` | File mgmt | Rename/move file |
| `.unlinkIfExists` / `.unlinkIfExistsSync` | File mgmt | Delete file, ok if missing |
| `.parentDir` | Directories | Get `FSPath` of parent directory |
| `.mkdir` / `.mkdirSync` | Directories | Create directory (throws if exists) |
| `.mkdirIfNonexistent` / Sync | Directories | Create directory, ok if exists |
| `.mkdirp` / `.mkdirpSync` | Directories | Create directory + parents, ok if exists |
| `.readdir` / `.readdirSync` | Directories | List directory entries |
| `.readdirIfExists` / Sync | Directories | List entries, `[]` if missing |
| `.rmdir` / `.rmdirSync` | Directories | Remove directory |
| `.createReadStream` | Streams | Get a readable stream for the file |
| `.createWriteStream` | Streams | Get a writable stream (overwrite) |
| `.createAppendStream` | Streams | Get a writable stream (append) |
| `.onModify` | Watching | Run a callback on file modification |
| `.unwatch` | Watching | Stop watching for modifications |
| `.isFile` / `.isFileSync` | Info | Check if path is a regular file |
| `.isDirectory` / `.isDirectorySync` | Info | Check if path is a directory |
| `.realpath` / `.realpathSync` | Info | Resolve canonical path (follow symlinks) |
| `FS.ROOT_PATH` | Static | Absolute root all paths resolve against |
| `FS.FSPath` | Static | The `FSPath` class |
| `FS.FileReadStream` | Static | The internal read-stream class |
