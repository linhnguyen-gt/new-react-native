#!/usr/bin/env node

const { execSync } = require('child_process');

const { detectPackageManager } = require('./detect-package-manager');

/** `install` is a top-level command, not a script, so it must not take `run`. */
const TOP_LEVEL_COMMANDS = new Set(['install']);

function buildCommand(manager, script, passthrough = []) {
    if (TOP_LEVEL_COMMANDS.has(script)) {
        return `${manager} install`;
    }
    // yarn omits `run`; npm and pnpm require it.
    const base = manager === 'yarn' ? `yarn ${script}` : `${manager} run ${script}`;

    // Forwarded so an alias behaves like the script it stands in for: `pnpm android:pro
    // --device` used to reach run-app.js's passthrough directly, and would otherwise lose
    // its arguments the moment the script became an alias.
    return passthrough.length > 0 ? `${base} ${passthrough.join(' ')}` : base;
}

const [script, ...passthrough] = process.argv.slice(2);

if (!script) {
    console.log('Usage: node pm-run.js <script-name>');
    process.exit(1);
}

try {
    execSync(buildCommand(detectPackageManager(), script, passthrough), { stdio: 'inherit', shell: true });
} catch (error) {
    process.exit(error.status || 1);
}
