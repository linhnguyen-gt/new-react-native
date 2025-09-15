module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        project: null,
    },
    env: {
        es6: true,
    },
    extends: [
        '@react-native',
        'eslint:recommended',
        'plugin:jest/recommended',
        'plugin:react/recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:eslint-comments/recommended',
        'plugin:jsx-a11y/recommended',
        'plugin:import/typescript',
        'plugin:prettier/recommended',
        'prettier',
    ],
    plugins: ['react', 'react-native', 'detox', 'react-hooks', 'import'],
    ignorePatterns: ['dist', 'node_modules', 'vendor', 'android', 'ios'],
    rules: {
        'no-console': ['error', { allow: ['warn', 'error'] }],
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'error',
        'react/jsx-filename-extension': ['error', { extensions: ['.ts', '.tsx'] }],
        'react/display-name': 'off',
        'react/jsx-props-no-spreading': 'off',
        'react/state-in-constructor': 'off',
        'react/static-property-placement': 'off',
        'react/prop-types': 'off',
        'react/require-default-props': 'off',
        'react/react-in-jsx-scope': 'off',
        'react/jsx-uses-react': 'off',
        'react/jsx-curly-brace-presence': 'error',
        'prettier/prettier': ['error'],
        '@typescript-eslint/indent': 'off',
        '@typescript-eslint/no-shadow': 'error',
        '@typescript-eslint/no-explicit-any': 'off',
        'linebreak-style': ['error', 'unix'],
        quotes: ['error', 'single'],
        semi: ['error', 'always'],
        '@typescript-eslint/prefer-enum-initializers': 'error',
        'no-undef': 'off',
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': 'error',
        'no-mixed-spaces-and-tabs': 'off',
        'react-native/no-inline-styles': 'off',
        '@typescript-eslint/naming-convention': [
            'error',
            {
                selector: 'variable',
                format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
                leadingUnderscore: 'allow',
            },
            {
                selector: 'parameter',
                format: ['camelCase'],
                leadingUnderscore: 'allow',
            },
            {
                selector: 'typeLike',
                format: ['PascalCase'],
            },
            {
                selector: 'function',
                format: ['camelCase', 'PascalCase'],
            },
        ],
        'import/imports-first': 'error',
        'import/order': [
            'error',
            {
                groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
                'newlines-between': 'always',
                alphabetize: {
                    order: 'asc',
                    caseInsensitive: true,
                },
                pathGroups: [
                    {
                        pattern: '@/components',
                        group: 'internal',
                        position: 'before',
                    },
                    {
                        pattern: '@/redux',
                        group: 'internal',
                        position: 'before',
                    },
                    {
                        pattern: '@/constants',
                        group: 'internal',
                        position: 'before',
                    },
                    {
                        pattern: '@/apis',
                        group: 'internal',
                        position: 'before',
                    },
                    {
                        pattern: '@/services',
                        group: 'internal',
                        position: 'before',
                    },
                    {
                        pattern: '@/model',
                        group: 'internal',
                        position: 'before',
                    },
                    {
                        pattern: '@/hooks',
                        group: 'internal',
                        position: 'before',
                    },
                    {
                        pattern: '@/helper',
                        group: 'internal',
                        position: 'before',
                    },
                    {
                        pattern: '@/screens',
                        group: 'internal',
                        position: 'before',
                    },
                    {
                        pattern: '@/store',
                        group: 'internal',
                        position: 'before',
                    },
                ],
            },
        ],
    },
    settings: {
        react: {
            version: 'detect',
        },
    },
    overrides: [
        {
            files: ['**/__mocks__/**/*.js'],
            rules: {
                'react/jsx-filename-extension': 'off',
                '@typescript-eslint/no-unused-vars': 'off',
            },
        },
        {
            files: ['*.js', 'scripts/**/*.js'],
            rules: {
                '@typescript-eslint/no-var-requires': 'off',
                'no-console': 'off',
                'no-empty': 'off',
                'no-case-declarations': 'off',
                quotes: 'off',
            },
        },
        {
            files: ['metro.config.js', 'babel.config.js', 'jest.config.js'],
            rules: {
                '@typescript-eslint/no-var-requires': 'off',
            },
        },
    ],
};
