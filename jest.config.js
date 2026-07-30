// Packages published as untranspiled ESM/Flow that Babel must still process.
const packagesToTransform = [
    'react-native',
    '@react-native',
    '@react-navigation',
    'react-native-vector-icons',
    'react-native-css-interop',
    'react-native-reanimated',
    'react-native-worklets',
    'react-native-safe-area-context',
    'react-redux',
    '@react-native-aria',
    'react-native-config',
    '@react-native-async-storage',
    'reactotron-react-native',
    'reactotron-redux',
    'reactotron-redux-saga',
    'reactotron-core-client',
    'nativewind',
    'expo',
    'expo-constants',
    '@expo',
    '@reduxjs/toolkit',
    'immer',
];

module.exports = {
    preset: 'react-native',
    transform: {
        '^.+\.(js|jsx|ts|tsx)$': 'babel-jest',
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    setupFiles: ['<rootDir>/jest.setup.js'],
    transformIgnorePatterns: [
        // pnpm resolves packages to node_modules/.pnpm/<name>@<version>/node_modules/<name>,
        // so the first `node_modules/` segment must not by itself mark a file as
        // ignored; the decision belongs to the real package name that follows.
        `node_modules/(?!\\.pnpm/)(?!(?:${packagesToTransform.join('|')})/)`,
    ],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
            '<rootDir>/__mocks__/fileMock.js',
        '\\.(css|less)$': '<rootDir>/__mocks__/styleMock.js',
        '^@react-native-vector-icons/(.*)$': '<rootDir>/__mocks__/react-native-vector-icons.js',
    },
    testPathIgnorePatterns: [
        '<rootDir>/node_modules/',
        '<rootDir>/.history/',
        // Vendored agent tooling — ships its own tests, not part of the app suite.
        '<rootDir>/.opencode/',
        '<rootDir>/.shared/',
        '<rootDir>/.expo/',
        '<rootDir>/android/',
        '<rootDir>/ios/',
    ],
    globals: {
        __DEV__: true,
    },
};
