/**
 * Loads a variant's env file into `process.env` with the precedence the build depends on:
 *
 *     eas env:exec / shell  >  .env.<variant>  >  whatever @expo/env already loaded
 *
 * This replaces `dotenv.config({ path: envFile })` feeding `validateEnvConfig` the file's
 * parsed object directly. Reading straight from the parsed file made the file the only
 * source that could ever win: `API_URL=https://real.example.com pnpm ios` resolved to the
 * value in `.env`, and so would every variable `eas env:exec` injects. The whole point of
 * making EAS the source of truth is that an injected value cannot be silently overridden
 * by a stale local file.
 *
 * Two loaders run, and only one of them knows about variants. `@expo/env` runs first,
 * unconditionally, and keys off `NODE_ENV` — it has no idea `APP_ENV` exists. So by the
 * time `app.config.ts` is evaluated, `process.env` may already hold a *different*
 * variant's values.
 *
 * This is why "skip anything already defined" is not enough on its own: it inverts the
 * shell-vs-file precedence correctly while quietly breaking variant selection, because a
 * staging build with a `.env` present would keep every development value. The failure is
 * close to invisible — the bundle ids and app labels come from `app.config.ts` itself and
 * stay correct, so only `extra.*`, the half the running app reads, is wrong: a staging
 * build talking to the development API under the right name.
 *
 * The rule: a value is overridable when it equals what one of the files `@expo/env` could
 * have loaded holds. Anything else came from the shell or from `eas env:exec` and wins.
 *
 * Residual case: a shell variable set to exactly the value one of those files holds is
 * indistinguishable from the file's own, so the variant file overrides it. Reaching it
 * means exporting development's value and then building staging, and the result is the
 * value the variant file asked for.
 *
 * Known limitation: `@expo/env` expands `${VAR}` references and this loader does not, so a
 * file using them leaves an expanded value in `process.env` that matches nothing here and
 * is therefore read as shell-provided — meaning the variant file will not override it.
 * Avoid `${VAR}` in `.env*` files; `.env.example` already asks for literal values.
 */

const path = require('path');

const { parseEnvFile } = require('./parse-env-file.cjs');

/**
 * Files `@expo/env` may have loaded, in its own precedence order (first wins).
 * Mirrors `@expo/env`'s `getFiles`.
 */
function expoEnvFiles(nodeEnv) {
    return [nodeEnv && `.env.${nodeEnv}.local`, '.env.local', nodeEnv && `.env.${nodeEnv}`, '.env'].filter(Boolean);
}

/**
 * Merge the variant's env file into `env`, then report what the file itself declared.
 *
 * The return value is the file's own contents, not the merged result: callers use it to
 * check the file for empty values, which is a statement about the file and not about the
 * environment the build ends up running with.
 *
 * @param {object} options
 * @param {string} options.envFile        The variant's env file, relative to projectRoot.
 * @param {string} [options.projectRoot]  Defaults to `process.cwd()`.
 * @param {NodeJS.ProcessEnv} [options.env] The environment to read and mutate.
 * @param {string} [options.nodeEnv]      Defaults to `env.NODE_ENV`.
 * @returns {Record<string, string>} The variant file's parsed contents; `{}` if absent.
 */
function loadVariantEnv({ envFile, projectRoot = process.cwd(), env = process.env, nodeEnv = env.NODE_ENV } = {}) {
    // Later files are lower precedence for @expo/env, so merging in reverse leaves the
    // higher-precedence value in place — the one actually sitting in `env` right now.
    const overridable = {};
    for (const candidate of expoEnvFiles(nodeEnv)
        .filter((file) => file !== envFile)
        .reverse()) {
        Object.assign(overridable, parseEnvFile(path.join(projectRoot, candidate)));
    }

    const fileValues = parseEnvFile(path.join(projectRoot, envFile));

    for (const [key, value] of Object.entries(fileValues)) {
        if (env[key] === undefined || env[key] === overridable[key]) {
            env[key] = value;
        }
    }

    // Withdraw the values @expo/env loaded for keys this variant does NOT declare.
    //
    // Merging alone leaves them in place, and they are another variant's values: a
    // `.env.production` that omits VERSION_CODE would inherit development's `1` from
    // `.env` and ship a release build with the wrong versionCode. Nothing downstream
    // catches that — APP_FLAVOR is present, so the flavor check passes, and the https rule
    // only guards API_URL. Withdrawing them restores the rule the parsed-file approach had
    // by construction: the variant file is the only file that speaks for the variant, and
    // a key it omits is missing rather than inherited.
    //
    // Only values that still match what a lower-precedence file holds are withdrawn, so
    // anything the shell or `eas env:exec` injected survives.
    for (const [key, value] of Object.entries(overridable)) {
        if (!(key in fileValues) && env[key] === value) {
            delete env[key];
        }
    }

    return fileValues;
}

module.exports = { loadVariantEnv };
