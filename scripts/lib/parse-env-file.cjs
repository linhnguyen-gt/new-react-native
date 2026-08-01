/**
 * One env parser for every build script.
 *
 * `app.config.ts` used to read env files through dotenv while `check-env.js` tested for a
 * variable with `contents.includes('API_URL=')` — a substring match that accepts a
 * commented-out `# API_URL=`. The pre-build check passed on a file `app.config.ts` then
 * rejected, and the error named the config rather than the commented line.
 *
 * Comment handling follows dotenv, which is what `app.config.ts` used before: an unquoted
 * `#` preceded by whitespace begins a comment; a `#` inside quotes is part of the value.
 * `.env.example` warns against trailing comments anyway — react-native-config keeps
 * everything after `=` and would ship the comment into native code — but parsing them the
 * way dotenv does keeps this parser and the previous behaviour in agreement.
 */

const fs = require('fs');

const QUOTED = /^(['"])([\s\S]*)\1$/;

/** Parse env-file text. Returns a plain object; malformed lines are skipped. */
function parseEnv(contents) {
    const env = {};

    for (const line of contents.split(/\r?\n/)) {
        const trimmed = line.trim();

        if (!trimmed || trimmed.startsWith('#')) {
            continue;
        }

        const separatorIndex = trimmed.indexOf('=');
        // `<= 0` also rejects a leading `=`, which has no key.
        if (separatorIndex <= 0) {
            continue;
        }

        const key = trimmed.slice(0, separatorIndex).trim();
        const rawValue = trimmed.slice(separatorIndex + 1).trim();

        const quoted = rawValue.match(QUOTED);
        env[key] = quoted ? quoted[2] : rawValue.replace(/\s+#.*$/, '').trim();
    }

    return env;
}

/** Parse an env file by path. A missing or unreadable file yields `{}`. */
function parseEnvFile(filePath) {
    try {
        return parseEnv(fs.readFileSync(filePath, 'utf8'));
    } catch {
        return {};
    }
}

module.exports = { parseEnv, parseEnvFile };
