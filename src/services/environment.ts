import Constants from 'expo-constants';
import Config from 'react-native-config';

import type { ExpoConfig } from 'expo/config';

/**
 * Two independent sources describe the same environment:
 *
 *   expo-constants       app.config.ts -> extra     resolved when the JS bundle is built,
 *                                                   readable from JS only
 *   react-native-config  ENVFILE -> BuildConfig     resolved when the native app is compiled,
 *                        / Info.plist               readable from JS *and* native code
 *
 * Both read the same `.env*` file, but they are selected by different variables: `APP_ENV` for
 * the first, `ENVFILE` for the second. A build that exports only one of them produces a binary
 * whose JS config and native config describe *different* environments, and nothing anywhere
 * reports an error. `assertSourcesAgree` converts that into a startup failure, which is the
 * whole reason for keeping both sources rather than either one alone.
 */
/**
 * The keys `app.config.ts` requires, and therefore the ones both sources must agree on.
 * Duplicated there as `PUBLISHED_ENV_KEYS`; the two lists must be kept identical, and cannot
 * share a module because `app.config.ts` runs in Node before Metro exists.
 */
const SHARED_KEYS = ['APP_FLAVOR', 'APP_NAME', 'API_URL', 'VERSION_NAME', 'VERSION_CODE'] as const;

class EnvironmentService {
    private static instance: EnvironmentService;
    private config: ExpoConfig['extra'];
    private nativeConfig: Record<string, string | undefined>;

    private constructor() {
        const extra = Constants.expoConfig?.extra;
        if (!extra) {
            throw new Error('Missing Expo configuration');
        }

        this.config = extra;
        this.nativeConfig = (Config ?? {}) as Record<string, string | undefined>;
        this.assertSourcesAgree();
    }

    /**
     * Compares every shared key, not just the flavor, because the two sources parse the same
     * file with different rules and any key can diverge.
     *
     * A key is only compared when both sides have a value. There is no native module under Jest,
     * so `nativeConfig` is empty there and the check stays quiet instead of failing every test;
     * the same applies to a key a build legitimately omits.
     */
    private assertSourcesAgree(): void {
        const disagreements = SHARED_KEYS.flatMap((key) => {
            const jsValue: string | undefined = this.config?.[key];
            const nativeValue = this.nativeConfig[key];

            if (!jsValue || !nativeValue || jsValue === nativeValue) {
                return [];
            }
            return [`${key}: JS bundle has "${jsValue}", native build has "${nativeValue}"`];
        });

        if (disagreements.length === 0) {
            return;
        }

        throw new Error(
            `Environment mismatch between the JS bundle and the native build:\n  ${disagreements.join('\n  ')}\n` +
                'Two known causes. Either APP_ENV and ENVFILE selected different files — export ' +
                'both for the same environment and rebuild. Or the .env file uses a trailing `#` ' +
                'comment on that line: dotenv strips those, but react-native-config keeps ' +
                'everything after `=` on both platforms, so move such comments onto their own line.'
        );
    }

    static getInstance(): EnvironmentService {
        if (!this.instance) {
            this.instance = new EnvironmentService();
        }
        return this.instance;
    }

    get apiBaseUrl(): string {
        return this.config?.API_URL;
    }

    get appFlavor(): string {
        return this.config?.APP_FLAVOR;
    }

    get versionName(): string {
        return this.config?.VERSION_NAME;
    }

    get versionCode(): string {
        return this.config?.VERSION_CODE;
    }

    isDevelopment(): boolean {
        return this.config?.APP_FLAVOR === 'development';
    }

    isStaging(): boolean {
        return this.config?.APP_FLAVOR === 'staging';
    }

    isProduction(): boolean {
        return this.config?.APP_FLAVOR === 'production';
    }

    get appName(): string {
        return this.config?.APP_NAME;
    }
}

export type Environment = Pick<
    EnvironmentService,
    | 'apiBaseUrl'
    | 'appFlavor'
    | 'appName'
    | 'versionName'
    | 'versionCode'
    | 'isDevelopment'
    | 'isStaging'
    | 'isProduction'
>;

/**
 * A facade, not the instance.
 *
 * Constructing `EnvironmentService` reads the Expo config and can throw. Building it at import
 * time meant a bad `.env` threw while the module graph was still loading — before React mounted,
 * so there was no error boundary and no log, just a white screen. Every member below resolves
 * the singleton on access instead, which moves the failure inside the bootstrap try/catch.
 */
export const environment: Environment = Object.freeze({
    get apiBaseUrl() {
        return EnvironmentService.getInstance().apiBaseUrl;
    },
    get appFlavor() {
        return EnvironmentService.getInstance().appFlavor;
    },
    get appName() {
        return EnvironmentService.getInstance().appName;
    },
    get versionName() {
        return EnvironmentService.getInstance().versionName;
    },
    get versionCode() {
        return EnvironmentService.getInstance().versionCode;
    },
    isDevelopment: () => EnvironmentService.getInstance().isDevelopment(),
    isStaging: () => EnvironmentService.getInstance().isStaging(),
    isProduction: () => EnvironmentService.getInstance().isProduction(),
});
