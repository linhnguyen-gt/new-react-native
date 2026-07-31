#!/usr/bin/env node

const { execSync } = require('child_process');

const { detectPackageManager } = require('./detect-package-manager');

/** `install` is a top-level command, not a script, so it must not take `run`. */
const TOP_LEVEL_COMMANDS = new Set(['install']);

function buildCommand(manager, script) {
    if (TOP_LEVEL_COMMANDS.has(script)) {
        return `${manager} install`;
    }
    // yarn omits `run`; npm and pnpm require it.
    return manager === 'yarn' ? `yarn ${script}` : `${manager} run ${script}`;
}

const script = process.argv[2];

if (!script) {
    console.log('Usage: node pm-run.js <script-name>');
    process.exit(1);
}

try {
    execSync(buildCommand(detectPackageManager(), script), { stdio: 'inherit', shell: true });
} catch (error) {
    process.exit(error.status || 1);
}
