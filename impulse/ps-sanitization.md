# Impulse Server Developer Guide: HTML & CSS Sanitization

As a developer writing custom chat-plugins or editing styles for the Impulse server, you need to understand how Pokémon Showdown processes HTML and CSS. If you've ever had your JSX tables randomly break, your CSS overlays disappear, or your custom buttons fail to work, it's likely due to the built-in sanitization pipeline.

Here is exactly what happens to your code between your plugin and the user's screen.

---

## 1. Handling User Input (Preventing XSS)
When you write a custom command that takes user input and displays it back to the room (e.g., a custom profile or custom announcement), **you are responsible for escaping it.** 

If you take a `target` string and inject it directly into `this.sendReplyBox(target)`, a malicious user could pass `<script>alert(1)</script>` or `<img src=x onerror=...>` to exploit the room.

**Developer Rule:** Always sanitize raw user input using `Utils.escapeHTML()` before injecting it into your JSX or HTML strings.
```typescript
// BAD: XSS Vulnerability
this.sendReplyBox(`<div>Welcome, ${user.name}!</div>`);

// GOOD: Safe
import {Utils} from '../../../lib';
this.sendReplyBox(`<div>Welcome, ${Utils.escapeHTML(user.name)}!</div>`);
```
*Note: If you are using Preact/JSX in `core.tsx`, JSX often escapes variables automatically, but you should still be cautious when dealing with raw HTML strings.*

---

## 2. Server-Side Validation (`this.checkHTML`)
If you are building a command that explicitly allows users to input HTML (like a custom `!htmlbox`), you must run the input through `this.checkHTML(target)`. 

Even as a developer, you need to be aware of the strict rules `checkHTML` enforces on your output:
- **Strict Tag Matching**: If your plugin generates HTML with a missing closing tag (e.g., `<div><span>...</div>`), `checkHTML` will throw a runtime error and crash the command.
- **Image Constraints**: `<img>` tags **must** include explicit `width` and `height` attributes. If your plugin dynamically generates images without them, the server rejects it to prevent chat auto-scroll breaking when the images finally load.
- **Button Security**: If your plugin creates `<button>` elements, be extremely careful. Unless the room is public and the user has high auth, buttons are strictly limited to:
  1. Standard URLs wrapped in an `<a>` tag.
  2. Sending PMs to a verified Room Bot (`*` rank). You cannot create a button that forces a user to execute `/leave` or `/givemoney`.
- **Banned Words**: Never use the phrases "click here" or ">here<" in your plugin's HTML output. Design Standard #2 strictly bans this, and the server will throw a hard error.

---

## 3. Client-Side Sanitization (Google Caja)
The server actually trusts the client to do the heavy security lifting. When your plugin sends `|html|` or `this.sendReplyBox()` to the client, the PS web client runs it through a strict DOM sanitizer (specifically, a minified version of [Google's Caja HTML Sanitizer](https://github.com/smogon/pokemon-showdown-client/blob/master/pokemonshowdown.com/js/html-sanitizer-minified.js)).

If your plugin's output seems to mysteriously lose its interactivity, this is why:
- **Event Handlers**: The Caja sanitizer completely strips all inline JavaScript execution. Do not attempt to use `onclick`, `onload`, `onmouseover`, etc., in your plugin JSX/HTML. They will silently disappear on the client side.
- **Scripts**: `<script>` tags injected by plugins will be stripped and ignored by the client. 

---

## 4. Inline CSS Restrictions (`style="..."`)
When writing JSX components for chat plugins (e.g., `<div style={{...}}>`), your inline CSS is heavily restricted by the client to prevent layout hijacking and clickjacking.

The client-side sanitizer will silently strip the following from your inline styles:
- **Layout Hijacking**: `position: absolute`, `position: fixed`. You must rely on `relative`, `static`, or flexbox for your plugin layouts.
- **Overlays**: `z-index` is stripped.
- **Invisibility**: `opacity` and `visibility: hidden` are heavily restricted to prevent invisible click traps.
- **Out of Bounds**: Negative `margin` values are blocked so your plugin cannot break out of the chatbox container.
- **Fake Cursors**: `cursor` properties and `pointer-events: none` are stripped.

---

## 5. `custom.css` (Server Customization)
If you run a custom server (like `impulse-server`), you can write a `config/custom.css` file to customize the layout.

However, if your users are connecting via the official `play.pokemonshowdown.com` web client, **your `custom.css` is NOT served directly as a raw file.** Instead, the PS web client fetches your CSS through a PHP script (`customcss.php`) which strictly sanitizes it using the **Wikimedia CSS Sanitizer**.

Because of this, `custom.css` is actually subjected to severe restrictions:
- **`@import` Rules are Blocked**: The Wikimedia CSS Sanitizer strictly drops all `@import` statements. You cannot import external stylesheets (like Google Fonts or external themes) into your `custom.css`, because external files could bypass the sanitizer. All CSS must be written directly in the file.
- **Layout Restrictions**: `position: fixed` and `position: absolute` are heavily restricted or dropped entirely to prevent custom servers from overlaying fake buttons over the main PS client UI (like the server list or login button).
- **Data URIs & External Assets**: URLs in `background-image` are heavily validated to ensure they are standard `http`/`https` images and not `javascript:` execution vectors.
- **Browser-Specific Hacks**: Features like `-moz-binding` or old IE `expression()` are completely dropped.

### Troubleshooting Missing CSS
If your `custom.css` seems to be missing styles on the live client, it is because the Wikimedia PHP sanitizer dropped them. 
- **Do not try to `@import` external files**. It will not work.
- If you need custom fonts or massive CSS themes, they must be manually pasted directly into your `custom.css` file so the sanitizer can validate every single rule line-by-line.
