#!/usr/bin/env node

/**
 * Builds and runs the app for one environment.
 *
 * `expo run:<platform>` only prebuilds when the native directory is missing. With ios/ and
 * android/ already on disk it goes straight to compiling, so changing APP_ENV on its own
 * produces a binary still carrying the previous environment's bundle id, display name and
 * version — while the JS bundle and react-native-config both hold the new one. Nothing
 * detects that, because those two agree with each other. Prebuild therefore has to be an
 * explicit first step.
 *
 * `--clean` is deliberately not used: a plain prebuild re-applies the config to the existing
 * project, which is enough to update the identity and avoids a full pod install every time.
 *
 * Setting the variables here rather than as a shell prefix also makes the scripts work on
 * Windows, where `APP_ENV=staging npx …` is not valid.
 *
 * Usage: node scripts/run-app.js <ios|android> <development|staging|production> [extra args]
 */

const { spawnSync } = require('node:child_process');

const { VARIANTS } = require('./lib/variant-config.cjs');

const PLATFORMS = ['ios', 'android'];

const [platform, appEnv = 'development', ...passthrough] = process.argv.slice(2);

if (!PLATFORMS.includes(platform)) {
    console.error(`run-app: expected platform to be one of ${PLATFORMS.join(', ')}, received "${platform}".`);
    process.exit(1);
}

const variant = VARIANTS[appEnv];
if (!variant) {
    console.error(`run-app: unknown environment "${appEnv}". Expected one of ${Object.keys(VARIANTS).join(', ')}.`);
    process.exit(1);
}

const envFile = variant.envFile;

// APP_ENV selects the config file for app.config.ts; ENVFILE selects it for
// react-native-config on both platforms. They must name the same environment, and
// src/shared/config/environment.ts throws at startup if they ever disagree.
const env = { ...process.env, APP_ENV: appEnv, ENVFILE: envFile };

const run = (args) => {
    console.log(`\n> APP_ENV=${appEnv} ENVFILE=${envFile} npx ${args.join(' ')}\n`);
    const { status } = spawnSync('npx', args, { stdio: 'inherit', env, shell: process.platform === 'win32' });
    if (status !== 0) process.exit(status ?? 1);
};

run(['expo', 'prebuild', '-p', platform]);
run(['expo', `run:${platform}`, ...passthrough]);
