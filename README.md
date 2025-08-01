<div>
  <h1>🚀 New React Native Project</h1>
  <p>A powerful React Native boilerplate with production-ready configurations and best practices</p>
  <p><strong>Create a new project using our CLI: <a href="https://github.com/linhnguyen-gt/create-rn-project">create-rn-project</a></strong></p>

  <p>
    <a href="https://reactnative.dev/" target="_blank">
      <img src="https://img.shields.io/badge/React_Native-v0.79.5-blue?style=for-the-badge&logo=react&logoColor=white" alt="react-native" />
    </a>
    <a href="https://www.typescriptlang.org/" target="_blank">
      <img src="https://img.shields.io/badge/TypeScript-v5.8.3-blue?style=for-the-badge&logo=typescript&logoColor=white" alt="typescript" />
    </a>
  </p>

### Core Libraries

  <p>
    <img src="https://img.shields.io/badge/Expo-v53.0.19-blue?style=for-the-badge&logo=expo&logoColor=white" alt="expo" />
    <img src="https://img.shields.io/badge/Gluestack_UI-v1.1.73-1B1B1F?style=for-the-badge" alt="gluestack" />
    <img src="https://img.shields.io/badge/React_Navigation-v7.1.14-6B52AE?style=for-the-badge&logo=react&logoColor=white" alt="react-navigation" />
  </p>

### State Management & API

  <p>
    <img src="https://img.shields.io/badge/Redux_Toolkit-v2.8.2-764ABC?style=for-the-badge&logo=redux&logoColor=white" alt="redux" />
    <img src="https://img.shields.io/badge/Redux_Saga-v1.3.0-89D96D?style=for-the-badge&logo=redux-saga&logoColor=white" alt="redux-saga" />
    <img src="https://img.shields.io/badge/Axios-v1.10.0-5A29E4?style=for-the-badge&logo=axios&logoColor=white" alt="axios" />
  </p>

### UI & Styling

  <p>
    <img src="https://img.shields.io/badge/NativeWind-v4.1.23-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="nativewind" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-v3.4.17-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="tailwindcss" />
    <img src="https://img.shields.io/badge/React_Native_Vector_Icons-v10.2.0-4B32C3?style=for-the-badge" alt="vector-icons" />
  </p>

### Form & Validation

  <p>
    <img src="https://img.shields.io/badge/React_Hook_Form-v7.60.0-EC5990?style=for-the-badge&logo=react-hook-form&logoColor=white" alt="react-hook-form" />
    <img src="https://img.shields.io/badge/Zod-v4.0.2-3068B7?style=for-the-badge" alt="zod" />
  </p>

### Development & Testing

  <p>
    <img src="https://img.shields.io/badge/ESLint-v8.19.0-4B32C3?style=for-the-badge&logo=eslint&logoColor=white" alt="eslint" />
    <img src="https://img.shields.io/badge/Prettier-v3.3.3-F7B93E?style=for-the-badge&logo=prettier&logoColor=black" alt="prettier" />
    <img src="https://img.shields.io/badge/Jest-v29.7.0-C21325?style=for-the-badge&logo=jest&logoColor=white" alt="jest" />
  </p>

### Environment & Storage

  <p>
    <img src="https://img.shields.io/badge/Dotenv-v17.2.0-ECD53F?style=for-the-badge&logo=dotenv&logoColor=black" alt="dotenv" />
    <img src="https://img.shields.io/badge/Async_Storage-v2.2.0-3B82F6?style=for-the-badge" alt="async-storage" />
  </p>

### Development Tools

  <p>
    <img src="https://img.shields.io/badge/Reactotron-v5.1.14-7B61FF?style=for-the-badge" alt="reactotron" />
    <img src="https://img.shields.io/badge/React_Native_Reanimated-v3.18.0-FF4154?style=for-the-badge" alt="reanimated" />
  </p>

### Environment Support

  <p>
    <img src="https://img.shields.io/badge/iOS-000000?style=for-the-badge&logo=apple&logoColor=white" alt="ios" />
    <img src="https://img.shields.io/badge/Android-3DDC84?style=for-the-badge&logo=android&logoColor=white" alt="android" />
  </p>
</div>

## Features

- Built with TypeScript for type safety
- Cross-platform (iOS & Android) support
- Redux + Redux Saga for state management
- NativeWind for styling with Tailwind CSS
- Reactotron integration for debugging
- Multi-environment support (Development, Staging, Production)
- Pre-configured folder structure
- ESLint + Prettier for code quality
- Gluestack UI components
- Environment-specific configurations

## Quick Start

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

### Clone the repository\*\*

```bash
git clone https://github.com/linhnguyen-gt/new-react-native
cd new-react-native
```

## Environment Configuration

### Setup New Environment

First, you need to run the environment setup script:

