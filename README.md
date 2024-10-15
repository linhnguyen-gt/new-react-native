# New React Native Project

This is a new React Native project with additional configurations and custom components.

## Getting Started

### Prerequisites

- Node.js (version 20 or later)
- Yarn
- React Native CLI
- Xcode (for iOS development)
- Android Studio (for Android development)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/linhnguyen-gt/new-react-native
   ```

2. Install dependencies:
   ```
   yarn install
   ```

3. Install iOS dependencies:
   ```
   cd ios && pod install && cd ..
   ```

### Running the App

- For iOS:
  ```
  yarn ios
  ```

- For Android:
  ```
  yarn android
  ```

## Project Structure

- `src/`: Contains the main source code
    - `components/`: Reusable React components
    - `constants/`: Constant values and enums
    - `hooks/`: Custom React hooks
    - `httpClient/`: HTTP client configuration
    - `model/`: Data models and types
    - `redux/`: Redux store, actions, reducers, and sagas
    - `services/`: Various services including Reactotron setup
    - `store/`: Redux store configuration

## Key Features

- Redux for state management
- Redux Saga for side effects
- Reactotron for debugging
- Custom UI components using NativeWind
- Environment-specific configurations

## Environment Setup

This project uses `react-native-config` for environment variable management. Create `.env` files for different
environments:

- `.env.development`
- `.env.staging`
- `.env.production`

