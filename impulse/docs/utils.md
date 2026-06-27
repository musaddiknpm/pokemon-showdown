# Utils Library Reference

This document describes the utility functions exported from `utils.ts`. All functions are also available via the `Utils` namespace object for backwards compatibility (e.g. `Utils.getString(x)`), but new code should prefer named imports.

**`Utils` is not a global** — unlike some other parts of the codebase, it is not attached to the global namespace. It must always be explicitly imported from `lib/utils.ts` before use, in every file (including chat-plugins).

```ts
import { getString, escapeHTML, sortBy, ... } from '../lib/utils';
// or, for legacy-style usage:
import { Utils } from '../lib/utils';
Utils.getString(x);
```

**Design philosophy:** This library has zero dependencies and contains only generic, project-agnostic helpers. Anything Pokémon-specific belongs in `Dex` instead, and anything English-language-specific belongs in chat/i18n utilities, not here. This makes it safe to import from anywhere, including `chat-plugins`, without pulling in unwanted dependencies.

---

## String / Output Safety

### `getString(str: any): string`
Safely stringifies any value without throwing.

- **How:** Returns `` `${str}` `` only if `str` is already a `string` or `number`; otherwise returns `''`.
- **Why:** Template literals, `String()`, and `.toString()` can all throw if the value is an object with a broken/overridden `toString` (a real risk with untrusted JSON, e.g. `{"toString": "not a function"}`).
- **When to use:** Whenever you're interpolating a value of unknown/untrusted type (e.g. user input, parsed JSON, command arguments) into a string and can't guarantee it's a primitive.
- **Example (chat-plugin):**
  ```ts
  this.sendReply(`You said: ${getString(target)}`);
  ```

### `escapeHTML(str: string | number): string`
Escapes a string for safe insertion into HTML.

- **How:** Escapes `&`, `<`, `>`, `"`, `'`, `/`, and converts `\n` to `<br />`.
- **When to use:** Any time user-supplied or dynamic text is being inserted into an HTML box, chat message, or popup. This is the standard way to prevent HTML/script injection in chat output.
- **Where:** Used constantly in chat-plugins when building `/html` command output, room intros, battle messages, etc.
- **Example:**
  ```ts
  room.add(`|html|<div>${escapeHTML(user.name)} used the command.</div>`);
  ```
- **Related:** Use the `` html`...` `` template tag below instead if you're building a larger HTML string with multiple interpolations — it's less error-prone.

### `` html`...` `` (tagged template function)
Builds an HTML string while auto-escaping every interpolated value.

- **How:** Walks the template's static strings and arguments, running every argument through `escapeHTML` before concatenating.
- **When to use:** Anytime you're constructing an HTML string from a mix of static markup and dynamic/user data. Preferred over manually calling `escapeHTML` on each variable because it's harder to forget.
- **Example:**
  ```ts
  const output = html`<strong>${user.name}</strong> joined ${room.title}.`;
  room.add(`|html|${output}`);
  ```
- **Caution:** Only the interpolated *values* are escaped — the static template parts are trusted literally, so don't put untrusted content directly in the literal portion of the template.

### `escapeHTMLForceWrap(text: string): string`
Escapes HTML and inserts copy-paste-safe word-wrap hints for very long unbroken strings (e.g. long tokens, hashes, URLs).

- **How:** Runs `forceWrap` first (inserting invisible U+200B break points), then `escapeHTML`, then converts the U+200B markers to `<wbr />` tags so the wrap hints render but can't be accidentally copy-pasted into the wrapped text.
- **When to use:** Displaying long unbroken strings (replay links, hashes, IDs, long usernames) inside an HTML table or box where layout would otherwise break.
- **Example:**
  ```ts
  cell.innerHTML = escapeHTMLForceWrap(longToken);
  ```

### `forceWrap(text: string): string`
Inserts invisible zero-width-space (U+200B) break points into very long unbroken "words" (30+ non-whitespace characters) so they wrap in environments (like HTML tables) that don't support `word-wrap: break-word`.

- **How:** Finds runs of 30+ non-whitespace characters and inserts U+200B roughly every 10 characters, preferring to break right after non-alphanumeric characters (so e.g. punctuation-heavy strings break more naturally).
- **When to use:** Low-level helper — most code should use `escapeHTMLForceWrap` instead, which also escapes HTML. Use `forceWrap` directly only if you need the break points without HTML escaping (e.g. plain-text display).

