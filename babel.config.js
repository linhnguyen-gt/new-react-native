module.exports = function (api) {
    api.cache(true);
    return {
        presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],
        /**
         * No alias-resolver plugin. Expo's Metro resolver reads `compilerOptions.paths` from
         * tsconfig.json directly (SDK 50+), so the `@` alias only needs declaring once.
         *
         * The plugin also carried aliases for `@app`, `@data`, `@presentation` and `@shared` —
         * directories that never existed, left over from an abandoned layout. They were a trap:
         * once such a directory appears, Metro resolves the import and `tsc` fails on it, because
         * the alias was never in tsconfig.
         */
        plugins: ['react-native-worklets/plugin'],
    };
};
