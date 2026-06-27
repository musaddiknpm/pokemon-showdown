# SQL Library Reference

This document describes the `SQL` abstraction layer exported from `sql.ts`. It wraps `better-sqlite3` (a synchronous SQLite driver) behind a worker-thread query process manager, so that synchronous, potentially slow SQLite calls don't block PS's main process.

**`SQL` is not a global** — it must always be explicitly imported from `lib/sql.ts` before use, in every file (including chat-plugins).

```ts
import { SQL } from '../lib/sql';

const database = SQL('my-feature', module, { file: 'databases/my-feature.db' });
```

**Design philosophy:**
- `better-sqlite3` is synchronous by nature (it blocks the thread while a query runs). This module pushes that work onto a separate worker process via `QueryProcessManager`, so a slow query doesn't freeze chat/battles for everyone.
- All query methods (`.get`, `.all`, `.run`, `.exec`, `.transaction`) return Promises from the *parent process* even though the underlying driver is synchronous — under the hood they're sent to the worker and the result comes back asynchronously.
- `DatabaseTable<T>` provides a typed, higher-level "table" wrapper (`select`/`update`/`delete`/`insert` helpers) on top of the lower-level `SQLDatabaseManager` so most chat-plugin code never needs to write raw SQL strings by hand.

---

## ⚠️ Memory & CPU Consumption — Read Before Using

SQL databases opened through this module are **not free**, and misuse here is more likely than with `Utils`/`FS`/`Net` to cause server-wide resource issues. Keep the following in mind:

