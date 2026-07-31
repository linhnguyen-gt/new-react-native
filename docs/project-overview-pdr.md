# Project Overview & Product Development Requirements (PDR)

## Project Information

**Project Name:** New React Native  
**Version:** 0.0.1  
**Type:** React Native Mobile Application  
**Platform:** iOS & Android  
**Framework:** Expo (~57.0.9) with React Native (0.86.2)

## Project Description

New React Native is a production-ready React Native boilerplate project designed to accelerate mobile app development. It provides a comprehensive foundation with modern tooling, best practices, and a well-structured architecture for building cross-platform mobile applications.

## Core Technologies

### Frontend Framework

- **React Native:** 0.86.2
- **React:** 19.2.3
- **Expo:** ~57.0.9
- **TypeScript:** ~6.0.3

### State Management

- **Redux Toolkit:** 2.12.0
- **Redux Saga:** 1.5.1
- **React Redux:** 9.3.0

### UI & Styling

- **NativeWind:** 4.2.6 (Tailwind CSS for React Native)
- **Tailwind CSS:** 3.4.17
- **React Native Vector Icons:** 13.x, multiple icon sets

### Form Management

- **React Hook Form:** 7.83.0
- **Zod:** 4.4.3 (Schema validation)

### Navigation

- **React Navigation:** 7.3.14 (Stack Navigator)

### API & Networking

- **Axios:** 1.19.0
- Custom HTTP client with interceptors

### Environment

- **react-native-config:** 1.6.1 (native-side env via `BuildConfig` / `Info.plist`)
- **expo-constants:** ~57.0.8 (JS-side env via `app.config.ts` → `extra`)

### Development Tools

- **Reactotron:** 5.2.0 (Debugging)
- **ESLint:** 9.39.5 (flat config)
- **Prettier:** 3.9.6
- **Jest:** 29.7.0 (Testing)

## Key Features

### 1. Multi-Environment Support

- **Development:** Default development environment
- **Staging:** Pre-production testing environment
- **Production:** Production-ready builds

Each environment has:

- Separate configuration files (`.env`, `.env.staging`, `.env.production`)
- Environment-specific API endpoints
- Version management per environment
- Custom app identifiers and names

### 2. State Management Architecture

- Redux Toolkit for the store, with RTK Query for server state
- Redux Saga for local state with multi-step async flows
- Feature-first layout: each feature owns its `api/`, `model/` and `ui/`
- Reactotron integration for debugging

The boundary between the two mechanisms is described in `docs/system-architecture.md`.

### 3. UI Component System

- In-house primitives (Box, Text, HStack, VStack, Button, Toast, …) in `src/shared/ui/`
- Built directly on React Native primitives — no third-party component library
- NativeWind for utility-first styling
- Local variant system (`src/shared/ui/utils/tva.ts`) for component variants
- Consistent design system via CSS variables in `src/shared/ui/ui-provider/config.ts`

### 4. Type Safety

- Strict TypeScript configuration
- Type-safe navigation
- Type-safe Redux state
- Comprehensive type definitions

### 5. Developer Experience

- Hot reloading with Expo
- Reactotron for debugging
- ESLint + Prettier for code quality
- Jest for testing
- Git hooks (Lefthook) for quality checks
- GitHub Actions runs lint, typecheck, tests and an Android bundle on every pull request

## Project Goals

1. **Rapid Development:** Provide a boilerplate that eliminates setup time
2. **Best Practices:** Implement industry-standard patterns and conventions
3. **Type Safety:** Ensure end-to-end type safety across the application
4. **Scalability:** Structure codebase for growth and maintainability
5. **Developer Productivity:** Optimize tooling and workflows

## Target Platforms

- **iOS:** 16.4+ (via Expo)
- **Android:** API Level 24+ (Android 7.0+), compile/target SDK 36

## Development Requirements

### Prerequisites

- Node.js >= 22.22.1 (or >= 24.3.0)
- pnpm package manager (via corepack)
- Xcode (for iOS development)
- Android Studio (for Android development)
- Ruby >= 2.6.10
- CocoaPods

### Environment Setup

1. Clone repository
2. Run `pnpm install`
3. Run `pnpm env:setup` to configure environments
4. Run `pnpm prebuild` to generate `ios/` and `android/` — they are not in the repository

### Native Project Model

The project uses **Continuous Native Generation**. `ios/` and `android/` are gitignored build
output regenerated from `app.config.ts` plus the three plugins in `plugins/`; a hand-edit in
either directory is discarded by the next prebuild.

Per-environment identity (bundle id, display name, version) comes from `app.config.ts` keyed on
`APP_ENV`, replacing the former Android product flavors and iOS `Staging.*`/`Product.*` build
configurations.

Environment values reach the app through two mechanisms: `expo-constants` (JS, selected by
`APP_ENV`) and `react-native-config` (JS and native, selected by `ENVFILE`). Both must be
exported together; `src/shared/config/environment.ts` throws at startup if they disagree.

## Architecture Principles

1. **Separation of Concerns:** Clear separation between UI, business logic, and data
2. **Component Reusability:** Build reusable, composable components
3. **Type Safety First:** Leverage TypeScript for compile-time safety
4. **Testability:** Structure code for easy testing
5. **Maintainability:** Follow consistent patterns and conventions

## Future Enhancements

- Additional screen templates
- More UI components
- Enhanced testing utilities
- A CD path: nothing builds or ships a binary today, by choice
- Performance optimization guides
- Accessibility improvements

## Documentation

- **Codebase Summary:** See `docs/codebase-summary.md`
- **Code Standards:** See `docs/code-standards.md`
- **System Architecture:** See `docs/system-architecture.md`
