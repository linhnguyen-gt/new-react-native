/**
 * Types for the shared env parser.
 *
 * A sibling declaration file for the same reason `variant-config.d.cts` is one:
 * `app.config.ts` reaches this module through a CommonJS require, which TypeScript types
 * as `any`. Without it every env value read by the config would be `any`.
 */

/** Parse env-file text. Malformed lines are skipped. */
export declare function parseEnv(contents: string): Record<string, string>;

/** Parse an env file by path. A missing or unreadable file yields `{}`. */
export declare function parseEnvFile(filePath: string): Record<string, string>;