```bash
# Using npm
npm run env:setup

# Using yarn
yarn env:setup
```

This script will:

1. Set up dotenv-vault (optional)
2. Create environment files for all environments:
    - `.env` (Development environment)
    - `.env.staging` (Staging environment)
    - `.env.production` (Production environment)
3. Configure necessary environment variables

### Environment Files Structure

Each environment file contains:

```bash
# Required Variables
APP_FLAVOR=development|staging|production
VERSION_CODE=1
VERSION_NAME=1.0.0
API_URL=https://api.example.com
APP_NAME=""

# Optional Variables (configured during setup)
GOOGLE_API_KEY=
FACEBOOK_APP_ID=
# ... other variables
```

### Using Different Environments

```bash
# Development (default)
yarn android
yarn ios

# Staging
yarn android:stg
yarn ios:stg

# Production
yarn android:pro
yarn ios:pro
```

### Setup Steps for New Project

### iOS Configuration

1. **Podfile Configuration**
   Add this configuration block to your Podfile:

```ruby
# Configuration name environment mapping
project 'NewReactNative', {
    'Debug' => :debug,
    'Dev.Debug' => :debug,
    'Dev.Release' => :release,
    'Release' => :release,
    'Staging.Debug' => :debug,
    'Staging.Release' => :release,
    'Product.Debug' => :debug,
    'Product.Release' => :release
}
```

This configuration:

- Maps each build configuration to its corresponding mode (:debug or :release)
- Supports all environments (Dev, Staging, Product)
- Enables both Debug and Release builds for each environment

2. **Build Configurations**
   Xcode should have these configurations set up:

- Staging.Debug/Release (Staging)
- Product.Debug/Release (Production)
- Debug/Release (Default)

3. **Version Management Script**
   Add this script to Build Phase in Xcode:

.xcode.env.

```bash
# Determine APP_ENV based on CONFIGURATION
if [[ "${CONFIGURATION}" == *"Product"* ]]; then
    export APP_ENV="production"
elif [[ "${CONFIGURATION}" == *"Staging"* ]]; then
    export APP_ENV="staging"
fi
```

Build Phases -> Add Run Script -> Paste

```bash
# Get the environment from configuration name
echo "Debug: Raw CONFIGURATION value: ${CONFIGURATION}"

if [[ "${CONFIGURATION}" == *"Product"* ]]; then
  ENV_FILE="${SRCROOT}/../.env.production"
  echo "Debug: Matched Product configuration"
elif [[ "${CONFIGURATION}" == *"Staging"* ]]; then
  ENV_FILE="${SRCROOT}/../.env.staging"
  echo "Debug: Matched Staging configuration"
else
  ENV_FILE="${SRCROOT}/../.env"
  echo "Debug: Using default configuration"
fi

# Ensure INFOPLIST_FILE is set
if [ -z "$INFOPLIST_FILE" ]; then
    echo "Error: INFOPLIST_FILE not set"
    exit 0
fi

INFO_PLIST="${SRCROOT}/${INFOPLIST_FILE}"

echo "=== Environment Setup ==="
echo "CONFIGURATION: ${CONFIGURATION}"
echo "Using env file: ${ENV_FILE}"
echo "Info.plist path: ${INFO_PLIST}"

# Default values in case env file is missing
VERSION_CODE="1"
VERSION_NAME="1.0.0"
APP_NAME=""

# Try to read from env file if it exists
if [ -f "$ENV_FILE" ]; then
    echo "Reading from env file..."

    # Read VERSION_CODE
    VERSION_CODE_LINE=$(grep "^VERSION_CODE=" "$ENV_FILE" || echo "")
    if [ ! -z "$VERSION_CODE_LINE" ]; then
        VERSION_CODE=$(echo "$VERSION_CODE_LINE" | cut -d'=' -f2 | tr -d '"' | tr -d ' ')
    fi

    # Read VERSION_NAME
    VERSION_NAME_LINE=$(grep "^VERSION_NAME=" "$ENV_FILE" || echo "")
    if [ ! -z "$VERSION_NAME_LINE" ]; then
        VERSION_NAME=$(echo "$VERSION_NAME_LINE" | cut -d'=' -f2 | tr -d '"' | tr -d ' ')
    fi

    # Read APP_NAME
    APP_NAME_LINE=$(grep "^APP_NAME=" "$ENV_FILE" || echo "")
    if [ ! -z "$APP_NAME_LINE" ]; then
        APP_NAME=$(echo "$APP_NAME_LINE" | sed 's/^APP_NAME=//' | sed 's/^"//' | sed 's/"$//')
    fi

else
    echo "Warning: Environment file not found, using default values"
fi

echo "Using versions - Code: $VERSION_CODE, Name: $VERSION_NAME, App Name: $APP_NAME"

# Update Info.plist if it exists
if [ -f "$INFO_PLIST" ]; then
    echo "Updating Info.plist..."
    /usr/libexec/PlistBuddy -c "Set :CFBundleVersion $VERSION_CODE" "$INFO_PLIST" || true
    /usr/libexec/PlistBuddy -c "Set :CFBundleShortVersionString $VERSION_NAME" "$INFO_PLIST" || true
    if [ ! -z "$APP_NAME" ]; then
        /usr/libexec/PlistBuddy -c "Set :CFBundleDisplayName $APP_NAME" "$INFO_PLIST" || true
    fi
    echo "Info.plist update completed"
else
    echo "Warning: Info.plist not found at $INFO_PLIST"
fi
```

