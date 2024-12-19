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

## 🔧 Environment Configuration

### Environment Files

```bash
.env.local.development  # Development environment
.env.local.staging     # Staging environment 
.env.local.production  # Production environment
```

### Required Environment Variables

```bash
APP_FLAVOR=development|staging|production
VERSION_CODE=1
VERSION_NAME=1.0.0
API_BASE_URL=https://your-api.com
```

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

- Dev.Debug/Release (Development)
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
elif [[ "${CONFIGURATION}" == *"Dev"* ]]; then
    export APP_ENV="development"
fi
```

```bash
# Get the environment from configuration name
echo "Debug: Raw CONFIGURATION value: ${CONFIGURATION}"

if [[ "${CONFIGURATION}" == *"Product"* ]]; then
  ENV_FILE="${SRCROOT}/../.env.local.production"
  echo "Debug: Matched Product configuration"
elif [[ "${CONFIGURATION}" == *"Staging"* ]]; then
  ENV_FILE="${SRCROOT}/../.env.local.staging"
  echo "Debug: Matched Staging configuration"
elif [[ "${CONFIGURATION}" == *"Dev"* ]]; then
  ENV_FILE="${SRCROOT}/../.env.local.development"
  echo "Debug: Matched Dev configuration"
else
  ENV_FILE="${SRCROOT}/../.env.local"
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
else
    echo "Warning: Environment file not found, using default values"
fi

echo "Using versions - Code: $VERSION_CODE, Name: $VERSION_NAME"

# Update Info.plist if it exists
if [ -f "$INFO_PLIST" ]; then
    echo "Updating Info.plist..."
    /usr/libexec/PlistBuddy -c "Set :CFBundleVersion $VERSION_CODE" "$INFO_PLIST" || true
    /usr/libexec/PlistBuddy -c "Set :CFBundleShortVersionString $VERSION_NAME" "$INFO_PLIST" || true
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
        prod {  
            dimension 'default'
            applicationId 'com.newreactnative'
            resValue 'string', 'build_config_package', 'com.newreactnative'

            def envFile = new File("${project.rootDir.parentFile}/.env.local")
            if (envFile.exists()) {
                def versionProps = getVersionFromEnv(envFile)
                versionCode versionProps.code.toInteger()
                versionName versionProps.name
            }
        }
        
        development {
            dimension 'default'
            applicationId 'com.newreactnative.dev'
            resValue 'string', 'build_config_package', 'com.newreactnative'

            def envFile = new File("${project.rootDir.parentFile}/.env.local.development")
            if (envFile.exists()) {
                def versionProps = getVersionFromEnv(envFile)
                versionCode versionProps.code.toInteger()
                versionName versionProps.name
            }
        }
        staging {
            dimension 'default'
            applicationId 'com.newreactnative.stg'
            resValue 'string', 'build_config_package', 'com.newreactnative'

            def envFile = new File("${project.rootDir.parentFile}/.env.local.staging")
            if (envFile.exists()) {
                def versionProps = getVersionFromEnv(envFile)
                versionCode versionProps.code.toInteger()
                versionName versionProps.name
            }
        }
        production {
            dimension 'default'
            applicationId 'com.newreactnative.production'
            resValue 'string', 'build_config_package', 'com.newreactnative'

            def envFile = new File("${project.rootDir.parentFile}/.env.local.production")
            if (envFile.exists()) {
                def versionProps = getVersionFromEnv(envFile)
                versionCode versionProps.code.toInteger()
                versionName versionProps.name
            }
        }
    }

def getVersionFromEnv(File envFile) {
    def versionCode = "1"
    def versionName = "1.0.0"
    
    envFile.eachLine { line ->
        if (line.contains('=')) {
            def (key, value) = line.split('=', 2)
            if (key == "VERSION_CODE") versionCode = value?.trim()?.replaceAll('"', '')
            if (key == "VERSION_NAME") versionName = value?.trim()?.replaceAll('"', '')
        }
    }
    
    println "Reading from ${envFile.path}"
    println "VERSION_CODE: ${versionCode}"
    println "VERSION_NAME: ${versionName}"
    
    return [code: versionCode, name: versionName]
}
```

### Setup Steps for New Project

1. **Create Environment Files**

```bash
# Create and configure environment files
touch .env.local.development
touch .env.local.staging
touch .env.local.production
```

2. **iOS Setup**

- Add Build Phase Script in Xcode
- Add Build Configurations (Dev/Staging/Product)
- Update Schemes per environment
- Configure Info.plist for version management

3. **Android Setup**

- Copy Product Flavors configuration to build.gradle
- Copy getVersionFromEnv helper function
- Add applicationId for each flavor
- Configure app/build.gradle for version management

4. **Update package.json Scripts**

```json
{
  "scripts": {
    "android": "cd android && ENVFILE=.env.local && ./gradlew clean && cd .. && react-native run-android --mode=prodDebug --appId=com.newreactnative",
    "android:stg": "APP_ENV=staging && cd android && ENVFILE=.env.local.staging && ./gradlew clean && cd .. && react-native run-android --mode=stagingDebug --appId=com.newreactnative.stg",
    "android:dev": "APP_ENV=development && cd android && ENVFILE=.env.local.development && ./gradlew clean && cd .. && react-native run-android --mode=developmentDebug --appId=com.newreactnative.dev",
    "android:pro": "APP_ENV=production && cd android && ENVFILE=.env.local.production && ./gradlew clean && cd .. && react-native run-android --mode=productionDebug --appId=com.newreactnative.production",
    "ios": "react-native run-ios",
    "ios:stg": "APP_ENV=staging react-native run-ios --scheme Staging --mode Staging.Debug",
    "ios:dev": "APP_ENV=development react-native run-ios --scheme Dev --mode Dev.Debug",
    "ios:pro": "APP_ENV=production react-native run-ios --scheme Pro --mode Product.Debug"
  }
}
```

5. **Update .gitignore**

```bash
# Ignore private environment files
.env.*.local
.env.local
.env.local.*
# Don't ignore shared environment files
!.env.*.shared
!.env.shared
```

### Running Different Environments

**iOS Commands**

```bash
yarn ios:dev     # Development build
yarn ios:stg     # Staging build
yarn ios:pro     # Production build
```

**Android Commands**

```bash
yarn android:dev # Development build
yarn android:stg # Staging build
yarn android:pro # Production build
```

### Version Management

The setup automatically manages app versions based on environment files:

- VERSION_CODE: Used for internal build numbering
- VERSION_NAME: Used for display version in stores

### Notes

- Always create .env.local.example as a template
- Keep sensitive data out of version control
- Test all environments before deployment
- Update versions in environment files before releases

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
