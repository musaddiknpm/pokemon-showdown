# Impulse Coding Standards

These are the coding standards for custom plugins and modifications within the `impulse` directory. By adhering to these standards, we ensure consistency with the upstream Pokémon Showdown codebase and prevent runtime errors.

## 1. No TypeScript Enums
Avoid using TypeScript `enum`. Instead, use frozen objects with `as const`.
**Bad:**
```typescript
enum Colors {
    Red = "red",
    Blue = "blue"
}
```
**Good:**
```typescript
const Colors = {
    Red: "red",
    Blue: "blue",
} as const;
```

## 2. No `.forEach` Loops
Avoid using `.forEach()` for iterating over arrays or maps. Use `for...of` loops instead, which are faster and support `await`, `break`, and `continue`.
**Bad:**
```typescript
users.forEach(user => {
    user.send("Hello!");
});
```
**Good:**
```typescript
for (const user of users) {
    user.send("Hello!");
}
```

## 3. Use the `Utils` Module
Do not reinvent the wheel for common utility functions (like random array elements or HTML escaping). Always use the built-in `Utils` module provided by Pokémon Showdown.

**Important:** You must explicitly import `Utils` in every file where it is used.
```typescript
import { Utils } from '../../../lib'; // Adjust relative path as necessary
```

Here are the available functions and classes in the `Utils` module that you should use instead of writing custom logic:

**String & HTML Manipulation:**
- `Utils.getString(str)`: Safely converts any variable to a string without crashing.
- `Utils.escapeRegex(str)`: Escapes regex special characters in a string.
- `Utils.escapeHTML(str)`: Escapes HTML characters.
- `Utils.stripHTML(htmlContent)`: Strips HTML tags from a string.
- `Utils.normalize(message)`: Normalizes a string for searching.
- `Utils.html(strings, ...args)`: Template string tag function for automatically escaping HTML.
- `Utils.escapeHTMLForceWrap(text)`: Escapes HTML and allows long words to wrap.
- `Utils.forceWrap(text)`: Inserts zero-width spaces to force long words to wrap.
- `Utils.formatOrder(place)`: Returns the ordinal string for a number (e.g., `1st`, `2nd`).

**Arrays, Objects & Sorting:**
- `Utils.shuffle(arr)`: In-place array shuffle (Fisher-Yates).
- `Utils.randomElement(arr)`: Returns a random element from an array.
- `Utils.sortBy(array, callback?)`: Sorts an array using a smart comparator.
- `Utils.compare(a, b)`: Smart comparator for sorting (numbers low-to-high, strings A-Z, booleans true-first).
- `Utils.splitFirst(str, delimiter, limit)`: Splits a string a limited number of times.
- `Utils.deepClone(obj)`: Deeply clones an object or array.
- `Utils.deepFreeze(obj)`: Deeply freezes an object or array.

**Numbers & Math:**
- `Utils.clampIntRange(num, min, max)`: Forces a number to be an integer within a range.
- `Utils.parseExactInt(str)`: Like `parseInt`, but strict.
- `Utils.levenshtein(s, t, l)`: Calculates Levenshtein distance between two strings.

**Async & Environment:**
- `Utils.waitUntil(time)`: Returns a Promise that resolves at a specific timestamp.
- `Utils.clearRequireCache(options)`: Clears Node.js require cache.

**Data Formats & Structures:**
- `Utils.Multiset`: A specialized `Map` subclass for counting items (e.g., `set.add(key)` increments count).
- `Utils.formatSQLArray(arr, args)`: Helper for formatting SQL query variables.
- `Utils.bufFromHex(hex)`, `Utils.bufWriteHex(buf, hex)`, `Utils.bufReadHex(buf)`: Helpers for dealing with hex strings and Uint8Arrays.

## 4. Chat Error Handling
When a user inputs a bad command, do not use legacy error replies like `this.errorReply()`. Instead, throw a `Chat.ErrorMessage`.
**Bad:**
```typescript
if (!targetUser) return this.errorReply("User not found.");
```
**Good:**
```typescript
if (!targetUser) throw new Chat.ErrorMessage("User not found.");
```

## 5. Strict Equality (`===`) and Optionals (`null` vs `undefined`)
Always use strict equality (`===` and `!==`) instead of loose equality (`==` and `!=`).

However, there is **one major exception**: when checking if a value is neither `null` nor `undefined`. Pokémon Showdown generally prefers using `!foo` for this check (treating `0` and `''` similarly to `null` and `undefined`). If you specifically need to allow `0` or `''`, you may use `foo == null`.

**Optionals Convention:**
Pokémon Showdown uses `null` for optionals (a function that retrieves a possible `T` should return `T | null`). Do NOT use `undefined` or `false` for optionals in new code.

