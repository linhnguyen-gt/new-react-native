#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function detectPackageManager() {
    const cwd = process.cwd();

    if (fs.existsSync(path.join(cwd, 'yarn.lock'))) {
        try {
            require('child_process').execSync('yarn --version', { stdio: 'ignore' });
            return 'yarn';
        } catch {
            // Fall through to npm
        }
    }

    if (fs.existsSync(path.join(cwd, 'package-lock.json'))) {
        return 'npm';
    }

    return 'yarn';
}

console.log(detectPackageManager());
