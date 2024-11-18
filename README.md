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
- 🎨 NativeWind for styling
- 🛠️ Reactotron integration for debugging
- 🌐 Environment-specific configurations
- 📦 Pre-configured folder structure

## 🚀 Quick Start

### Prerequisites

Make sure you have the following installed:

- Node.js (v20+)
- Yarn
- React Native CLI
- Xcode (iOS)
- Android Studio (Android)

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

**iOS**
```bash
yarn ios
```

**Android**
```bash
yarn android
```

## 📁 Project Structure

```
src/
├── components/     # Reusable UI components
├── constants/      # App-wide constants and enums
├── hooks/          # Custom React hooks
├── httpClient/     # API client configuration
├── model/         # Data models and TypeScript types
├── redux/         # Redux store, actions, and reducers
├── services/      # Business logic and services
└── store/         # Redux store configuration
```

## ⚙️ Environment Configuration

The project uses `react-native-config` for environment management. Create the following files:

```bash
.env.development   # Development environment variables
.env.staging      # Staging environment variables
.env.production   # Production environment variables
```

