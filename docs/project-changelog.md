# Changelog

## 2026-07-31 — Modernisation (GH-57)

A full review of the boilerplate followed by sixteen phases of work. Six Critical and fourteen
Important findings closed, plus a structural move to a feature-first tree and a data layer on RTK
Query. Grouped by what was wrong rather than by commit.

### Security

- **Credentials no longer reach the device log.** `Logger.error` ran in release builds and the
  error handler passed request headers through it, so one failed request published a live
  `Authorization: Bearer …` to logcat and Console.app. Nothing is emitted outside `__DEV__` now.
- **The refresh token moved from AsyncStorage to the platform keystore** (`expo-secure-store`,
  `WHEN_UNLOCKED_THIS_DEVICE_ONLY`). AsyncStorage writes plaintext to app-private files, which are
  recoverable from a device backup.
- **`setToken({ refreshToken: null })` deletes instead of no-oping**, so logout actually clears the
  session.
- **`extra` is an allowlist**, not a spread of the parsed `.env`. Anything a future contributor
  adds to that file no longer ships inside the IPA/APK, where unzipping reveals it.
- **`API_URL` must be https outside development**, now that the refresh token travels in a request
  body.
- **A response fetched under the previous session can no longer land in the reset store**:
  `RESET_STATE` cancels the running saga task instead of leaving it in flight.
- **The hardcoded `test@test.com` / `123456` login defaults are dev-only.**

### Auth

The refresh flow was structurally broken in six independent ways and is rewritten: the stored
token is actually sent, a successful refresh replays the original request, refresh is
single-flight, one 401 buys exactly one retry, the refresh call cannot re-enter its own flow, and
the timer honours `expiredAt` instead of a hardcoded fifteen minutes. `TokenService` depends on a
port interface, which removed the only import cycle in the tree.

### Correctness

- **Keyboard avoidance worked on iOS only.** The spacer subscribed to `keyboardWillShow`/`Hide`,
  which Android never emits, while wrapping the whole navigation tree.
- **Every layout row was announced "dimmed, button"**: `HStack` always rendered a
  `TouchableOpacity`, which marks itself disabled without an `onPress`.
- **Two taps within a second produced one increment.** The saga read the count, added one and
  dispatched the result; the reducer now derives it.
- **The spinner hid while work was still running.** The loading map was a boolean per action type;
  it counts in-flight tasks now and deletes the key at zero.
- **A failed request produced nothing at all** — no message, no state. The transport returns a
  discriminated `HttpResponse` union with a classified error, and the saga routes the message into
  the store instead of the transport firing an `Alert`.
- **A bad `.env` produced a white screen** with no log, because the throw happened while the module
  graph was loading. Bootstrap is lazy and failures render an error screen.
- **A failed `sagaMiddleware.run()` was swallowed**, leaving a store with no watchers: the app
  rendered and every button was dead. It is fatal now.
- **`APP_ENV=stg` silently built a development app.** Unknown values throw with the list of valid
  ones.
- **Non-`.com` email addresses were rejected** by a `.endsWith('.com')` refine.
- **Pull-to-refresh never showed a spinner** — the callback was not awaited.
- **NativeWind destroyed function styles.** `react-native-css-interop` flattened
  `({ pressed }) => style` to `{}`, so every component using one rendered unstyled, React Native's
  own LogBox included. Patched in `patches/`.

### Structure

- Feature-first tree: `src/{app,features,shared,types}`, with fifteen umbrella barrels deleted.
- Every file and directory kebab-cased — 68 renames.
- One `@` alias from `tsconfig`; `babel-plugin-module-resolver` and its four aliases for
  directories that never existed are gone.
- A real `RootStackParamList` registered with React Navigation, so an unknown route is a compile
  error; imperative navigation is documented as being for non-React callers.
- Dead code and six copies of one function removed; five unreferenced dependencies dropped.

### Platform

- **React Compiler on**, and the manual memoisation it replaces deleted — several of those memos
  had a rest object in their dependency array and never memoised anything. 20 `forwardRef`
  wrappers became plain `ref` props (React 19).
- **RTK Query for server state**, with a base query over the existing `HttpClient` so endpoints
  inherit the auth refresh and error classification. `count` stays on redux-saga as the local /
  multi-step-async example.
- **The zod schema now validates**: it existed only as a `z.infer` source, so a changed API
  produced silently wrong state.
- TypeScript raised to `es2022` with `noUncheckedIndexedAccess`, `verbatimModuleSyntax` and
  default catch-variable narrowing.
- ESLint now covers the ~20 `.js`/`.mjs`/`.cjs` files it used to ignore.

### Tests

46 tests in 5 suites → 116 in 21, with an enforced coverage floor in `jest.config.js`. Each test
covering a fixed defect states in a comment what used to happen.

### Known gaps

- The refresh transport is a `POST` with the token in the body. If the backend is cookie-based,
  two lines change — see `docs/system-architecture.md`.
- The login screen has no endpoint behind it; `handleSubmit` logs and navigates, with a TODO
  naming the two calls a real implementation needs.
- No `accessibilityLabel` anywhere in the design system.
