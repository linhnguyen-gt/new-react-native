#!/usr/bin/env node

/**
 * Run a command with a variant's EAS environment injected, no env file involved.
 *
 *   pnpm env:exec staging -- pnpm exec expo export --platform android
 *   pnpm env:exec production -- pnpm check:env
 *
 * This is the route that makes EAS the source of truth rather than a place files are
 * copied from. `eas env:exec` populates `process.env` before the command starts, and
 * `app.config.ts` loads its env file *without overwriting* anything already defined — so
 * the EAS values win and the local file cannot silently override them with stale data.
 *
 * NOT for a native build (`pnpm ios:stg`, `pnpm android:prod`). Only the JS half reads
 * `process.env`: react-native-config compiles the *file* named by ENVFILE into
 * BuildConfig/Info.plist and never sees an injected value. If EAS and the local file
 * disagree, the two halves ship different values and `src/shared/config/environment.ts`
 * throws at startup — which is exactly when EAS holds something the file does not, the
 * case this command exists for. Run `pnpm env:pull <variant>` first, then build normally.
 *
 * Only non-secret variables are injected: EAS refuses to read `secret`-visibility values
 * outside its own servers, and `app.config.ts` needs every value it reads during config
 * resolution. Keep the variables this project uses at `plaintext` or `sensitive`, which is
 * what `.env.example` already asks for — everything here is compiled into the binary and
 * must be treated as publicly readable regardless.
 */

const { spawnSync } = require('child_process');

const { VARIANTS } = require('./lib/variant-config.cjs');

const args = process.argv.slice(2);
const separator = args.indexOf('--');

const variant = args[0];
const command = separator === -1 ? args.slice(1) : args.slice(separator + 1);

if (!variant || command.length === 0) {
    console.error('Usage: node scripts/env-exec.cjs <development|staging|production> -- <command...>');
    process.exit(1);
}

const target = VARIANTS[variant];

if (!target) {
    console.error(`Unsupported variant: ${variant}`);
    console.error(`Use one of: ${Object.keys(VARIANTS).join(', ')}`);
    process.exit(1);
}

/**
 * `eas env:exec` takes the command as ONE bash string, not as argv after `--`, so the
 * pieces have to be re-quoted before they are joined. Without this, `pnpm env:exec
 * production -- node -e "console.log(1)"` reaches bash as several bare words and the
 * shell re-splits them, running something other than what was asked.
 */
const shellQuote = (arg) => (/^[\w@%+=:,./-]+$/.test(arg) ? arg : `'${arg.replace(/'/g, `'\\''`)}'`);

// `APP_ENV` is set here rather than left to the EAS environment: it selects the env file
// and the bundle id, and it is a property of *which build you asked for* rather than a
// value belonging in a dashboard. Note that `eas env:exec` layers the EAS environment over
// the inherited one, so an `APP_ENV` defined in EAS would still take precedence — do not
// define one there.
const result = spawnSync(
    'pnpm',
    ['dlx', 'eas-cli', 'env:exec', target.easEnvironment, command.map(shellQuote).join(' '), '--non-interactive'],
    // On Windows `pnpm` is a .cmd, which Node cannot resolve without a shell. Note that
    // `eas env:exec` runs its command through bash regardless, so this path needs a bash on
    // PATH (Git Bash, WSL) on Windows either way.
    { stdio: 'inherit', env: { ...process.env, APP_ENV: variant }, shell: process.platform === 'win32' }
);

if (result.error) {
    console.error(result.error.message);
    process.exit(1);
}

process.exit(result.status ?? 0);
