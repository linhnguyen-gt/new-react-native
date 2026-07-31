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
            // Generated declarations; nothing here is hand-written.
            '**/*.d.ts',
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

    /**
     * Node-side JavaScript: the entry file, the root configs, the Expo config plugins, the build
     * scripts and the manual mocks. All of it was in `ignores` until now — Prettier formatted it,
     * nothing checked it, so an unused variable or a typo'd global went unreported.
     *
     * A light rule set on purpose: this is CommonJS running in Node, not app code.
     */
    {
        files: ['**/*.{js,mjs,cjs}'],
        languageOptions: {
            ecmaVersion: 2022,
            // `module` covers both styles here: the entry file and the mocks are ESM that Babel
            // transforms, the scripts and root configs are CommonJS, and `globals.node` declares
            // `require`/`module` for the latter.
            sourceType: 'module',
            globals: { ...globals.node, __DEV__: 'readonly' },
        },
        rules: {
            ...js.configs.recommended.rules,
            'prettier/prettier': 'error',
        },
    },

    {
        files: ['__mocks__/**', 'jest.setup.js'],
        languageOptions: {
            globals: { ...globals.node, ...globals.jest },
        },
    },

    {
        files: ['**/*.{jsx,ts,tsx}'],
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

            // `info` is allowed so Logger.info can report at info level; it used to call
            // console.error, which filed every informational record as an error.
            'no-console': ['error', { allow: ['info', 'warn', 'error'] }],
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
            // Pairs with verbatimModuleSyntax in tsconfig: a type-only import must say so, or
            // the emitted module keeps an import of something that does not exist at runtime.
            // `disallowTypeAnnotations: false` keeps `typeof import('…')` usable, which is how the
            // module-registry tests describe a module they re-require under a fresh registry.
            '@typescript-eslint/consistent-type-imports': ['error', { disallowTypeAnnotations: false }],
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