### `stripHTML(htmlContent: string): string`
Removes all HTML tags from a string, leaving the text content.

- **How:** Regex-replaces anything matching `<[^>]*>` with an empty string.
- **When to use:** When you need a plain-text version of HTML content — e.g. logging an HTML chat message in a plain-text log file, or generating a notification/preview that can't contain markup.
- **Caution:** This is a naive stripper (not a full HTML parser); it's fine for cleanup/logging purposes but shouldn't be relied on as a security sanitizer.

### `escapeRegex(str: string): string`
Escapes special regex characters in a string so it can be safely used inside a `RegExp`.

- **How:** Backslash-escapes `\ ^ $ . * + ? ( ) [ ] { } |`.
- **When to use:** Whenever you're building a dynamic `RegExp` from user input or any string that isn't already a known-safe pattern (e.g. searching chat logs for a literal username that might contain regex metacharacters).
- **Example:**
  ```ts
  const pattern = new RegExp(escapeRegex(searchTerm), 'i');
  ```

---

## Formatting

### `formatOrder(place: number): string`
Converts a number into its ordinal string form (1st, 2nd, 3rd, 4th, 11th, 21st, ...).

- **How:** Special-cases the 10–20 range (always "-th"), then applies standard last-digit rules (1→st, 2→nd, 3→rd, else→th).
- **When to use:** Displaying rankings/placements to users — tournament standings, leaderboard positions, ladder placement, etc.
- **Example:**
  ```ts
  room.add(`${user.name} finished in ${formatOrder(place)} place!`);
  ```

### `formatSQLArray(arr: unknown[], args?: unknown[]): string`
Builds a SQL placeholder string (`?, ?, ?`) for an array, while optionally pushing the array's values into an external `args` array for parameterized queries.

- **How:** If `args` is provided, pushes all of `arr`'s elements onto it (mutates `args`). Returns a comma-joined string of `?` repeated `arr.length` times.
- **When to use:** Building parameterized `IN (...)` clauses for SQL queries safely (avoiding string-interpolation SQL injection).
- **Example:**
  ```ts
  const args: unknown[] = [];
  const placeholders = formatSQLArray(userIds, args);
  db.query(`SELECT * FROM users WHERE id IN (${placeholders})`, args);
  ```

---

## Debugging / Introspection

### `visualize(value: any, depth = 0): string`
Produces a readable string representation of arbitrary JS values, similar to Node's `util.inspect`, intended for debugging/eval output (e.g. a `/eval` command in chat).

- **How:** Handles primitives directly; recurses into arrays; special-cases `RegExp`/`Date`/`Function`; special-cases `Map`/`Set` (including subclasses); falls back to a custom `toString()` if one exists and isn't the default `[object Object]`; otherwise enumerates own enumerable properties (capped at depth 2 to avoid runaway output).
- **When to use:** Implementing developer/debug tools — e.g. a console `/eval` command that needs to show the result of an arbitrary expression in chat, since plain `JSON.stringify` fails on circular references, `Map`/`Set`, functions, etc.
- **Caution:** Strings are **not HTML-escaped** in the output (explicitly documented in the source) — if you're displaying `visualize()` output in HTML, you must `escapeHTML` it yourself first.
- **Example:**
  ```ts
  room.add(`|html|<pre>${escapeHTML(visualize(result))}</pre>`);
  ```

---

## Comparison / Sorting

### `compare(a: Comparable, b: Comparable): number`
A generic, type-aware comparator usable as a smarter alternative to manual comparison logic or `Array.prototype.sort`'s default behavior.

- **How / sort order:**
  - **Numbers:** low → high (`a - b`). Negate the value to reverse.
  - **Strings:** A → Z, locale-aware (`localeCompare`). Wrap in `{reverse: str}` to reverse.
  - **Booleans:** `true` sorts **before** `false` (note: this is the opposite of numeric casting). Negate (`!val`) to reverse.
  - **Arrays:** compared element-by-element, lexicographically (first differing element decides order) — useful for multi-key sorts.
