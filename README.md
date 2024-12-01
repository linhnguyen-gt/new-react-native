<div align="center">
  <h1>🚀 New React Native Project</h1>
  <p>A powerful React Native boilerplate with production-ready configurations and best practices</p>
</div>

<div align="center">
  <img alt="React Native" src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
  <img alt="Redux" src="https://img.shields.io/badge/Redux-593D88?style=for-the-badge&logo=redux&logoColor=white" />
</div>

## ✨ Features

- 🏗️ Built with TypeScript for type safety
- 📱 Cross-platform (iOS & Android) support
- 🔄 Redux + Redux Saga for state management
- 🎨 NativeWind for styling with Tailwind CSS
- 🛠️ Reactotron integration for debugging
- 🌐 Multi-environment support (Development, Staging, Production)
- 📦 Pre-configured folder structure
- 🔍 ESLint + Prettier for code quality
- 🎯 Gluestack UI components
- 🔐 Environment-specific configurations

## 🚀 Quick Start

### Prerequisites

Make sure you have the following installed:

- Node.js (v20+)
- Yarn
- React Native CLI
- Xcode (for iOS)
- Android Studio (for Android)
- Ruby (>= 2.6.10)
- CocoaPods

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/linhnguyen-gt/new-react-native
cd new-react-native
```

2. **Install dependencies**

```bash
yarn install
```

3. **iOS Setup**

```bash
cd ios && pod install && cd ..
```

### 🏃‍♂️ Running the App

**iOS Development**

```bash
yarn ios:dev
```

**iOS Staging**

```bash
yarn ios:stg
```

**Android Development**

```bash
yarn android:dev
```

**Android Staging**

```bash
yarn android:stg
```

## 📁 Project Structure

```
src/
├── App.tsx          # Main App component
├── Root.tsx         # Root component with Redux Provider
├── apis/            # API integration
├── components/      # Reusable UI components
├── constants/       # Constants Keys
├── enums/           # TypeScript enums
├── helper/          # Helper functions
├── hooks/           # Custom React hooks
├── models/          # Models related to API
└── redux/           # Redux store configuration
    ├── actions/     # Redux actions
    ├── reducers/    # Redux reducers
    ├── sagas/       # Redux sagas
    └── selectors/   # Redux selectors
├── screens/         # Screen components
├── services/        # Business logic and services
    └── reactotron/  # Reactotron configuration
    └── navigation/  # Navigation configuration
    └── httpClient/  # Base API client configuration
└── store/           # Redux store configuration
└── types/           # TypeScript types

```

## ⚙️ Environment Configuration

The project uses `react-native-config` for environment management. Create the following files:

```bash
.env.development   # Development environment variables
.env.staging      # Staging environment variables
.env.production   # Production environment variables
```

Required environment variables:

- APP_FLAVOR=development|staging|production
- APP_VERSION_CODE=1
- APP_VERSION_NAME=1.0.0
- API_BASE_URL=your_api_url

## 🛠️ Development Tools

### Reactotron

For debugging, the project includes Reactotron integration. To use it:

1. Install Reactotron on your development machine
2. Run the following command for Android:

```bash
yarn adb:reactotron
```

## 📝 Code Style

The project uses ESLint and Prettier for code formatting. Run linting with:

```bash
yarn lint # Check for issues
```

To fix linting errors automatically, use:

```bash
yarn lint:fix # Fix automatic issues
```
