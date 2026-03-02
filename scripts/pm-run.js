#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function detectPackageManager() {
    const cwd = process.cwd();

    if (fs.existsSync(path.join(cwd, 'yarn.lock'))) {
        try {
            execSync('yarn --version', { stdio: 'ignore' });
            return 'yarn';
        } catch {
            // Fall through
        }
    }

    return 'npm';
}

const pm = detectPackageManager();
const script = process.argv[2];

if (!script) {
    console.log('Usage: node pm-run.js <script-name>');
    process.exit(1);
}

try {
    if (pm === 'yarn') {
        execSync(`yarn ${script}`, { stdio: 'inherit', shell: true });
    } else {
        execSync(`npm run ${script}`, { stdio: 'inherit', shell: true });
    }
} catch (error) {
    process.exit(error.status || 1);
}