- **When to use:** Anywhere you need consistent, composable sorting logic instead of writing one-off comparator functions — especially multi-key sorts (e.g. sort by wins descending, then by name ascending).
- **Example (multi-key sort without `sortBy`):**
  ```ts
  players.sort((a, b) => compare([-a.wins, a.name], [-b.wins, b.name]));
  ```
- **Type note:** `a` and `b` must be the same runtime type; TypeScript does not enforce this, so mismatches will only fail at runtime.

### `sortBy<T>(array, callback?): T[]`
Sorts an array in place using `compare()`, optionally via a key-extraction callback.

- **How:** Two overloads:
  - `sortBy(array, callback)` — sorts by `compare(callback(a), callback(b))`.
  - `sortBy(array)` — sorts elements directly via `compare(a, b)` (array elements must themselves be `Comparable`).
- **When to use:** Sorting numbers correctly (native `.sort()` sorts numbers as strings, e.g. `[10, 2]` stays `[10, 2]` instead of `[2, 10]`), or sorting by a derived key with reverse support via `{reverse: ...}` or negation.
- **Example:**
  ```ts
  // Sort players by wins (desc), tie-broken by name (asc)
  sortBy(players, p => [-p.wins, p.name]);

  // Sort plain numbers correctly
  sortBy(scores); // numeric sort, not lexicographic
  ```

---

## String Splitting

### `splitFirst(str, delimiter, limit = 1): string[]`
Like `String.prototype.split`, but guarantees the *remainder* of the string is kept intact in the last element, rather than being split further or discarded.

- **How:** Repeatedly finds the delimiter (string or regex) up to `limit` times, slicing off each piece; whatever remains after the last split becomes the final array element. Always returns exactly `limit + 1` elements.
- **Why not `String.split(delim, limit)`:** Native `.split(delimiter, limit)` *discards* everything after the `limit`-th piece rather than keeping it as a single trailing element — usually not what you want for command parsing.
- **When to use:** Parsing chat commands / arguments where you want "the first word" and "everything else" kept together, e.g. `/command target, rest of message`.
- **Example:**
  ```ts
  const [cmd, rest] = splitFirst(message, ' ');
  // "ban alice, spamming"  ->  ["ban", "alice, spamming"]

  const [target, reason] = splitFirst(rest, ',');
  // "alice, spamming"      ->  ["alice", " spamming"]
  ```

---

## Randomness

### `shuffle<T>(arr: T[]): T[]`
Shuffles an array **in place** using the Fisher-Yates algorithm, and also returns it.

- **When to use:** Randomizing turn order, randomizing a list of items/options to display, drawing a shuffled deck, etc.
- **Caution:** Mutates the original array. Clone first (`[...arr]`) if you need to preserve the original order.
- **Example:**
  ```ts
  const shuffledTeams = shuffle([...signups]);
  ```

### `randomElement<T>(arr: T[]): T`
Returns a single random element from an array.

- **When to use:** Picking a random response, random Pokémon/team/item from a list, random winner from a pool, etc.
- **Example:**
  ```ts
  const reply = randomElement(["Nice!", "Well played.", "GG!"]);
  ```

---

## Numbers

### `clampIntRange(num: any, min?: number, max?: number): number`
Coerces a value into an integer and clamps it within an optional `[min, max]` range.

- **How:** If `num` isn't a `number`, defaults to `0`. Floors the value, then clamps to `min`/`max` if provided.
- **When to use:** Sanitizing numeric user input (e.g. command arguments like "give 5 points" or pagination page numbers) where the value must be a safe, bounded integer.
- **Example:**
  ```ts
  const page = clampIntRange(parseInt(target), 1, totalPages);
  ```

### `parseExactInt(str: string): number`
A stricter version of `parseInt` that only accepts strings already in canonical integer form (no leading zeros, no whitespace, no trailing garbage, no `+` sign, optional leading `-`).

- **How:** Tests against `/^-?(0|[1-9][0-9]*)$/`; returns `NaN` if it doesn't match exactly, otherwise parses normally.
- **Why:** Plain `parseInt("5abc")` returns `5` silently, which can hide user input errors. `parseInt("007")` also succeeds even though `"007"` isn't a normalized integer string.
- **When to use:** Validating that user-provided text is *exactly* an integer (e.g. validating a room ID, a count, a numeric command argument) and rejecting anything malformed.
- **Example:**
  ```ts
  const amount = parseExactInt(target);
  if (isNaN(amount)) return this.errorReply("Please specify an exact number.");
  ```

