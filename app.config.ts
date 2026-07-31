import * as dotenv from 'dotenv';
import { ConfigContext, ExpoConfig } from 'expo/config';

import { name as projectName } from './package.json';

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

const resolveAppEnv = (value: string | undefined): AppEnv => {
    const candidate = value?.toLowerCase() ?? '';
    return candidate in ENV_TARGETS ? (candidate as AppEnv) : 'development';
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

const validateEnvConfig = (env: Record<string, string>) => {
    const coreRequiredVars = ['APP_FLAVOR', 'VERSION_CODE', 'VERSION_NAME', 'API_URL', 'APP_NAME'];

    const missingVars = coreRequiredVars.filter((key) => !env[key]);
    if (missingVars.length > 0) {
        throw new Error(`Missing required env variables: ${missingVars.join(', ')}`);
    }

    const emptyVars = Object.entries(env)
        .filter(([_, value]) => value === undefined || value === '')
        .map(([key]) => key);

    if (emptyVars.length > 0) {
        throw new Error(`Empty values for environment variables: ${emptyVars.join(', ')}`);
    }

    return env;
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
    const validatedConfig = validateEnvConfig(loadEnvFile(target.envFile));
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
        extra: {
            ...validatedConfig,
        },
    };
};