4. **Setup Steps for iOS**

- Copy the configuration block to your Podfile
- Run `pod install` to apply configurations
- Set up corresponding Build Configurations in Xcode
- Add the version management script to Build Phases
- Configure schemes to use appropriate configurations

### Android Configuration

1. **Product Flavors**
   Add to app/build.gradle:

```gradle
    flavorDimensions 'default'
    productFlavors {
        dev {
            dimension 'default'
            applicationId 'com.newreactnative'
            resValue 'string', 'build_config_package', 'com.newreactnative'

            def envFile = new File("${project.rootDir.parentFile}/.env")
            if (envFile.exists()) {
                def props = getVersionFromEnv(envFile)
                versionCode props.code.toInteger()
                versionName props.name
                resValue "string", "app_name", props.appName
            }
        }

        staging {
            dimension 'default'
            applicationId 'com.newreactnative.stg'
            resValue 'string', 'build_config_package', 'com.newreactnative'

            def envFile = new File("${project.rootDir.parentFile}/.env.staging")
            if (envFile.exists()) {
                def props = getVersionFromEnv(envFile)
                versionCode props.code.toInteger()
                versionName props.name
                resValue "string", "app_name", props.appName
            }
        }
        production {
            dimension 'default'
            applicationId 'com.newreactnative.production'
            resValue 'string', 'build_config_package', 'com.newreactnative'

            def envFile = new File("${project.rootDir.parentFile}/.env.production")
            if (envFile.exists()) {
                def props = getVersionFromEnv(envFile)
                versionCode props.code.toInteger()
                versionName props.name
                resValue "string", "app_name", props.appName
            }
        }
    }

def getVersionFromEnv(File envFile) {
    def versionCode = '1'
    def versionName = '1.0.0'
    def appName = ''

    envFile.eachLine { line ->
        if (line.contains('=')) {
            def (key, value) = line.split('=', 2)
            if (key == 'VERSION_CODE') versionCode = value?.trim()?.replaceAll('"', '')
            if (key == 'VERSION_NAME') versionName = value?.trim()?.replaceAll('"', '')
            if (key == 'APP_NAME') appName = value?.trim()?.replaceAll('"', '')
        }
    }

    println "Reading from ${envFile.path}"
    println "VERSION_CODE: ${versionCode}"
    println "VERSION_NAME: ${versionName}"
    println "APP_NAME: ${appName}"

    return [code: versionCode, name: versionName, appName: appName]
}

```

### Update package.json Scripts

```json
{
    "scripts": {
        "android": "npx expo run:android --variant devDebug --app-id com.newreactnative",
        "android:stg": "APP_ENV=staging && npx expo run:android --variant stagingDebug --app-id com.newreactnative.stg",
        "android:pro": "APP_ENV=production && npx expo run:android --variant productionDebug --app-id com.newreactnative.production",
        "ios": "npx expo run:ios",
        "ios:stg": "APP_ENV=staging npx expo run:ios --scheme Staging --configuration Staging.Debug",
        "ios:pro": "APP_ENV=production npx expo run:ios --scheme Pro --configuration Product.Debug"
    }
}
```

### Update .gitignore

```bash
.env*
.flaskenv*
!.env.project
!.env.vault
# Environment files
.env
.env.*
!.env.example
!.env.vault
```

### Version Management

The setup automatically manages app versions based on environment files:

- VERSION_CODE: Used for internal build numbering
- VERSION_NAME: Used for display version in stores

### Important Notes

- Never commit `.env` files to git (they are automatically added to .gitignore)
- Always commit `.env.example` and `.env.vault` (if using dotenv-vault)
- Share vault credentials with your team members if using dotenv-vault

## Project Structure

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

## Development Tools

### Reactotron

For debugging, the project includes Reactotron integration. To use it:

1. Install Reactotron on your development machine
2. Run the following command for Android:

```bash
yarn adb:reactotron
```

## Code Style

The project uses ESLint and Prettier for code formatting. Run linting with:

```bash
yarn lint # Check for issues
```

To fix linting errors automatically, use:

```bash
yarn lint:fix # Fix automatic issues
```