---

## Object Utilities

### `deepClone(obj: any): any`
Recursively clones an object or array, preserving the prototype chain.

- **How:** Primitives are returned as-is; arrays are mapped recursively; objects are created via `Object.create(Object.getPrototypeOf(obj))` and have each own key recursively cloned.
- **When to use:** When you need an independent copy of a nested data structure (e.g. cloning a Pokémon set, a config object, battle state) that you can mutate without affecting the original.
- **Caution:** Does not handle circular references (will infinite-loop/stack-overflow if `obj` references itself).
- **Example:**
  ```ts
  const setCopy = deepClone(originalSet);
  setCopy.evs.atk = 252; // doesn't affect originalSet
  ```

### `deepFreeze<T>(obj: T): T`
Recursively `Object.freeze()`s an object/array and all of its nested values, safely handling circular references.

- **How:** Freezes `obj`, then recurses into array elements / object values — but checks `Object.isFrozen()` first so already-frozen (or circularly-referenced) nodes are skipped, preventing infinite loops.
- **When to use:** Locking down constant data structures (e.g. static config, default move/item data) to catch accidental mutation bugs at runtime (mutating a frozen object throws in strict mode, silently no-ops otherwise).
- **Example:**
  ```ts
  export const DEFAULT_CONFIG = deepFreeze({ maxUsers: 100, rooms: [...] });
  ```

---

## String Distance

### `levenshtein(s: string, t: string, l: number): number`
Computes the Levenshtein (edit) distance between two strings, with an early-exit optimization for performance.

