#!/usr/bin/env node

/**
 * Sync env files with EAS, replacing `dotenv-vault push` / `pull`.
 *
 * The variant→environment mapping is the entire reason this is a script rather than a
 * chain of `&&` in package.json. EAS ships only `development`, `preview` and `production`
 * (a fourth name is a paid feature), so this repo's `staging` variant lives in EAS's
 * `preview`. Writing that mapping inline in package.json would put a second copy of it
 * next to the one in `variant-config.cjs`, and pushing a variant to the wrong environment
 * is silent: the command succeeds, and the next build reads another environment's API_URL.
 *
 *   pnpm env:pull            # every variant
 *   pnpm env:pull staging    # just one
 *   pnpm env:push production
 *
 * Values pulled here are the same values that would arrive via `eas env:exec`; the file is
 * for working offline and for the tools that read files (`check-env.js`, and
 * `react-native-config`, which compiles `.env` into the native build).
 */

const { spawnSync } = require('child_process');

const { VARIANTS } = require('./lib/variant-config.cjs');

const [, , direction, ...rest] = process.argv;

if (direction !== 'push' && direction !== 'pull') {
    console.error('Usage: node scripts/env-sync.cjs <push|pull> [development|staging|production] [--force]');
    process.exit(1);
}

const force = rest.includes('--force');
const variantArg = rest.find((arg) => !arg.startsWith('-'));

if (variantArg && !VARIANTS[variantArg]) {
    console.error(`Unsupported variant: ${variantArg}`);
    console.error(`Use one of: ${Object.keys(VARIANTS).join(', ')}`);
    process.exit(1);
}

const variants = variantArg ? [variantArg] : Object.keys(VARIANTS);

for (const variant of variants) {
    const { easEnvironment, envFile } = VARIANTS[variant];

    console.log(`\n${direction === 'pull' ? '⬇' : '⬆'}  ${variant} → EAS "${easEnvironment}" (${envFile})`);

    // The two directions do not take the same flags, and the asymmetry is deliberate on
    // EAS's side: `env:pull` has `--non-interactive`, `env:push` has `--force`.
    //
    // Pull runs unattended — it only overwrites a local file. Push overwrites values the
    // whole team builds against, so its confirmation prompt is left in place unless the
    // caller opts out with `--force`.
    const directionFlags = direction === 'pull' ? ['--non-interactive'] : force ? ['--force'] : [];

    // `pnpm dlx` rather than a dependency: pinning eas-cli here would be a second version
    // to maintain, and this project does not otherwise need the CLI installed.
    const result = spawnSync(
        'pnpm',
        ['dlx', 'eas-cli', `env:${direction}`, easEnvironment, '--path', envFile, ...directionFlags],
        // On Windows `pnpm` is a .cmd, which Node cannot resolve without a shell — the same
        // reason run-app.js and clear-cache.js set this.
        { stdio: 'inherit', shell: process.platform === 'win32' }
    );

    if (result.error) {
        console.error(result.error.message);
        process.exit(1);
    }

    if (result.status !== 0) {
        // Stop rather than continue: a partial sync leaves variants disagreeing about
        // which values are current, and the next build picks whichever it happens to read.
        console.error(`\nFailed on "${variant}". Stopping before the remaining variants.`);
        process.exit(result.status ?? 1);
    }
}

console.log(`\n✅ ${direction === 'pull' ? 'Pulled' : 'Pushed'}: ${variants.join(', ')}`);
