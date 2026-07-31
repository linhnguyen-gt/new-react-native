import * as dotenv from 'dotenv';

import { name as projectName } from './package.json';

import type { ConfigContext, ExpoConfig } from 'expo/config';

type AppEnv = 'development' | 'staging' | 'production';

type EnvTarget = {
    /** Which dotenv file supplies this environment's values. */
    envFile: string;
    /**
     * Shared by iOS and Android. One identifier per environment is what stops the two
     * platforms drifting apart — the pre-CNG setup kept them in separate native files and
     * ended up with three mutually inconsistent ids.
     */
    bundleId: string;
};

const ENV_TARGETS: Record<AppEnv, EnvTarget> = {
    development: { envFile: '.env', bundleId: 'com.newreactnative' },
    staging: { envFile: '.env.staging', bundleId: 'com.newreactnative.stg' },
    production: { envFile: '.env.production', bundleId: 'com.newreactnative.production' },
};

/**
 * The keys published to the running app through `extra`, and the ones every env file must
 * define. This list is duplicated as `SHARED_KEYS` in `src/services/environment.ts` and the two
 * must agree — they cannot share a module, because this file runs in Node before Metro exists.
 */
const PUBLISHED_ENV_KEYS = ['APP_FLAVOR', 'APP_NAME', 'API_URL', 'VERSION_NAME', 'VERSION_CODE'] as const;

/**
 * An unrecognised value is a typo, not a request for development.
 *
 * The fallback used to swallow it: `APP_ENV=stg` — this repo's own vocabulary, from `ios:stg`
 * and the `com.newreactnative.stg` bundle id — produced a development build with a development
 * bundle id, and `assertFlavorMatchesEnv` could not catch it because after the fallback both
 * sides agreed. An absent value still means development.
 */
const resolveAppEnv = (value: string | undefined): AppEnv => {
    const candidate = value?.toLowerCase() ?? '';
    if (!candidate) return 'development';

    if (!(candidate in ENV_TARGETS)) {
        throw new Error(
            `APP_ENV="${value}" is not a known environment. Use one of: ${Object.keys(ENV_TARGETS).join(', ')}`
        );
    }

    return candidate as AppEnv;
};

/**
 * dotenv reports a missing file as `{ parsed: {}, error: ENOENT }` — an empty object, which
 * is truthy. Checking `error` is what separates "file is not there" from "file has no
 * usable values"; without it a missing file surfaces as five missing variables instead.
 */
const loadEnvFile = (path: string): Record<string, string> => {
    const { parsed, error } = dotenv.config({ path, quiet: true });

    if (error) {
        throw new Error(`Cannot read env file ${path}: ${error.message}`);
    }
    if (!parsed || Object.keys(parsed).length === 0) {
        throw new Error(`Env file ${path} contains no variables`);
    }

    return parsed;
};

/** Exactly the published keys, each proven present by `validateEnvConfig`. */
type PublishedEnv = Record<(typeof PUBLISHED_ENV_KEYS)[number], string>;

const validateEnvConfig = (env: Record<string, string>, appEnv: AppEnv): PublishedEnv => {
    const missingVars = PUBLISHED_ENV_KEYS.filter((key) => !env[key]);
    if (missingVars.length > 0) {
        throw new Error(`Missing required env variables: ${missingVars.join(', ')}`);
    }

    const emptyVars = Object.entries(env)
        .filter(([_, value]) => value === undefined || value === '')
        .map(([key]) => key);

    if (emptyVars.length > 0) {
        throw new Error(`Empty values for environment variables: ${emptyVars.join(', ')}`);
    }

    const published = Object.fromEntries(PUBLISHED_ENV_KEYS.map((key) => [key, env[key]])) as PublishedEnv;

    // The refresh token travels in a request body, so a plaintext base URL outside development
    // puts the whole session on the wire. `.env.example` ships `http://localhost:3000`, which is
    // exactly the value most likely to be copied into a staging file by accident.
    if (appEnv !== 'development' && !published.API_URL.startsWith('https://')) {
        throw new Error(`API_URL must use https outside development, received "${published.API_URL}"`);
    }

    return published;
};

/**
 * Android rejects a non-integer versionCode at build time with a far less obvious message,
 * and a bare Number() would let NaN through into the generated manifest.
 */
const parseVersionCode = (raw: string): number => {
    const code = Number(raw);
    if (!Number.isInteger(code) || code < 1) {
        throw new Error(`VERSION_CODE must be a positive integer, received "${raw}"`);
    }
    return code;
};

/**
 * APP_ENV picks the file; APP_FLAVOR inside that file is what reaches the running app through
 * `extra`. When they disagree, `environment.isStaging()` silently answers for the wrong
 * environment, so treat it as a config error rather than a warning.
 */
const assertFlavorMatchesEnv = (flavor: string, appEnv: AppEnv, envFile: string): void => {
    if (flavor.trim().toLowerCase() !== appEnv) {
        throw new Error(
            `APP_FLAVOR mismatch: APP_ENV=${appEnv} selected ${envFile}, but it declares APP_FLAVOR=${flavor}`
        );
    }
};

export default ({ config }: ConfigContext): ExpoConfig => {
    const appEnv = resolveAppEnv(process.env.APP_ENV);
    const target = ENV_TARGETS[appEnv];
    const validatedConfig = validateEnvConfig(loadEnvFile(target.envFile), appEnv);
    assertFlavorMatchesEnv(validatedConfig.APP_FLAVOR, appEnv, target.envFile);
    const versionCode = parseVersionCode(validatedConfig.VERSION_CODE);

    return {
        ...config,
        /**
         * Constant across environments on purpose: prebuild derives the Xcode project name
         * from `name`, so a per-environment value would produce a differently-named
         * ios/<name>.xcodeproj on every switch. The per-environment label is applied as a
         * display name instead.
         */
        name: projectName,
        slug: projectName.toLowerCase(),
        version: validatedConfig.VERSION_NAME,
        userInterfaceStyle: 'automatic',
        /**
         * The React Compiler memoises components automatically, which is why the hand-written
         * React.memo/useMemo/useCallback wrappers were removed rather than kept alongside it.
         * Jest reads babel.config.js and not this file, so tests run *without* the compiler —
         * an accepted asymmetry: it is an optimisation, not a semantic change.
         */
        experiments: { reactCompiler: true },
        ios: {
            ...config.ios,
            bundleIdentifier: target.bundleId,
            buildNumber: String(versionCode),
            infoPlist: {
                ...config.ios?.infoPlist,
                CFBundleDisplayName: validatedConfig.APP_NAME,
            },
        },
        android: {
            ...config.android,
            package: target.bundleId,
            versionCode,
        },
        plugins: [
            ...(config.plugins ?? []),
            // Keystore-backed refresh-token storage; the config plugin wires the native module.
            'expo-secure-store',
            './plugins/with-android-abi-splits',
            './plugins/with-react-native-config',
            ['./plugins/with-android-app-name', { appName: validatedConfig.APP_NAME }],
        ],
        /**
         * The allowlisted keys only, never a spread of the parsed file. `extra` ends up inside
         * the IPA/APK in plain text, so spreading meant any variable a future dev added to
         * `.env` — a token, a key — shipped with the binary and could be read by unzipping it.
         */
        extra: { ...validatedConfig },
    };
};