- **Each `SQL(...)` call spins up a separate worker process** (via `QueryProcessManager`), each holding its own SQLite connection and memory. **Do not call `SQL(...)` repeatedly** (e.g. inside a command handler, on every chat message, or in a loop) — call it **once per database, at module load time**, and reuse the returned `SQLDatabaseManager` for all subsequent queries. Treat the factory call itself like a singleton constructor, not a per-query helper.
- **Prepared statements are cached indefinitely** in `this.state.statements` (a `Map`) inside the worker, and are never automatically evicted. If you generate many distinct SQL strings dynamically (e.g. building slightly different SQL text per call instead of using bound parameters), each unique string becomes a permanently cached statement object — this is a memory leak in practice. Always parameterize values (`?` placeholders / `SQLStatement` tagged templates) rather than interpolating values directly into the SQL text, both for security (SQL injection) and so the same statement gets reused/cached instead of multiplying.
- **`.transaction()` and registered functions run inside the SQLite worker process**, not the main process. Heavy CPU work done inside a transaction callback or a registered function (`registerFunction`) still blocks *that* worker (defeating the purpose of offloading it), and large transactions hold a lock on the database file for their duration — keep transaction callbacks fast and minimal.
- **Large result sets are fully buffered in memory** before being returned — `.all()` loads every matching row into memory at once (both in the worker and again when passed back to the parent process). For large tables, always use `LIMIT`/pagination (e.g. via `selectAll`'s `where` clause) rather than fetching entire tables, especially in any code path that runs per-user or per-message.
- **`runFile()` reads an entire SQL file into memory** (via `FS(file).read()`) before executing it — fine for migrations/schema files, but don't use it as a way to "stream" large amounts of SQL.
- **Each worker process consumes its own OS-level memory and a process slot.** Opening many separate `SQL(...)` databases (rather than using multiple tables within one database file) multiplies this overhead. Prefer one database file with multiple tables (via `DatabaseTable`) over many separate database files/managers unless you have a specific reason to isolate them (e.g. different crash-isolation needs).

In short: **construct once, parameterize always, paginate large reads, and keep transactions/functions lightweight.**

---

## Entry Point

### `SQL(id, module, options): SQLDatabaseManager`
The main factory function. Creates (or attaches to) a worker-process-backed SQLite database connection.

- **Parameters:**
  - `id: string` — a unique identifier for this database's worker process manager.
  - `module: NodeJS.Module` — pass Node's `module` object from the calling file (required by the underlying `QueryProcessManager`).
  - `options: SQLOptions` — see Types below; at minimum requires `file` (path to the SQLite file).
- **How:** Throws if called with the old 3-argument process-count signature (no longer supported), and throws if `options` is missing entirely. Otherwise constructs a `SQLDatabaseManager`.
- **When to use:** Once, at the top of a module that owns a particular database — store the result in a module-level constant and import/reuse that constant elsewhere, rather than calling `SQL(...)` again.
- **Example:**
  ```ts
  // databases/economy.ts — call once, at module scope
  export const economyDB = SQL('economy', module, {
      file: 'databases/economy.db',
      extension: 'databases/economy-extension.js',
  });
  ```

`SQL` also exposes static members:
- `SQL.DatabaseTable` — the `DatabaseTable` class (for building typed table wrappers).
- `SQL.SQLDatabaseManager` — the `SQLDatabaseManager` class (for typing/instanceof checks).
- `SQL.tables` — a global `Map<string, DatabaseTable<any>>` that every constructed `DatabaseTable` automatically registers itself into, keyed by table name. Useful for introspection/debugging across all tables in the process.
- `SQL.SQL` — the `sql-template-strings` tagged-template function (aliased as `SQL.SQL`), used to safely build parameterized queries (see below). Throws at call-time if `sql-template-strings` isn't installed.

---

## Building Queries Safely: the `SQL.SQL` Tagged Template

```ts
import { SQL } from '../lib/sql';
const query = SQL.SQL`SELECT * FROM users WHERE id = ${userId}`;
```

- **How:** Values interpolated into the template (e.g. `${userId}`) are automatically turned into bound `?` parameters rather than being inserted into the SQL text directly — this is what protects against SQL injection. The resulting `SQLStatement` object has `.sql` (the parameterized SQL text) and `.values` (the bound parameter array), and supports `.append(...)` to build a query incrementally across multiple template/string pieces (used heavily inside `DatabaseTable`'s methods).
- **When to use:** Anytime you're building a query that includes a dynamic value (user input, IDs, search terms). **Never** concatenate/interpolate values directly into a raw SQL string — always go through `SQL.SQL` (or the `DatabaseTable` helper methods, which do this for you).
- **Example (manual query against the lower-level manager):**
  ```ts
  const row = await economyDB.get(SQL.SQL`SELECT balance FROM accounts WHERE userid = ${userid}`.sql, 
                                    SQL.SQL`SELECT balance FROM accounts WHERE userid = ${userid}`.values);
  // In practice, prefer DatabaseTable methods (below) over doing this by hand.
  ```

---

## `SQLDatabaseManager` — Low-Level Database Access

Returned by `SQL(id, module, options)`. Represents one database connection (backed by a worker process). Most chat-plugin code should prefer `DatabaseTable` (below) for typed table operations, and reach for these methods directly only for raw/ad-hoc SQL.

### `.get<T>(statement, data = [], noPrepare?): Promise<T>`
Runs a statement and returns the **first matching row**.

- **Parameters:** `statement` — a SQL string or a `Statement` object (see `.prepare()` below). `data` — bound parameter values (array or object, matching `?`/named placeholders in the statement). `noPrepare` — if `true`, requires the statement to already be cached (skips re-preparing it); throws if it isn't found.
- **When to use:** Fetching a single row by key — e.g. looking up one user's record.
- **Example:**
  ```ts
  const user = await economyDB.get('SELECT * FROM accounts WHERE userid = ?', [userid]);
  ```

### `.all<T>(statement, data = [], noPrepare?): Promise<T[]>`
Same as `.get()`, but returns **all** matching rows as an array.

- **Caution:** See the memory note above — this buffers every matching row in memory. Add `LIMIT` to your SQL for potentially large result sets.
- **Example:**
  ```ts
  const topAccounts = await economyDB.all('SELECT * FROM accounts ORDER BY balance DESC LIMIT 10');
  ```

### `.run(statement, data = [], noPrepare?): Promise<sqlite.RunResult>`
Executes a statement that modifies data (INSERT/UPDATE/DELETE) rather than reading rows. Resolves with `better-sqlite3`'s `RunResult` (contains `changes` and `lastInsertRowid`).

- **Example:**
  ```ts
  const result = await economyDB.run('UPDATE accounts SET balance = balance + ? WHERE userid = ?', [100, userid]);
  console.log(result.changes); // number of rows updated
  ```

### `.exec(data: string): Promise<{ changes: number }>`
Executes raw SQL text directly (via SQLite's `exec`, which can run multiple statements separated by `;`, unlike `.run()`/`.get()`/`.all()` which run one prepared statement).

- **When to use:** Running schema definitions, migrations, or any SQL that isn't a simple parameterized single statement (e.g. `CREATE TABLE ...; CREATE INDEX ...;`).
- **Caution:** Does not support bound parameters — never interpolate untrusted/dynamic values into the string passed here. Reserve this for static schema/migration SQL.
- **Example:**
  ```ts
  await economyDB.exec(`CREATE TABLE IF NOT EXISTS accounts (userid TEXT PRIMARY KEY, balance INTEGER DEFAULT 0)`);
  ```

### `.prepare(statement: string): Promise<Statement | null>`
Pre-compiles and caches a SQL statement in the worker, returning a `Statement` wrapper object you can call `.run()`/`.all()`/`.get()` on directly without re-sending the SQL text each time.

- **When to use:** A statement you'll execute many times with different parameters (e.g. inside a hot loop or a frequently-hit command) — preparing once and reusing the `Statement` object avoids redundant prepare overhead and is slightly more efficient than passing the same string repeatedly (which gets cached anyway via `.get()`/`.all()`/`.run()`, but an explicit `Statement` object is clearer code).
- **Example:**
  ```ts
  const getBalance = await economyDB.prepare('SELECT balance FROM accounts WHERE userid = ?');
  const balance = await getBalance.get([userid]);
  ```

### `.transaction<T>(name: string, data = []): Promise<T>`
Runs a named transaction (registered ahead of time via the `extension` file's `transactions` export — see `handleExtensions` below) inside the worker process.

- **When to use:** Grouping multiple writes that must succeed or fail together (e.g. transferring currency between two accounts: debit one, credit the other, atomically).
- **Caution:** Runs in the worker process — keep the transaction function itself fast; it holds a database lock for its duration (see Memory & CPU note above).

### `.loadExtension(filepath: string): Promise<...>`
Loads a SQLite extension file (native `.so`/`.dll` extension, not the JS "extension" concept used by `options.extension`/`loadExtensionFile`) into the live database connection.

- **When to use:** Rare — only if you need a native SQLite extension (e.g. a full-text-search or crypto extension) loaded into the database at runtime.

### `.runFile(file: string): Promise<{ changes: number }>`
Reads a SQL file from disk (via `FS(file).read()`) and executes its full contents via `.exec()`.

- **When to use:** Running a schema/migration `.sql` file at startup.
- **Caution:** Loads the whole file into memory first — fine for typical schema files, but don't rely on this for huge SQL dumps.
- **Example:**
  ```ts
  await economyDB.runFile('databases/schemas/economy.sql');
  ```

### `.registerFunction(key, cb): void`
Registers a custom SQL function (callable from SQL text as `key(...)`) on the database connection.

- **When to use:** Adding custom logic usable inside SQL (e.g. a custom string-comparison or hashing function) that isn't built into SQLite.
- **Caution:** Runs in the worker process and is called synchronously by SQLite for every row it's applied to — keep the callback fast (see Memory & CPU note).

### `.loadExtensionFile(extension: string) / .handleExtensions(imports)`
Internal setup methods, invoked automatically (via `options.extension`) when the database is initialized — load a JS file exporting `functions`, `transactions`, `statements`, and/or an `onDatabaseStart` hook, and wire them into the live database (registering functions, preparing transactions/statements, and running any startup migration logic). You generally won't call these directly — instead, point `options.extension` at a file with the expected exports when constructing the database via `SQL(...)`.

### `.setupDatabase(): void`
Internal — lazily opens the actual `better-sqlite3` connection the first time it's needed (in the worker) or immediately if running in a non-parent (worker) process. Not meant to be called directly.

---

## `Statement<R, T>` — Prepared Statement Wrapper

Returned by `SQLDatabaseManager.prepare()`. A thin convenience wrapper that remembers which SQL string it represents.

- `.run(data: R)` — equivalent to `db.run(this.statement, data)`.
- `.all(data: R)` — equivalent to `db.all<T>(this.statement, data)`.
- `.get(data: R)` — equivalent to `db.get<T>(this.statement, data)`.
- `.toString()` / `.toJSON()` — both return the raw SQL string (so a `Statement` can be passed anywhere a string is expected, e.g. directly into `.all()`/`.get()`/`.run()` on the manager).

---

## `DatabaseTable<T>` — High-Level Table Wrapper

The recommended way to interact with a specific table — wraps common CRUD patterns so you rarely need to write raw SQL by hand. Automatically registers itself into the global `SQL.tables` map by name.

```ts
const accounts = new SQL.DatabaseTable<{ userid: string, balance: number }>('accounts', 'userid', economyDB);
```

### `.selectAll<R>(entries, where?): Promise<R[]>`
Builds and runs a `SELECT ... FROM <table> [WHERE ...]` query.

- **Parameters:** `entries` — either a column-list string (e.g. `'*'` or `'userid, balance'`) or an array of column name strings. `where` — an optional `SQLStatement` (built via `SQL.SQL`) for the WHERE clause.
- **When to use:** Fetching multiple rows matching a condition.
- **Example:**
  ```ts
  const rich = await accounts.selectAll('*', SQL.SQL`balance > ${1000}`);
  ```

### `.selectOne<R>(entries, where?): Promise<R | null>`
Same as `.selectAll()`, but appends `LIMIT 1` and returns just the first row (or `null` if none matched).

- **Example:**
  ```ts
  const account = await accounts.selectOne('*', SQL.SQL`userid = ${userid}`);
  ```

### `.get(entries, keyId): Promise<R | null>`
Convenience shortcut for `.selectOne()` filtered by this table's primary key.

- **When to use:** The most common lookup — "get this table's row by its primary key."
- **Example:**
  ```ts
  const account = await accounts.get('*', userid); // WHERE userid = ?
  ```

### `.insert(colMap, rest?, isReplace = false): Promise<{ changes: number }>`
Builds and runs an `INSERT INTO <table> (...) VALUES (...)` (or `REPLACE INTO` if `isReplace` is `true`).

- **Parameters:** `colMap` — a partial object of column → value to insert. `rest` — an optional `SQLStatement` appended after the VALUES clause (e.g. an `ON CONFLICT` clause).
- **Example:**
  ```ts
  await accounts.insert({ userid: 'ash', balance: 0 });
  ```

### `.replace(cols, rest?): Promise<{ changes: number }>`
Shortcut for `.insert(cols, rest, true)` — i.e. `REPLACE INTO` instead of `INSERT INTO`.

- **When to use:** "Insert, or overwrite if the primary key already exists" semantics.

### `.updateAll(toParams, where?, limit?): Promise<{ changes: number }>`
Builds and runs an `UPDATE <table> SET ... [WHERE ...] [LIMIT ...]` across all matching rows.

- **Example:**
  ```ts
  await accounts.updateAll({ balance: 0 }, SQL.SQL`balance < ${0}`);
  ```

### `.updateOne(to, where?): Promise<{ changes: number }>`
Same as `.updateAll()`, but appends `LIMIT 1`.

### `.update(primaryKey, data): Promise<{ changes: number }>`
Convenience shortcut for `.updateOne()` filtered by this table's primary key.

- **Example:**
  ```ts
  await accounts.update(userid, { balance: 500 });
  ```

### `.deleteAll(where?, limit?): Promise<{ changes: number }>`
Builds and runs a `DELETE FROM <table> [WHERE ...] [LIMIT ...]`.

- **Caution:** Calling with no `where` deletes **every row in the table** — always double-check a `where` clause is supplied unless that's genuinely intended.

### `.deleteOne(where): Promise<{ changes: number }>`
Same as `.deleteAll()`, but appends `LIMIT 1`.

### `.delete(keyEntry): Promise<{ changes: number }>`
Convenience shortcut for `.deleteOne()` filtered by this table's primary key.

- **Example:**
  ```ts
  await accounts.delete(userid);
  ```

### `.run(sql: SQLStatement) / .all<R>(sql: SQLStatement)`
Catch-all escape hatches for queries that don't fit the helper methods above — pass a manually built `SQLStatement` (via `SQL.SQL`) and it's run directly against the underlying `SQLDatabaseManager`.

- **When to use:** Complex joins, aggregates, or anything the CRUD helpers above don't cleanly express.
- **Example:**
  ```ts
  const top = await accounts.all(SQL.SQL`SELECT userid, balance FROM accounts ORDER BY balance DESC LIMIT 10`);
  ```

---

## Errors

### `class HttpError` — *not present in this file*; not applicable here.

### Error handling via `options.onError`
`SQLOptions.onError` lets you intercept errors instead of the default crashlog-and-reject behavior.

- **How:** Called as `onError(error, query, isParentProcess)`. If it's invoked from the worker (`isParentProcess: false`) and returns a truthy value, that value is sent back as the query's result instead of throwing. If invoked from the parent (`isParentProcess: true`, after the worker reports an error) and returns a truthy value, that value is returned from `.query()` instead of throwing.
- **When to use:** Custom error recovery/logging for a specific database — e.g. returning a default value instead of crashing on a constraint violation, or routing errors to a custom logger.

---

## Types

| Type | Purpose |
|---|---|
| `SQLOptions` | Constructor options: `file`, `extension?`, `sqliteOptions?`, `onError?` |
| `SQLInput` | `string \| number \| null` — a single bindable SQL value |
| `ResultRow` | `{ [k: string]: SQLInput }` — a generic row shape |
| `TransactionEnvironment` | `{ db, statements }` passed into named transaction functions |
| `DatabaseQuery` | Internal discriminated-union message type sent to the worker (`prepare`/`all`/`exec`/`get`/`run`/`transaction`/`start`/`load-extension`) — not something you construct directly |
| `DB_NOT_FOUND` | Exported constant, currently just `null` — returned/used to represent "no database" in places that need an explicit sentinel |

`SQL` also re-exports these as a namespace for convenience: `SQL.DatabaseManager`, `SQL.Statement`, `SQL.Options`, `SQL.TransactionEnvironment`, `SQL.Query`, `SQL.DatabaseTable<T>`.

---

## Quick Reference Table

| Member | Category | One-line purpose |
|---|---|---|
| `SQL(id, module, options)` | Entry point | Create/get a worker-backed database connection (call ONCE per db) |
| `SQL.SQL\`...\`` | Query building | Parameterized tagged-template query builder (always use for dynamic values) |
| `.get` / `.all` / `.run` | SQLDatabaseManager | Read one row / read many rows / execute a write |
| `.exec` | SQLDatabaseManager | Run raw multi-statement SQL (schema/migrations only) |
| `.prepare` | SQLDatabaseManager | Pre-compile + cache a statement, get a `Statement` wrapper |
| `.transaction` | SQLDatabaseManager | Run a named atomic transaction in the worker |
| `.runFile` | SQLDatabaseManager | Read + exec an entire `.sql` file |
| `.registerFunction` | SQLDatabaseManager | Add a custom function callable from SQL |
| `Statement.run/.all/.get` | Statement | Execute a previously prepared statement |
| `DatabaseTable.selectAll/.selectOne/.get` | DatabaseTable | Typed SELECT helpers |
| `DatabaseTable.insert/.replace` | DatabaseTable | Typed INSERT / REPLACE helpers |
| `DatabaseTable.updateAll/.updateOne/.update` | DatabaseTable | Typed UPDATE helpers |
| `DatabaseTable.deleteAll/.deleteOne/.delete` | DatabaseTable | Typed DELETE helpers |
| `DatabaseTable.run/.all` | DatabaseTable | Escape hatch for raw `SQLStatement` queries |
| `options.onError` | Error handling | Custom error interception per database |
| `SQL.tables` | Static | Global map of all constructed `DatabaseTable`s by name |

---

## Summary: Resource Usage Checklist

- [ ] Call `SQL(...)` **once** per database, at module load time — store and reuse the manager.
- [ ] Always parameterize dynamic values via `SQL.SQL` template strings — never interpolate raw values into SQL text.
- [ ] Add `LIMIT`/pagination to any `.all()`/`selectAll()` call that could return a large or unbounded number of rows.
- [ ] Keep `.transaction()` callbacks and `registerFunction()` callbacks fast — they run synchronously in the worker and block it.
- [ ] Prefer one database file with multiple `DatabaseTable`s over many separate `SQL(...)` databases, to avoid multiplying worker-process overhead.
- [ ] Reserve `.exec()` / `.runFile()` for static schema/migration SQL, not per-request dynamic queries.
