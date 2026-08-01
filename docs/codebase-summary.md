# Codebase Summary

113 TypeScript files under `src/`, 91 of them outside `__tests__/`. The layer rules and the
reasoning behind them are in
[system-architecture.md](./system-architecture.md); this document is the map.

## Directory map

```
src/
├── app/                      the shell — everything that is not a feature or shared
│   ├── root.tsx              bootstraps the store, renders the error screen on failure
│   ├── app.tsx               providers + the navigation container
│   ├── error-boundary.tsx    catches render-time throws
│   ├── bootstrap-error-screen.tsx
│   └── navigation/           root-navigator, navigation-logger, navigation-service,
│                             route-name, screen-options, types (the route map)
│
├── features/
│   ├── auth/ui/              login screen and its zod schema
│   ├── count/model/          actions, reducers, selectors, saga, model — the saga example
│   ├── home/ui/              the home screen, which composes count and response
│   └── response/
│       ├── api/              the RTK Query endpoint — the server-state example
│       └── model/            the zod schema and the inferred ResponseData type
│
├── shared/
│   ├── api/                  http-client, api-method, types, error-handler,
│   │                         request-interceptor, token-service, base-query
│   ├── config/               environment (a getter facade) and reactotron/
│   ├── constants/            colors, errors
│   ├── lib/                  logger, storage, hooks/ (use-actions, use-loading,
│   │                         use-refresh, use-route-params, use-show-toast,
│   │                         use-theme-color)
│   ├── store/                config-store, root-reducers, root-saga, store-service,
│   │                         api-saga-helper, reset-actions, action-types, loading/
│   └── ui/                   the design system: box, button, container, h-stack, icon,
│                             image, input, keyboard-space, loading, scroll-view, text,
│                             toast, touch, touchable, ui-provider, utils, v-stack
│
└── types/                    ambient declarations (global.d.ts, env.d.ts, icon.ts)
```

Tests sit in a `__tests__/` directory beside the code they cover.

## Features

**auth** — the login screen, its zod schema and the navigation reset that follows a successful
submit. There is no real login endpoint yet; `handleSubmit` logs and navigates, with a TODO naming
the two calls a real implementation needs (`login`, then `TokenService.setSession`). The token
lifecycle itself is not here: `HttpClient` constructs `TokenService`, so it lives in `shared/api/`
rather than making the shared layer depend on a feature.

**count** — a counter with a one-second delay in front of each change. It exists to demonstrate
the saga path end to end: action → `takeEvery` → `handleApiCall` (which owns the loading key) →
a payload-free `setIncrement` → reducer. The reducer is the only place that derives the count from
the count, which is what makes two taps inside the delay produce two increments.

**home** — composes count and response. Not a feature module in its own right; it is the screen.

**response** — one RTK Query endpoint against a public population API. Demonstrates the server
state path: `useGetResponseQuery()` for data, `isFetching`, `error` and `refetch`, with the payload
validated by zod in `transformResponse`.

## Shared infrastructure

| Directory       | Contents                                                                                                                                                        |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `shared/api`    | The axios client, its interceptors, the error classifier, the token service and the RTKQ base query. Everything network-facing.                                 |
| `shared/config` | `environment` (validates that the JS bundle and the native build describe the same environment) and the Reactotron setup.                                       |
| `shared/lib`    | `Logger`, keystore-backed `storage`, and the hooks that are not feature-specific.                                                                               |
| `shared/store`  | Store construction, the root reducer and saga, the loading slice, and `api-saga-helper` — the wrapper that gives every saga its loading key and error dispatch. |
| `shared/ui`     | The design system. `index.ts` is its public surface and is the one barrel worth keeping.                                                                        |

## Dependency inventory

Runtime: `expo` 57 · `react-native` 0.86 · `react` 19.2 · `@reduxjs/toolkit` 2.12 (store and RTK
Query) · `redux-saga` · `react-redux` · `axios` · `@react-navigation/native` + `/stack` 7 ·
`nativewind` 4 + `tailwindcss` · `react-hook-form` + `@hookform/resolvers` + `zod` ·
`expo-secure-store` · `react-native-config` + `expo-constants` (the two environment sources) ·
`react-native-reanimated`, `-gesture-handler`, `-safe-area-context`, `-screens`, `-svg` ·
`@react-native-vector-icons/*` · `reactotron-*` (dev tooling, imported unconditionally) ·
`lodash`.

Tooling: `typescript` · `jest` + `@testing-library/react-native` · `eslint` with the
TypeScript, React, React Native, import, jsx-a11y, jest and prettier plugins ·
`babel-plugin-react-compiler` · `lefthook` + `lint-staged` + `commitlint`.

Environment values are shared through EAS (`eas.json`, `scripts/env-sync.cjs`,
`scripts/env-exec.cjs`), with the local `.env*` files as offline copies. `eas-cli` is invoked
through `pnpm dlx` rather than installed — pinning it here would be a second version to maintain.

Removed as unreferenced: `@shopify/flash-list`, `@react-native/new-app-screen`, `react-dom`,
`@types/react-dom`, `@babel/preset-env`, `babel-plugin-module-resolver`. Web is not a target — no
`web` platform in `app.config.ts`, no web script; re-adding the react-dom pair is one command if
that changes.

## Patched dependencies

`react-native-css-interop@0.2.6` (NativeWind's JSX runtime) is patched: its interop treated a
style _function_ as an inline rule object and flattened it to `{}`, so `Pressable`'s
`({ pressed }) => style` was discarded. Every component with a function style rendered unstyled —
including React Native's own LogBox notification. See `patches/`.
