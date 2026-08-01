import { name as projectName } from './package.json';
// Replaces `dotenv.config({ path: envFile })` feeding the parsed object straight into
// validation. See that module for the precedence it enforces — shell / eas env:exec beats
// the variant file beats whatever @expo/env already loaded — and why plain "skip anything
// already defined" is not sufficient.
import { loadVariantEnv } from './scripts/lib/load-variant-env.cjs';
// Shared with check-env.js, env-sync.cjs, env-exec.cjs and setup-env.js so the copies
// cannot drift. Imported rather than `require`d: under `moduleResolution: bundler`,
// `require` is a function typed `any`, which would silently discard the exhaustiveness
// checking the local `Record<AppEnv, EnvTarget>` annotation used to provide. An import
// resolves the sibling `.d.cts`, so adding a fourth variant stays a compile error.
import { DEFAULT_VARIANT, PUBLISHED_ENV_KEYS, VARIANTS } from './scripts/lib/variant-config.cjs';

import type { AppEnv } from './scripts/lib/variant-config.cjs';
import type { ConfigContext, ExpoConfig } from 'expo/config';

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
    if (!candidate) return DEFAULT_VARIANT;

    if (!(candidate in VARIANTS)) {
        throw new Error(
            `APP_ENV="${value}" is not a known environment. Use one of: ${Object.keys(VARIANTS).join(', ')}`
        );
    }

    return candidate as AppEnv;
};

/** Exactly the published keys, each proven present by `readPublishedEnv`. */
type PublishedEnv = Record<(typeof PUBLISHED_ENV_KEYS)[number], string>;

/**
 * Reads the published keys out of the environment the variant file has been merged into.
 *
 * Reading from `process.env` rather than from the parsed file is what makes the EAS path
 * work: under `eas env:exec` the values arrive through the environment and the file may
 * legitimately not exist at all. A missing file is therefore no longer an error on its
 * own — only a value that neither route supplied is.
 */
const readPublishedEnv = (
    env: NodeJS.ProcessEnv,
    fileValues: Record<string, string>,
    appEnv: AppEnv,
    envFile: string
): PublishedEnv => {
    const missingVars = PUBLISHED_ENV_KEYS.filter((key) => !env[key]);
    if (missingVars.length > 0) {
        throw new Error(
            `Missing required env variables: ${missingVars.join(', ')}. ` +
                `Define them in ${envFile} (run "pnpm env:setup" or "pnpm env:pull ${appEnv}"), ` +
                `or supply them through the environment with "pnpm env:exec ${appEnv} -- <command>".`
        );
    }

    // Scoped to the file's own keys: `process.env` legitimately holds empty values that
    // have nothing to do with this project, while an empty line in the env file is the
    // mistake `.env.example` warns about — delete the line instead of assigning nothing.
    const emptyVars = Object.entries(fileValues)
        .filter(([, value]) => value === '')
        .map(([key]) => key);

    if (emptyVars.length > 0) {
        throw new Error(`Empty values in ${envFile}: ${emptyVars.join(', ')}`);
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
    const target = VARIANTS[appEnv];
    const fileValues = loadVariantEnv({ envFile: target.envFile });
    const validatedConfig = readPublishedEnv(process.env, fileValues, appEnv, target.envFile);
    assertFlavorMatchesEnv(validatedConfig.APP_FLAVOR, appEnv, target.envFile);
    const versionCode = parseVersionCode(validatedConfig.VERSION_CODE);

    /**
     * Resolved from the environment, never committed. An EAS project id identifies one
     * project on expo.dev; baking this template author's id into the boilerplate would put
     * every generated app on the same EAS project, sharing environments and update
     * channels with strangers. Each project runs `eas init` to get its own — see the
     * README's EAS section.
     */
    const easProjectId =
        process.env.EXPO_PROJECT_ID || (config.extra?.eas as { projectId?: string } | undefined)?.projectId;

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
         *
         * `eas` is omitted entirely when no project id is set, so a clone with no Expo
         * account still resolves a valid config instead of publishing an empty id.
         */
        extra: {
            ...validatedConfig,
            ...(easProjectId ? { eas: { projectId: easProjectId } } : {}),
        },
    };
};
