# Net Library Reference

This document describes the `Net` abstraction layer exported from `net.ts`. It wraps Node's `http`/`https` modules to make outgoing web requests easier and centrally controllable.

**`Net` is not a global** — it must always be explicitly imported from `lib/net.ts` before use, in every file (including chat-plugins).

```ts
import { Net } from '../lib/net';

const body = await Net('https://example.com/api').get();
```

**Design philosophy / advantages over raw `http`/`https`:**
- Simpler call shape for the common case: `Net(url).get()` instead of manually choosing `http` vs `https`, building options, and buffering the response stream yourself.
- Centralized kill switch — setting `Config.noNetRequests` disables **all** outgoing requests made through `Net` at once, which is useful for sandboxes, tests, or emergency lockdown without hunting down every call site.
- Automatic protocol selection (`http` vs `https`) based on the URL.
- Returns a real Promise-friendly stream/string API instead of Node's callback/event-based request API.

---

## Entry Point

### `Net(uri: string): NetRequest`
The main entry point. Returns a `NetRequest` object bound to `uri`, on which you call `.get()`, `.post()`, or `.getStream()`.

- **When to use:** Always start here for any outgoing HTTP(S) call.
- **Example:**
  ```ts
  const weather = await Net('https://api.example.com/weather').get({ query: { city: 'Pune' } });
  ```

`Net` also exposes static members for advanced use:
- `Net.NetRequest` — the `NetRequest` class, if you need the type or want to construct one explicitly.
- `Net.NetStream` — the underlying stream class (see below), useful if you need stream-level control instead of the buffered `.get()`/`.post()` helpers.

---

## `NetRequest` — High-Level Request Methods

This is what you get back from `Net(uri)`. It has one property worth knowing about:

- **`.response`** — after a request completes, holds the raw `http.IncomingMessage` from the *last* request made through this `NetRequest`, in case you need to inspect headers/status directly rather than just the body text.

### `.get(opts = {}): Promise<string>`
Makes a GET request (or whatever method `opts.method` specifies) and resolves with the full response body as a string.

- **How:** Internally calls `.getStream()`, awaits the response, and reads the entire body via `stream.readAll()`. If the response status code isn't `200`, it throws an `HttpError` (see below) instead of resolving — so a non-200 response is treated as a failure, not a normal result you need to status-check yourself.
- **When to use:** The default choice for "fetch this URL and give me the text" — fetching JSON APIs, web pages, or any HTTP resource where you just want the body and don't need streaming.
- **Example (chat-plugin fetching JSON):**
  ```ts
  const raw = await Net('https://api.example.com/users/1').get();
  const user = JSON.parse(raw);
  ```
- **Example (with query params and headers):**
  ```ts
  const result = await Net('https://api.example.com/search').get({
      query: { q: 'pikachu', limit: '10' },
      headers: { 'Authorization': `Bearer ${token}` },
  });
  ```
- **Caution:** Throws on any non-200 status — wrap in try/catch if you need to handle 404s, etc. gracefully instead of letting the error propagate.

### `.post(opts, body): Promise<string>`
Makes a POST request with the given body, and resolves with the response body as a string.

- **How:** Two overloads:
  - `.post(opts, body)` — pass options and the POST body separately.
  - `.post(opts?)` — pass everything (including `body`) inside the single `opts` object.
  Internally, it just calls `.get({ ...opts, method: 'POST', body })` — so it has the exact same "throws on non-200" and string-body behavior as `.get()`.
