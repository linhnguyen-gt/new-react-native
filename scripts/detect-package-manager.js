#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/** Lockfiles in priority order, mapped to the manager that owns them. */
const LOCKFILES = [
    ['pnpm-lock.yaml', 'pnpm'],
    ['yarn.lock', 'yarn'],
    ['package-lock.json', 'npm'],
];

function isAvailable(manager) {
    try {
        execSync(`${manager} --version`, { stdio: 'ignore' });
        return true;
    } catch {
        return false;
    }
}

function detectPackageManager() {
    const cwd = process.cwd();

    for (const [lockfile, manager] of LOCKFILES) {
        if (fs.existsSync(path.join(cwd, lockfile)) && isAvailable(manager)) {
            return manager;
        }
    }

    return 'npm';
}

module.exports = { detectPackageManager };

if (require.main === module) {
    console.log(detectPackageManager());
}
