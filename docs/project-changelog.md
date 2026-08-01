# Changelog

## 2026-08-01 — Environment variables move to EAS

`dotenv-vault` is gone: the dependency, the `env:push` / `env:pull` chains, the ~450-line vault
wizard inside `scripts/setup-env.js`, and the author's own `.env.vault`, which was committed and
whitelisted twice in `.gitignore`. Shared values now live in EAS, and the local `.env*` files are
copies of them rather than an encrypted artifact everyone had to hold a key for.

- **`pnpm env:pull` / `env:push` / `env:exec`** replace the vault commands. The variant→EAS
  mapping lives in one table, because EAS ships only three environments and pushing a variant to
  the wrong one succeeds silently — the next build simply reads another environment's `API_URL`.
  This repo's `staging` maps onto EAS's `preview`.
- **Shell values now beat file values.** `app.config.ts` read its values straight out of the
  parsed env file, so nothing in the environment could ever win — including anything
  `eas env:exec` injects. The order is now shell / EAS, then the variant file, then defaults, and
  a missing file is no longer an error when the environment supplies the values. A key the
  variant's file does not declare stays _missing_ rather than being inherited from `.env`:
  otherwise a `.env.production` omitting `VERSION_CODE` would silently ship development's.
- **`env:exec` is for JS-side commands only.** react-native-config compiles the file named by
  `ENVFILE` into the native build and never sees an injected value, so putting `env:exec` in
  front of a native build ships two halves that disagree and the app throws at startup. Pull
  first, then build.
- **The template ships no EAS project id.** One id baked into a boilerplate would put every
  generated app on the same EAS project; each project runs `eas init` and the id is resolved from
  `EXPO_PROJECT_ID`. With it unset, everything still resolves and builds — an Expo account is not
  a prerequisite for running the app.
- **One variant table** (`scripts/lib/variant-config.cjs`) replaces the copies in
  `app.config.ts`, `run-app.js`, `check-env.js` and `setup-env.js`.
- **`pnpm check:env` parses instead of substring-matching.** `contents.includes('API_URL=')` was
  satisfied by a commented-out `# API_URL=`, so the pre-build check passed on files
  `app.config.ts` then rejected.
- **`pnpm clear:cache` works.** It chained Unix `rm -rf` with Windows `del`, so on every platform
  one of the two was an unknown command and `expo start --clear` — the point of the script — was
  never reached. It is a Node script now.
- **`pnpm android:prod`** matches `ios:prod`; `android:pro` stays as an alias for one release
  cycle. `.codegraph/` is no longer tracked, and `engines.node` drops a redundant range.
- **`dotenv` is no longer a dependency.** One parser (`scripts/lib/parse-env-file.cjs`) now reads
  every env file, following dotenv's comment rules so the behaviour is unchanged.

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

### Tests and CI

46 tests in 5 suites → 125 in 22, with an enforced coverage floor in `jest.config.js`. Each test
covering a fixed defect states in a comment what used to happen. `HttpClient.request` — the one
call every request passes through — went from untested to nine tests pinning the response envelope
in both directions.

The repository had no CI. `.github/workflows/ci.yml` now runs eslint, `tsc --noEmit`, jest and
`expo export --platform android` on every pull request; before this, lefthook's staged-file lint
was the only gate, and the coverage floor had nothing enforcing it. `.github/workflows/release.yml`
is a manual GitHub release: it calls the CI workflow, then bumps, tags and publishes. There is no
CD — nothing builds or ships a binary.

`docs/` was in `.gitignore`, so none of these documents had ever been committed even though the
README links into them. It is tracked now; `plans/` deliberately is not. `AGENTS.md` states the
same rules for coding agents.

### Known gaps

- The refresh transport is a `POST` with the token in the body. If the backend is cookie-based,
  two lines change — see `docs/system-architecture.md`.
- The login screen has no endpoint behind it; `handleSubmit` logs and navigates, with a TODO
  naming the two calls a real implementation needs.
- No `accessibilityLabel` anywhere in the design system.
