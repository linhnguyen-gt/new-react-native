/**
 * Types for the shared variant table.
 *
 * A sibling declaration file, because `app.config.ts` reaches this module through a
 * CommonJS require — which TypeScript types as `any`. Without this, replacing the local
 * `Record<AppEnv, EnvTarget>` annotation with the shared table would silently trade the
 * exhaustiveness check away: adding a fourth variant, or dropping `envFile`, would stop
 * being a compile error.
 */

export type AppEnv = 'development' | 'staging' | 'production';

/** EAS ships only development/preview/production, so `staging` maps onto `preview`. */
export type EasEnvironment = 'development' | 'preview' | 'production';

export interface VariantConfig {
    /** Which dotenv file supplies this variant's values. */
    envFile: string;
    /**
     * Shared by iOS and Android. One identifier per variant is what stops the two
     * platforms drifting apart — the pre-CNG setup kept them in separate native files and
     * ended up with three mutually inconsistent ids.
     */
    bundleId: string;
    /** Where `env:pull` / `env:push` / `env:exec` read and write this variant's values. */
    easEnvironment: EasEnvironment;
}

export declare const BASE_BUNDLE_ID: string;
export declare const DEFAULT_VARIANT: AppEnv;
export declare const VARIANTS: Record<AppEnv, VariantConfig>;
export declare const PUBLISHED_ENV_KEYS: readonly ['APP_FLAVOR', 'APP_NAME', 'API_URL', 'VERSION_NAME', 'VERSION_CODE'];
