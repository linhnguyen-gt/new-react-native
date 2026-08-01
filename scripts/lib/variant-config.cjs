/**
 * One variant table for every consumer.
 *
 * The env-file names, the bundle identifiers and the list of required variables used to be
 * restated in each tool that needed them, with no way of noticing when the copies
 * disagreed:
 *
 *   app.config.ts    ENV_TARGETS (env file + bundle id) and PUBLISHED_ENV_KEYS
 *   check-env.js     its own `requiredVars` array
 *   setup-env.js     its own ENVIRONMENTS array and `.env.${key}` naming
 *
 * The concrete failure that class of drift produces: `check-env.js` runs before every
 * native build and is what tells a developer their `.env` is complete. Add a key to
 * `PUBLISHED_ENV_KEYS` and forget its copy in `check-env.js`, and the pre-build check
 * passes on a file `app.config.ts` will refuse minutes later, pointing at the config
 * rather than at the missing variable.
 *
 * Consumers: `app.config.ts`, `check-env.js`, `env-sync.cjs`, `env-exec.cjs`,
 * `setup-env.js`.
 *
 * `src/shared/config/environment.ts` deliberately keeps its own `SHARED_KEYS`: it is
 * bundled into the app, and pulling a `scripts/` module into the JS bundle to save one
 * list would trade a small duplication for a build-graph dependency.
 */

const BASE_BUNDLE_ID = 'com.newreactnative';

/** The variant used when `APP_ENV` is absent. An unrecognised value is a typo, not this. */
const DEFAULT_VARIANT = 'development';

/**
 * `easEnvironment` is the EAS environment each variant's values live in.
 *
 * EAS ships exactly three environments — `development`, `preview`, `production` — and
 * naming a fourth one `staging` is a paid feature (Production plan and above). So this
 * repo's `staging` variant maps onto EAS's `preview`, and only here: the local file name,
 * the bundle id suffix and everything the app itself reads keep saying "staging".
 *
 * Pushing a variant's values to the wrong EAS environment is silent — the command
 * succeeds and the next build reads another environment's API_URL — which is why the
 * mapping lives in the same table as the file names rather than inline in each script.
 */
const VARIANTS = {
    development: {
        envFile: '.env',
        bundleId: BASE_BUNDLE_ID,
        easEnvironment: 'development',
    },
    staging: {
        envFile: '.env.staging',
        bundleId: `${BASE_BUNDLE_ID}.stg`,
        easEnvironment: 'preview',
    },
    production: {
        envFile: '.env.production',
        bundleId: `${BASE_BUNDLE_ID}.production`,
        easEnvironment: 'production',
    },
};

/**
 * The keys published to the running app through `extra`, and the ones every env file must
 * define.
 *
 * `extra` ends up inside the IPA/APK in plain text, so this is an allowlist rather than a
 * spread of the parsed file: without it, any variable a future developer adds to `.env` —
 * a token, a key — ships with the binary and can be read by unzipping it.
 */
const PUBLISHED_ENV_KEYS = ['APP_FLAVOR', 'APP_NAME', 'API_URL', 'VERSION_NAME', 'VERSION_CODE'];

module.exports = { BASE_BUNDLE_ID, DEFAULT_VARIANT, VARIANTS, PUBLISHED_ENV_KEYS };
