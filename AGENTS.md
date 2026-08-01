# AGENTS.md

Instructions for coding agents working in this repository. Human-facing setup lives in
[README.md](./README.md); the reasoning behind the rules below lives in [docs/](./docs).

An Expo SDK 57 / React Native 0.86 boilerplate. It is a template other projects are forked from,
so a change here is copied into every fork that pulls it — leave the tree in the state you would
want to inherit.

## Setup

```bash
pnpm install          # pnpm 11, pinned in packageManager. Do not use npm or yarn.
pnpm env:setup        # writes .env / .env.staging / .env.production — interactive, needs a human
pnpm prebuild         # regenerates ios/ and android/
```

`.env` must exist before anything resolves: `app.config.ts` throws without the five keys in
`.env.example`. If you only need a bundle to build, `cp .env.example .env` is enough — that is what
CI does.

## Verify before you claim anything works

```bash
pnpm exec tsc --noEmit
pnpm exec eslint .
pnpm exec jest              # add --coverage to check the enforced floor
pnpm exec expo export --platform android
```

The last one is not optional for a change that touches an import path, an asset, an alias or the
native config. `tsc` resolves through `tsconfig` `paths` and never sees an asset import or a
relative depth, so a broken one typechecks cleanly and fails on device. It is the check that caught
the restructure.

`npx madge --circular --extensions ts,tsx src` must report none.

`.github/workflows/ci.yml` runs the same four commands on every PR. Do not push a change you have
not run them against locally.

## Layering

```
src/app/       shell: root, error boundary, providers, navigation
src/features/  one directory per feature, each owning api/ model/ ui/
src/shared/    api, config, constants, lib, store, ui
src/types/     ambient declarations
```

**A feature imports `shared/`. A feature never imports another feature.** The app shell composes
features into screens. This is the one rule the tree cannot survive losing, which is why `madge` is
in the checklist.

## Conventions that are enforced

- **kebab-case** for every file and directory under `src/`. Exported symbols keep their own casing.
- **No new umbrella barrels.** Fifteen were deleted. Metro has no tree-shaking, so a barrel pulls
  the whole graph, and a test that wants to stub one module has to mock all of them.
- **Do not hand-memoise.** The React Compiler is on. `React.memo` / `useMemo` / `useCallback` are
  for a component the compiler bails out of, and the comment must say so. A firing
  `react-hooks/*` rule _is_ the bailout signal.
- **No `React.FC`, no `forwardRef`.** React 19 passes `ref` as an ordinary prop.
- **`Logger` only, never `console.*`** — and never pass it a header, a token or a response body.
  Logging is silent outside `__DEV__`; `console.error` reaches logcat on a real device.
- **Failures are values.** `HttpClient.request` returns a discriminated `HttpResponse` union and
  never rejects. The transport layer does not draw UI.
- **No `any` to silence an error**, no `!`. Use `unknown` plus a guard.

Tests live in `__tests__/` beside their subject. A test covering a fixed bug says in a comment what
used to happen. Mock a leaf module, never a barrel.

## Traps specific to this repo

- **`ios/` and `android/` are generated** from `app.config.ts` and `plugins/`, and are not tracked.
  An edit inside either is discarded by the next prebuild — change the config or a plugin instead.
- **`react-native-css-interop` is patched** (`patches/`, registered in `pnpm-workspace.yaml`).
  Upgrading it without re-checking the patch silently restores the bug where every function style
  flattens to `{}` and the component renders unstyled.
- **`pnpm-workspace.yaml`, not `package.json`, holds pnpm config** — pnpm 11 no longer reads the
  `pnpm` field. Overrides, `allowBuilds`, `nodeLinker: hoisted` and the patch list are all there.
- **`render` and `renderHook` are async** in React Testing Library 14: `await render(...)`.
- **The React Compiler does not run under jest**, which reads `babel.config.js` directly. Identity
  is therefore stable in tests and not in the app; anything identity-sensitive keeps its manual
  memoisation and says why.
- **In `configureStore`, `enhancers` must appear after `middleware`.** An `enhancers` callback seen
  first pins the middleware tuple to the default entry and the RTK Query types stop matching.
- **`docs/` is tracked, `plans/` is not.** Docs describe the result; plans are working notes.
- **Never commit a `.env*` file** other than `.env.example`. Shared values live in EAS; sync them
  with `pnpm env:pull` / `pnpm env:push`.

## Where things are documented

| Question                                                     | File                                                         |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| Layering, RTKQ vs saga, the auth refresh cycle               | [docs/system-architecture.md](./docs/system-architecture.md) |
| Naming, TypeScript flags, memoisation and testing policy, CI | [docs/code-standards.md](./docs/code-standards.md)           |
| Directory map and dependency inventory                       | [docs/codebase-summary.md](./docs/codebase-summary.md)       |
| What changed and why, per release                            | [docs/project-changelog.md](./docs/project-changelog.md)     |

Commits are conventional and enforced by commitlint. The subject says what changed; the body says
what was wrong before.