**Simulator Event Handlers (`sim/` and `data/`):**
When writing event handlers in the simulator, returning `false`, `null`, or `undefined` has highly specific functional meanings. They are not interchangeable!
- `null`: Action failed silently (e.g. Volt Absorb triggering). Suppresses standard failure messages.
- `undefined`: Action should be completely ignored (e.g. Water Absorb not triggering on Thunder Wave).
- `false`: Action failed normally.

## 6. String Quotes Convention
Use the correct quote marks based on the purpose of the string:
- Use `` ` `` (backticks) for interpolation or HTML/protocol code.
- Use `'` (single quotes) for internal IDs or strings NOT meant to be displayed to users.
- Use `"` (double quotes) for English text, names, and anything directly displayed to the user.

## 7. `||` vs `??` Fallbacks
Prefer `||` over `??` for fallbacks since Pokémon Showdown rarely treats `0`, `''`, or `false` differently from `null`. Only use `??` when you explicitly need `0`, `''`, or `false` to be preserved instead of triggering the fallback.

## 8. Anti-Magic (Getters, Setters, Proxies)
Avoid "magic" behavior like `Proxy` or custom `get`/`set` properties that trigger side effects under the hood. If setting a variable runs a function with side effects, explicitly define a `.getFoo()` or `.setFoo(value)` method instead.

## 9. Code Comments
- **Don't teach JavaScript:** Avoid commenting obvious language mechanics (e.g. `// increases by 1`).
- **Self-Documenting:** Whenever possible, prefer documenting your code by using descriptive variable names instead of comments (e.g. `const isStaff = ...` instead of `// if user is staff`).
- **Doc Comments:** Use `/** */` blocks for documenting functions/variables, which allows VS Code to display the documentation on hover.

## 10. TypeScript Safety
Avoid using the `any` type. If a type is truly unknown, use `unknown` and perform type narrowing. Whenever you create complex objects or API responses, define an `interface` or `type` for them to ensure type safety and leverage autocomplete.

## 11. Non-Blocking I/O (Crucial for Plugins)
Because Pokémon Showdown is a single-threaded Node.js server managing hundreds of active battles, **never** use synchronous file system operations (e.g., `fs.readFileSync`) inside a chat command or event handler. Always use the asynchronous versions (`FS('file.txt').read()`, `fs.promises.readFile`) so you don't block the event loop.

## 12. Hotpatch-Safe State
Avoid storing important mutable state in raw global variables at the top of a plugin file (e.g., `let activeGames = {};`). When you run `/hotpatch chat` to update code live, the module is reloaded and that local state is wiped, potentially causing memory leaks or data loss. If you must store state, attach it to a persistent object, use a database, or use proper hotpatch hooks if available.

**Reference Implementations:**
- `impulse/chat-plugins/pokerogue/database.ts`
- `impulse/chat-plugins/pokerogue/battle.ts`
- `impulse/chat-plugins/pokerogue/ai.ts`

## 13. Command Permissions
Never assume a command is safe just because it is hidden. Always explicitly check a user's permissions at the very top of sensitive commands using `this.checkCan('permission')` (e.g., `this.checkCan('lock')`) before executing any logic.

Here are the required permissions you should check for each target rank group (as defined in `config/config-example.js`):
- **Administrator (`~`)**: `this.checkCan('bypassall')`
- **Leader (`&`)**: `this.checkCan('bypassall')`
- **Room Owner (`#`)**: `this.checkCan('roommod')`
- **Moderator (`@`)**: `this.checkCan('globalban')`
- **Driver (`%`)**: `this.checkCan('kick')`
- **Voice (`+`)**: `this.checkCan('show')`

## 14. Custom Plugin Architecture
When building custom chat plugins for this server, always follow these architectural rules:
- **Placement:** All custom chat plugins MUST be placed within the `impulse/chat-plugins/` directory (never directly in the upstream `server/chat-plugins/` folder).
- **Subdirectories:** If a plugin becomes complex and requires multiple files, create a dedicated subdirectory for it inside `impulse/chat-plugins/` (e.g., `impulse/chat-plugins/my-complex-plugin/`).
- **Database Storage:** Always use Postgres via `impulse/pg.ts` for storing persistent data. Avoid writing state to arbitrary JSON files on the disk, as Postgres provides better concurrency, scalability, and safety across hotpatches.

## 15. Formatted Chat Output
Prefer `this.sendReply` with `|html|` (e.g., `this.sendReply("|html|...")`) over `this.sendReplyBox` unless you specifically want the box border that `this.sendReplyBox` provides.

## 16. Creating HTML Tables
Prefer using the `Table` helper function from `impulse/impulse-utils.ts` (e.g., `import { Table } from '../../impulse-utils'`) instead of manually constructing HTML tables. Exceptions can be made when you need to build a specialized layout or a different kind of table that cannot be represented using the standard `Table` function.
