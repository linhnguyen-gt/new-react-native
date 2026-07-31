# Code Standards

Rules the linter and the compiler cannot state for themselves, and the reasoning behind the ones
they can. The layer rules live in [system-architecture.md](./system-architecture.md).

## Naming

Every file and directory under `src/` is **kebab-case**: `http-client.ts`, `use-theme-color.ts`,
`keyboard-space/`, `login-screen.test.tsx`. Three conventions used to coexist here, which meant
guessing at every import.

Exported symbols keep their normal casing — `HttpClient` the class lives in `http-client.ts`,
`useActions` in `use-actions.ts`. The file name describes the module; it does not rename the thing
inside it.

Mechanical check:

```bash
git ls-files src | grep -vE "^src/([a-z0-9]+(-[a-z0-9]+)*/|__tests__/)*([a-z0-9]+(-[a-z0-9]+)*)(\.test)?\.(ts|tsx|d\.ts)$"
```

Keep files under ~200 lines. Split by responsibility, not by line count.

## Imports

One alias, `@`, declared once in `tsconfig.json` `paths`. Metro reads it directly (Expo SDK 50+),
`tsc` reads it directly, and `jest.config.js` mirrors it in one commented line because jest cannot
read tsconfig without another dependency. There is no `babel-plugin-module-resolver`: a second
declaration of the same alias is how you end up with an import that bundles and fails to
typecheck.

`import/order` groups them: external, then `@/app`, `@/features`, `@/shared`, `@/types`, then
relative. `eslint --fix` sorts it; do not do it by hand.

Avoid barrels that span unrelated modules. `shared/ui/index.ts` is a design-system public surface
and earns its place; a barrel re-exporting the environment next to the http client does not —
Metro has no tree-shaking, so importing one symbol pulls the whole graph, and a test that wants to
stub one module has to mock all of them.

## TypeScript

`strict` is on, plus four flags that are not in `strict`:

| Flag                                   | Why                                                                                                                                                               |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `lib: ["es2022"]`                      | Hermes on RN 0.86 is ES2022. `es2021` made `Object.hasOwn` and `Error.cause` type errors on code that runs.                                                       |
| `noUncheckedIndexedAccess`             | Indexing a record returns `T \| undefined`. The codebase indexes untyped maps constantly; this is where a missing key becomes a compile error instead of a crash. |
| `verbatimModuleSyntax`                 | A type-only import must say `import type`. Paired with `@typescript-eslint/consistent-type-imports`.                                                              |
| `useUnknownInCatchVariables` (default) | The override that disabled it is gone. Narrow with `error instanceof Error ? error.message : String(error)`.                                                      |

`erasableSyntaxOnly` is deliberately **off**: `ApiMethod` is a real enum. Turning it on is a
separate decision, not a bundled one.

No `any` to silence an error — `unknown` plus a type guard. No `!`. Fix a
`noUncheckedIndexedAccess` complaint with `??` or a guard, never an assertion.

## Components

Plain functions with a typed props interface. No `React.FC` (it adds nothing and mis-models
generics and defaults) and no `forwardRef` — React 19 passes `ref` as an ordinary prop:

```tsx
const Box = ({ ref, ...props }: BoxProps & { ref?: React.Ref<View> }) => <View ref={ref} {...props} />;
```

### Memoisation

**Do not hand-memoise.** The React Compiler is on (`experiments.reactCompiler` in
`app.config.ts`) and does it better than a dependency array maintained by hand — several of the
`useMemo` calls it replaced listed a rest object that was rebuilt every render, so they memoised
nothing at all.

Write `React.memo`, `useMemo` or `useCallback` only when the compiler bails out of that component,
and say why in a comment. The compiler-powered rules from `eslint-plugin-react-hooks` 7 are
enabled precisely so a bailout is visible: **a rule firing means the compiler gave up on that
component.** The common cause is reading a ref during render — `useRef(new Animated.Value(0))
.current` — for which the fix is a lazy `useState` initialiser, not a suppression.

The compiler runs in Metro, not in jest, which reads `babel.config.js` directly. That asymmetry is
accepted: the compiler is an optimisation, not a semantic change. It does mean identity-sensitive
values (a context value, a hook API that callers put in dependency arrays) keep their manual
memoisation — both surviving cases say so in a comment.

## Logging

`Logger` only. It emits nothing outside `__DEV__`, and the release branch is a deliberately empty
crash-reporter hook.

**Never log a header, a token or a response body.** `console.warn`/`console.error` reach logcat
and Console.app on a real device, where any other process can read them; this is how a live
`Authorization: Bearer …` used to be published by one failed request. `no-console` is an error
with `info`/`warn`/`error` allowed for `Logger`'s own use.

## Errors

Failures are values, not exceptions — see the `HttpResponse` union in
[system-architecture.md](./system-architecture.md). A saga reports through `handleApiCall`'s
`onFailure`; a component renders what the store holds. The transport layer never draws UI: an
`Alert` fired from an axios interceptor cannot be tested, cannot be styled and cannot be silenced.

## Testing

Jest with `@testing-library/react-native`. Tests live in `__tests__/` beside their subject and are
named for the file they cover.

- `render` and `renderHook` are **async** in RTL 14 — `await render(...)`.
- Test the regression, not the implementation. Every test in this repo that covers a fixed bug
  says in a comment what used to happen.
- No fake data or mocked internals to make a suite pass. Mock a leaf module, never a barrel.

Coverage floor is enforced in `jest.config.js` (`coverageThreshold`). Re-measure and raise it when
a phase of work removes untested code; never lower it to make a build pass.

## Commits

Conventional commits, enforced by commitlint. The subject says what changed; the body says what
was wrong before. Lefthook runs `eslint --fix` and `prettier` on staged files.

Before pushing: `npx tsc --noEmit`, `npx eslint .`, `npx jest`. For anything touching module
resolution or the native config, also `npx expo export --platform android` — it is the only check
that catches a resolution error Metro will hit and `tsc` will not.

## CI

`.github/workflows/ci.yml` runs those same four commands on every pull request to `main` and every
push to `main` or a numbered version branch. It writes `.env` from `.env.example` first, because
`app.config.ts` refuses to resolve without the five published keys; the example file is the
development flavor, the one whose `API_URL` is allowed to be http. The coverage floor fails the
job on its own — there is no separate coverage step.

Releasing is `.github/workflows/release.yml`, run by hand from the Actions tab. It calls `ci.yml`
rather than repeating its steps, so the two can never drift, then hands the version decision to
`scripts/prepare-release.cjs`: `auto` reads the conventional commits since the previous tag — a
breaking change is a major (a minor while the version is below 1.0.0), a `feat` is a minor,
anything else a patch — or pass `patch`/`minor`/`major`, or an exact `version`.

The same script renders the release notes from those commits, grouped by type, and the workflow
publishes them with `--notes-file`. It does not use `gh release create --generate-notes`: that
groups by pull request rather than by change, and with no previous tag to diff against it walks
the entire history and announces the repository owner as a first-time contributor. Preview what a
release would say without touching anything:

```bash
node scripts/prepare-release.cjs --bump=auto --dry-run
```

The app's own `VERSION_NAME` / `VERSION_CODE` live in the uncommitted `.env` files and are **not**
touched by a release — a store build's version is a separate, deliberate edit.
