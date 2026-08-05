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
Do not reinvent the wheel for common utility functions (like random numbers, HTML escaping, or ID generation). Always use the built-in `Utils` module provided by Pokémon Showdown.
- Use `Utils.escapeHTML(str)` instead of custom escaping.
- Use `Utils.randomElement(array)` instead of `Math.random()`.
- Use `Utils.random(max)` instead of `Math.floor(Math.random() * max)`.

**Important:** You must explicitly import `Utils` in every file where it is used.
```typescript
import { Utils } from '../../../lib'; // Adjust relative path as necessary
```

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

## 13. Command Permissions
Never assume a command is safe just because it is hidden. Always explicitly check a user's permissions at the very top of sensitive commands using `this.checkCan('permission')` (e.g., `this.checkCan('lock')`) before executing any logic.

## 14. Custom Plugin Architecture
When building custom chat plugins for this server, always follow these architectural rules:
- **Placement:** All custom chat plugins MUST be placed within the `impulse/chat-plugins/` directory (never directly in the upstream `server/chat-plugins/` folder).
- **Subdirectories:** If a plugin becomes complex and requires multiple files, create a dedicated subdirectory for it inside `impulse/chat-plugins/` (e.g., `impulse/chat-plugins/my-complex-plugin/`).
- **Database Storage:** Always use Postgres via `impulse/pg.ts` for storing persistent data. Avoid writing state to arbitrary JSON files on the disk, as Postgres provides better concurrency, scalability, and safety across hotpatches.
