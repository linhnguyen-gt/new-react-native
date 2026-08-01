/**
 * Types for the variant env loader.
 *
 * A sibling declaration file so `app.config.ts` sees the returned record as
 * `Record<string, string>` rather than `any` — the parsed file is what its empty-value
 * check runs against.
 */

export declare function loadVariantEnv(options: {
    envFile: string;
    projectRoot?: string;
    env?: NodeJS.ProcessEnv;
    nodeEnv?: string;
}): Record<string, string>;
