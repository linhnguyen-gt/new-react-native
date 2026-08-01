#!/usr/bin/env node

/**
 * Full cache reset: reinstall dependencies, drop the Metro and Haste caches, restart Expo.
 *
 * This replaced a single `&&` chain in package.json that could not work on any platform.
 * It called Unix `rm -rf` *and* Windows `del` in the same chain, so one of the two was
 * always an unknown command: on macOS and Linux the chain died at `del`, and the
 * `expo start --clear` at the end — the entire point of the script — never ran. It also
 * wrote `%localappdata%Temphaste-map-*`, missing both separators, so even on Windows it
 * named a directory that does not exist.
 *
 * Hence Node rather than a longer shell chain: `os.tmpdir()` and `fs.rmSync` are the same
 * on every platform, and each step's failure can be handled on its own instead of
 * aborting the ones after it.
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

/**
 * Metro's on-disk caches, both directly under the OS temp directory.
 *
 * Matched by name against one directory level — never a recursive search — because
 * `os.tmpdir()` honours `TMPDIR`, and a caller who has pointed that at their home
 * directory should lose `metro-cache` and `haste-map-*` there and nothing else.
 */
const TEMP_CACHE_PATTERNS = [/^haste-map-/, /^metro-cache$/];

const remove = (target, label = target) => {
    try {
        fs.rmSync(target, { recursive: true, force: true });
        console.log(`✅ Removed ${label}`);
    } catch (error) {
        console.warn(`⚠️ Could not remove ${label}: ${error.message}`);
    }
};

const clearTempCaches = () => {
    const tmp = os.tmpdir();

    let entries;
    try {
        entries = fs.readdirSync(tmp);
    } catch (error) {
        console.warn(`⚠️ Could not read ${tmp}: ${error.message}`);
        return;
    }

    // Matched by name and joined with path.join, never string-concatenated: this deletes
    // recursively, and a hand-built path is how a cache clear turns into data loss.
    const matches = entries.filter((entry) => TEMP_CACHE_PATTERNS.some((pattern) => pattern.test(entry)));

    if (matches.length === 0) {
        console.log('✅ No Metro caches in the temp directory');
        return;
    }

    for (const entry of matches) {
        remove(path.join(tmp, entry));
    }
};

/**
 * `shell` is opt-in rather than "on for Windows". Under a shell Node does not quote the
 * command, so a `node.exe` under "C:\Program Files" would be split at the space. Only the
 * commands that genuinely need a shell to be found — `npx` and `watchman` are `.cmd`
 * shims on Windows — ask for one; an absolute interpreter path never does.
 */
const run = (command, args, { optional = false, label, shell = false } = {}) => {
    const result = spawnSync(command, args, { stdio: 'inherit', shell });

    if (!result.error && result.status === 0) {
        return;
    }

    const reason = result.error?.message ?? `exit code ${result.status}`;

    if (optional) {
        // watchman is not installed everywhere, and it is a cache — not having one is not
        // a reason to abandon clearing the others.
        console.warn(`⚠️ Skipped ${label ?? command}: ${reason}`);
        return;
    }

    console.error(`❌ ${label ?? command} failed: ${reason}`);
    process.exit(result.status || 1);
};

console.log('🧹 Clearing caches...');

// Resolved from this file, not from the cwd: run from a subdirectory and `process.cwd()`
// would delete that directory's node_modules and then reinstall there, leaving the project
// itself untouched and a stray install behind.
const projectRoot = path.join(__dirname, '..');

process.chdir(projectRoot);

remove(path.join(projectRoot, 'node_modules'), 'node_modules');

// Reinstall through the existing detector so this works under pnpm, yarn and npm alike.
run(process.execPath, [path.join(__dirname, 'pm-run.js'), 'install'], { label: 'dependency install' });

run('watchman', ['watch-del-all'], {
    optional: true,
    label: 'watchman watch-del-all',
    shell: process.platform === 'win32',
});

clearTempCaches();

console.log('\n🚀 Starting Expo with a clean cache...');
run('npx', ['expo', 'start', '--clear'], { label: 'expo start --clear', shell: process.platform === 'win32' });