- **`body` can be:**
  - A plain object (`PostData` — keys mapped to string/number values) — automatically URL-encoded as `application/x-www-form-urlencoded`, with `Content-Type` and `Content-Length` headers set for you.
  - A raw string — sent as-is (set your own `Content-Type` header if it's not form-encoded, e.g. JSON).
- **When to use:** Submitting form data or a JSON payload to an external API.
- **Example (form-encoded body):**
  ```ts
  const result = await Net('https://api.example.com/submit').post({}, { username: 'ash', action: 'login' });
  ```
- **Example (raw JSON body):**
  ```ts
  const result = await Net('https://api.example.com/submit').post({
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'ash' }),
  });
  ```

### `.getStream(opts = {}): NetStream`
Makes a request and returns the underlying `NetStream` immediately (without waiting for or buffering the response).

- **How:** Checks `Config.noNetRequests` first and throws synchronously if outgoing requests are disabled. Otherwise constructs and returns a new `NetStream`.
- **When to use:** Lower-level alternative to `.get()`/`.post()` for cases where you need streaming behavior — e.g. piping a large download to a file via `FS`, processing a response incrementally instead of buffering the whole thing in memory, or needing to write a request body incrementally (`opts.writable`).
- **Example (streaming a large download to disk):**
  ```ts
  const stream = Net('https://example.com/large-file.zip').getStream();
  await stream.pipeTo(FS('downloads/large-file.zip').createWriteStream());
  ```
- **Note:** This is also where the `Config.noNetRequests` kill switch is enforced — `.get()`/`.post()` go through this internally, so the switch covers them too.

---

## `NetStream` — Low-Level Stream Access

A `NetStream` is a readable/writable stream (extends the project's own `Streams.ReadWriteStream`) wrapping a single HTTP(S) request/response. You normally get one via `.getStream()` rather than constructing it directly, but it's documented here since `getStream()` returns it and `Net.NetStream` is exposed for advanced use.

### Constructor: `new NetStream(uri, opts?)`
Immediately starts the request (there's no separate "send" step — building the stream sends the request).

- **Key options on `opts` (`NetRequestOptions`, extends Node's `https.RequestOptions`):**
  - `body` — string or `PostData` object to send as the request body (form-encodes objects automatically).
  - `query` — a `PostData` object appended to the URI as URL-encoded query parameters.
  - `writable` — if `true` and no `body` is given, exposes the request as a writable stream you can `.write()` to incrementally (mutually exclusive with `body` — passing both throws).
  - `timeout` — milliseconds before the request is aborted as timed out (defaults to `5000`; pass `0`/falsy is treated as "use default" unless explicitly set to a real value — see source for the exact default-timeout interaction).
- **Properties you can read:**
  - `.statusCode` — HTTP status code once the response arrives (`null` before then).
  - `.headers` — response headers once the response arrives (`null` before then).
  - `.state` — one of `'pending' | 'open' | 'timeout' | 'success' | 'error'`, tracking the request's lifecycle.
  - `.response` — a Promise that resolves to the `http.IncomingMessage` once received (or the message itself after — check the type/await it to be safe), or `null` if the connection closed before a response arrived.
- **When to use directly:** Rare in chat-plugins — prefer `NetRequest.get()`/`.post()`/`.getStream()`. Use directly only if you need fine-grained access to stream lifecycle/state that the high-level methods don't expose.

### `NetStream.encodeQuery(data: PostData): string` *(static)*
URL-encodes a plain object into a query-string-style string (`key=value&key2=value2`).

- **How:** Iterates the object's keys, joining `key=encodeURIComponent(value)` pairs with `&`.
- **When to use:** Used internally for both `opts.body` (form encoding) and `opts.query` (query string building). You'd call this directly only if you need a raw encoded query string for some other purpose (e.g. building a URL manually rather than via `opts.query`).
- **Example:**
  ```ts
  const qs = NetStream.encodeQuery({ q: 'pikachu', type: 'electric' });
  // "q=pikachu&type=electric"
  ```

### `._write(data)` / `._read()` / `._pause()`
Internal stream-protocol methods implementing the `ReadWriteStream` interface (writing to the outgoing request body, resuming/pausing the incoming response). These are called by the base `Streams` class machinery, not meant to be called directly from chat-plugins.

---

## Errors

### `class HttpError extends Error`
Thrown by `.get()`/`.post()` when the response status code isn't `200`.

- **Properties:**
  - `.statusCode` — the HTTP status code returned (may be `undefined` if the response had none).
  - `.body` — the full response body text, in case the error response itself contains useful information (e.g. a JSON error message from an API).
  - `.message` / `.name` — `.name` is always `'HttpError'`; `.message` is the response's status message (or `"Connection error"` if none).
- **When to use:** Catch this specifically when you want to handle non-200 responses gracefully (e.g. treat a 404 differently from a 500, or surface the API's error body to the user) instead of letting a generic error propagate.
- **Example:**
  ```ts
  try {
      const data = await Net('https://api.example.com/user/999').get();
  } catch (err) {
      if (err instanceof HttpError && err.statusCode === 404) {
          return this.errorReply('User not found.');
      }
      throw err;
  }
  ```

---

## Types

### `interface PostData`
A plain object type (`{ [key: string]: string | number }`) representing form fields / query parameters to be URL-encoded. Used for both POST bodies and GET query strings.

### `interface NetRequestOptions extends https.RequestOptions`
Extends Node's standard request options with three additions:
- `body?: string | PostData` — request body (string sent raw, object form-encoded).
- `query?: PostData` — query parameters appended to the URI.
- `writable?: boolean` — expose the request as a writable stream instead of sending a fixed body.

Use this type when writing a helper function that accepts/forwards request options, so TypeScript validates you're passing valid fields.

---

## The `Config.noNetRequests` Kill Switch

Every path that ultimately creates a `NetStream` (`.get()`, `.post()`, `.getStream()`) checks `Config.noNetRequests` and throws immediately (synchronously, before any network activity starts) if it's set.

- **Why:** Lets the whole server's outgoing network access be disabled from one config flag — useful for testing, sandboxed environments, or restricted deployments — without auditing every individual call site that uses `Net`.
- **Practical implication for chat-plugins:** If a feature using `Net` mysteriously throws `"Net requests are disabled."`, that's this switch, set in the server's config — not a bug in your plugin code.

---

## Quick Reference Table

| Member | Category | One-line purpose |
|---|---|---|
| `Net(uri)` | Entry point | Get a `NetRequest` bound to a URL |
| `.get(opts?)` | NetRequest | GET (or custom method), returns body as string, throws on non-200 |
| `.post(opts, body)` | NetRequest | POST with form/string/JSON body, returns body as string |
| `.getStream(opts?)` | NetRequest | Get the raw `NetStream` without buffering the response |
| `.response` | NetRequest | Last raw `http.IncomingMessage` received |
| `new NetStream(uri, opts?)` | NetStream | Low-level stream wrapping one HTTP(S) request/response |
| `NetStream.encodeQuery(data)` | NetStream (static) | Encode an object as a URL query string |
| `.statusCode` / `.headers` / `.state` | NetStream | Inspect response status/headers/lifecycle state |
| `HttpError` | Error type | Thrown on non-200 responses; has `.statusCode` and `.body` |
| `PostData` | Type | Form field / query param object shape |
| `NetRequestOptions` | Type | Request options (`body`, `query`, `writable`, + Node's `https.RequestOptions`) |
| `Net.NetRequest` | Static | The `NetRequest` class |
| `Net.NetStream` | Static | The `NetStream` class |
| `Config.noNetRequests` | Kill switch | Disables all `Net` requests when set |
