<div align="center">
  <h1>🚀 create-rn-with-redux-project</h1>
  <p>A powerful CLI tool to create React Native projects with Redux, TypeScript, and best practices</p>
</div>

<p align="center">
  <img src="https://img.shields.io/badge/React_Native-Latest-blue?style=for-the-badge&logo=react&logoColor=white" alt="react-native" />
  <img src="https://img.shields.io/badge/TypeScript-Integrated-blue?style=for-the-badge&logo=typescript&logoColor=white" alt="typescript" />
  <img src="https://img.shields.io/badge/Redux-Toolkit-764ABC?style=for-the-badge&logo=redux&logoColor=white" alt="redux" />
</p>

## 📋 Overview

`create-rn-with-redux-project` is a command-line tool that helps you quickly set up a new React Native project with a production-ready structure and configuration. It's based on the [new-react-native](https://github.com/linhnguyen-gt/new-react-native) template, which includes:

- TypeScript for type safety
- Redux + Redux Saga for state management
- NativeWind for styling with Tailwind CSS
- Multi-environment support (Development, Staging, Production)
- Pre-configured folder structure
- Gluestack UI components
- And much more!

## 🚀 Installation

### Global Installation

```bash
# Install globally from the official repository
npm install -g https://github.com/linhnguyen-gt/create-rn-with-redux-project.git
```

### Requirements

Make sure you have the following installed:

- Node.js (v16 or newer)
- npm or yarn
- Git
- React Native development environment set up (for running the generated project)

## 📱 Usage

### Creating a New Project

```bash
# Basic usage
create-rn-with-redux-project MyApp

# With custom bundle ID
create-rn-with-redux-project MyApp -b com.example.myapp

# With all options
create-rn-with-redux-project MyApp --bundle-id com.example.myapp --repo https://github.com/yourusername/your-repo.git --skip-install --use-npm
```

### Available Options

- `-b, --bundle-id <id>`: Set custom bundle identifier (default: "com.example.app")
- `-r, --repo <url>`: Specify GitHub repository URL
- `--skip-install`: Skip installing dependencies
- `--use-npm`: Use npm instead of yarn for installing dependencies
- `--help`: Show help information

### After Creating a Project

Once your project is created, you can:

```bash
# Navigate to your project
cd MyApp

# Start the development server
yarn start

# Run on iOS
yarn ios

# Run on Android
yarn android

# Run on specific environments
yarn ios:stg    # Staging environment for iOS
yarn android:pro  # Production environment for Android
```

## ✨ Features

The generated project comes with:

- 🏗️ **TypeScript Integration**: Full TypeScript support for type safety
- 🔄 **State Management**: Redux Toolkit and Redux Saga pre-configured
- 🎨 **Styling**: NativeWind (Tailwind CSS for React Native)
- 🌐 **Multi-Environment**: Development, Staging, and Production environments
- 📱 **Cross-Platform**: iOS and Android support with environment-specific configurations
- 🛠️ **Developer Tools**: Reactotron integration for debugging
- 📦 **Organized Structure**: Pre-configured folder structure following best practices
- 🔍 **Code Quality**: ESLint and Prettier pre-configured

## 🔧 Environment Configuration

The generated project supports multiple environments:

- **Development**: Default environment for development
- **Staging**: For testing before production
- **Production**: For production releases

Each environment has its own configuration files and build scripts.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Linh Nguyen** - [GitHub](https://github.com/linhnguyen-gt)

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/linhnguyen-gt">Linh Nguyen</a>
</p>
