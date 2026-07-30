import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import comments from '@eslint-community/eslint-plugin-eslint-comments/configs';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import jestPlugin from 'eslint-plugin-jest';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactNative from 'eslint-plugin-react-native';
import globals from 'globals';

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

/** Internal path aliases, ordered so `import/order` groups them predictably. */
const internalAliases = [
    '@/components',
    '@/redux',
    '@/constants',
    '@/apis',
    '@/services',
    '@/model',
    '@/hooks',
    '@/helper',
    '@/screens',
    '@/store',
];

export default [
    {
        ignores: [
            'dist/**',
            'build/**',
            'node_modules/**',
            'vendor/**',
            'android/**',
            'ios/**',
            'coverage/**',
            // Vendored agent tooling — not part of the app source.
            '.opencode/**',
            '.shared/**',
            '.expo/**',
            '.pnpm-store/**',
            // Carried over from the previous .eslintignore: this project lints
            // TS/TSX only. Plain JS (config files, scripts, mocks) is formatted
            // by Prettier via lint-staged but not linted.
            '**/*.js',
            '**/*.mjs',
            '**/*.cjs',
            '**/*.d.ts',
            '__mocks__/**',
            'scripts/**',
            'tsconfig.json',
        ],
    },

    js.configs.recommended,

    // @react-native/eslint-config is still eslintrc-format; bridge it into flat config.
    ...compat.extends('@react-native'),

    comments.recommended,
    jsxA11y.flatConfigs.recommended,
    importPlugin.flatConfigs.typescript,
    prettierRecommended,

    {
        files: ['**/*.{js,jsx,ts,tsx}'],
        languageOptions: {
            parser: tsParser,
            ecmaVersion: 2022,
            sourceType: 'module',
            parserOptions: {
                ecmaFeatures: { jsx: true },
            },
            globals: {
                ...globals.es2021,
                ...globals.node,
                __DEV__: 'readonly',
            },
        },
        plugins: {
            '@typescript-eslint': tsPlugin,
            react: reactPlugin,
            'react-native': reactNative,
            'react-hooks': reactHooks,
        },
        settings: {
            react: { version: 'detect' },
        },
        rules: {
            ...reactPlugin.configs.recommended.rules,
            ...tsPlugin.configs['eslint-recommended'].overrides[0].rules,
            ...tsPlugin.configs.recommended.rules,

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
                { selector: 'typeLike', format: ['PascalCase'] },
                { selector: 'function', format: ['camelCase', 'PascalCase'] },
            ],
            'import/first': 'error',
            'import/order': [
                'error',
                {
                    groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
                    'newlines-between': 'always',
                    alphabetize: { order: 'asc', caseInsensitive: true },
                    pathGroups: internalAliases.map((pattern) => ({
                        pattern,
                        group: 'internal',
                        position: 'before',
                    })),
                },
            ],
        },
    },

    {
        files: ['**/__tests__/**/*.{js,jsx,ts,tsx}', '**/*.{spec,test}.{js,jsx,ts,tsx}'],
        ...jestPlugin.configs['flat/recommended'],
    },

];