- **How:** Standard dynamic-programming edit-distance algorithm, with two speed optimizations: (1) if `l` (a distance limit/threshold) is given and the strings' length difference already exceeds it, it returns immediately without running the full algorithm; (2) it also bails out early mid-computation if the diagonal cost exceeds a threshold (4).
- **When to use:** Fuzzy-matching user input against a list of known strings — e.g. "did you mean...?" suggestions for mistyped commands, Pokémon names, or move names. Pass a small `l` (e.g. the max distance you'd consider a "close enough" match) for better performance on large lookups.
- **Example:**
  ```ts
  const suggestion = validCommands.find(cmd => levenshtein(input, cmd, 3) <= 2);
  if (suggestion) this.errorReply(`Did you mean "${suggestion}"?`);
  ```

---

## Async / Timing

### `waitUntil(time: number): Promise<void>`
Returns a Promise that resolves at a specific Unix timestamp (ms), rather than after a fixed delay.

- **How:** Internally calls `setTimeout` with `time - Date.now()` as the delay.
- **When to use:** Scheduling something to happen at an absolute point in time (e.g. "resume the tournament at this timestamp") rather than "in N milliseconds from now" — clearer intent and avoids drift if there's a delay between calculating the target time and calling the function.
- **Example:**
  ```ts
  await waitUntil(battle.startTime);
  startBattle();
  ```

---

## Buffers / Hex

### `bufFromHex(hex: string): Uint8Array`
Converts a hex string into a new `Uint8Array`.

- **When to use:** Decoding hex-encoded binary data (tokens, hashes, IDs) received as text, e.g. from a database or network payload.
- **Example:**
  ```ts
  const tokenBytes = bufFromHex(storedHexToken);
  ```

### `bufWriteHex(buf: Uint8Array, hex: string, offset = 0): void`
Writes hex-decoded bytes into an existing buffer at a given offset, instead of allocating a new one.

- **When to use:** When you already have a pre-allocated buffer (e.g. part of a larger packet) and want to write hex-decoded bytes into a specific section of it, avoiding an extra allocation.
- **Example:**
  ```ts
  bufWriteHex(packet, "deadbeef", 4); // write 4 bytes starting at offset 4
  ```

### `bufReadHex(buf: Uint8Array, start = 0, end?: number): string`
Converts a `Uint8Array` (or a slice of one) into a lowercase hex string.

- **When to use:** Encoding binary data (hashes, tokens, IDs) into hex for storage, logging, or transmission as text.
- **Example:**
  ```ts
  const hex = bufReadHex(hashBytes); // "deadbeef..."
  ```

---

## Data Structures

### `class Multiset<T> extends Map<T, number>`
A multiset (a.k.a. counting bag) implementation — a `Map` from item to count, where missing keys read as `0` instead of `undefined`.

- **Methods:**
  - `get(key)` — returns the count for `key`, or `0` if not present (overrides `Map.get`, never returns `undefined`).
  - `add(key)` — increments `key`'s count by 1 (creates the entry if needed). Returns `this`, chainable.
  - `remove(key)` — decrements `key`'s count by 1; if the count drops to `0` or below, deletes the entry entirely. Returns whether the entry still exists logically (note: return value semantics — check source if exact branch behavior matters for your use case).
- **When to use:** Counting occurrences of items without manually checking "does this key exist yet" — e.g. counting votes, counting how many times each user has used a command, tallying move/item usage stats.
- **Example:**
  ```ts
  const votes = new Multiset<string>();
  for (const vote of allVotes) votes.add(vote);
  const topChoice = sortBy([...votes.keys()], k => -votes.get(k))[0];
  ```

---

## Module-Level Utilities (Node-specific)

> These two are Node.js-specific (use the `require` cache) and generally only relevant to server-side infrastructure code (e.g. hot-reloading), not typical chat-plugin logic.

### `clearRequireCache(options?: { exclude?: string[] }): void`
Clears Node's `require.cache`, excluding `node_modules` and any additional paths specified, so that subsequent `require()` calls re-load fresh module code from disk.

- **When to use:** Implementing a hot-reload command (e.g. `/reload chat-plugins`) that needs to pick up edited source files without restarting the whole process.

### `uncacheModuleTree(mod: NodeJS.Module, excludes: string[]): void`
Recursively detaches a module's children from Node's internal module-children tracking, used internally by `clearRequireCache` to properly break references during cache invalidation.

- **When to use:** Internal helper for `clearRequireCache` — you generally won't call this directly from chat-plugins.

---

## Types

### `type Comparable = number | string | boolean | Comparable[] | { reverse: Comparable }`
The type accepted by `compare()` and `sortBy()`. Use this type when writing your own key-extraction callbacks for `sortBy`, so TypeScript validates your sort keys are actually sortable.

```ts
function sortKey(player: Player): Comparable {
  return [-player.wins, player.name]; // wins desc, name asc
}
```

---

## Quick Reference Table

| Function | Category | One-line purpose |
|---|---|---|
| `getString` | String safety | Crash-proof stringify |
| `escapeHTML` | HTML safety | Escape a string for HTML output |
| `html` | HTML safety | Tagged template, auto-escapes interpolations |
| `escapeHTMLForceWrap` | HTML safety | Escape HTML + wrap-hint long words |
| `forceWrap` | HTML safety | Insert wrap hints into long words |
| `stripHTML` | HTML safety | Remove HTML tags from a string |
| `escapeRegex` | String safety | Escape regex metacharacters |
| `formatOrder` | Formatting | Number → ordinal string (1st, 2nd...) |
| `formatSQLArray` | Formatting | Build SQL `?` placeholders |
| `visualize` | Debugging | Readable string of any value (eval output) |
| `compare` | Sorting | Generic typed comparator |
| `sortBy` | Sorting | Sort array via `compare`/key callback |
| `splitFirst` | String parsing | Split string, keep remainder intact |
| `shuffle` | Randomness | In-place Fisher-Yates shuffle |
| `randomElement` | Randomness | Random element from array |
| `clampIntRange` | Numbers | Coerce + clamp to integer range |
| `parseExactInt` | Numbers | Strict integer parsing |
| `deepClone` | Objects | Recursive clone |
| `deepFreeze` | Objects | Recursive freeze (cycle-safe) |
| `levenshtein` | Strings | Edit distance (with early exit) |
| `waitUntil` | Async | Promise resolving at an absolute timestamp |
| `bufFromHex` | Buffers | Hex string → `Uint8Array` |
| `bufWriteHex` | Buffers | Write hex into existing buffer |
| `bufReadHex` | Buffers | `Uint8Array` → hex string |
| `Multiset` | Data structure | Counting map (missing keys = 0) |
| `clearRequireCache` | Node infra | Clear `require.cache` (hot reload) |
| `uncacheModuleTree` | Node infra | Internal helper for cache clearing |
