/**
 * The parser every tool that reads an env file goes through.
 *
 * The commented-out case is the one that mattered: `check-env.js` used to test for a
 * variable with `contents.includes('API_URL=')`, which a `# API_URL=` line satisfies. The
 * pre-build check passed on a file `app.config.ts` then rejected.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

const { parseEnv, parseEnvFile } = require('../parse-env-file.cjs');

describe('parseEnv', () => {
    it('reads plain assignments', () => {
        expect(parseEnv('API_URL=http://localhost:3000\nAPP_NAME=MyApp\n')).toEqual({
            API_URL: 'http://localhost:3000',
            APP_NAME: 'MyApp',
        });
    });

    it('ignores a commented-out assignment', () => {
        expect(parseEnv('# API_URL=http://localhost:3000\n')).toEqual({});
    });

    it('strips a trailing comment, as dotenv does', () => {
        // `.env.example` warns against these because react-native-config keeps everything
        // after `=` and would compile the comment into the native build.
        expect(parseEnv('APP_FLAVOR=development # (development|staging|production)\n')).toEqual({
            APP_FLAVOR: 'development',
        });
    });

    it('keeps a # that is part of a quoted value', () => {
        expect(parseEnv('COLOR="#FFFFFF"\n')).toEqual({ COLOR: '#FFFFFF' });
    });

    it('keeps everything after the first = in the value', () => {
        expect(parseEnv('TOKEN=a=b=c\n')).toEqual({ TOKEN: 'a=b=c' });
    });

    it('preserves an empty value rather than dropping the key', () => {
        // app.config.ts reports empty values by name; dropping the key would report it as
        // missing instead, pointing at the wrong fix.
        expect(parseEnv('API_URL=\n')).toEqual({ API_URL: '' });
    });

    it('skips blank and malformed lines', () => {
        expect(parseEnv('\n   \nnot-an-assignment\n=novalue\nAPP_NAME=MyApp\n')).toEqual({ APP_NAME: 'MyApp' });
    });
});

describe('parseEnvFile', () => {
    it('yields an empty object for a missing file', () => {
        expect(parseEnvFile(path.join(os.tmpdir(), 'definitely-not-here.env'))).toEqual({});
    });

    it('parses an existing file', () => {
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'parse-env-'));
        const file = path.join(dir, '.env');
        fs.writeFileSync(file, 'APP_NAME=MyApp\n');

        expect(parseEnvFile(file)).toEqual({ APP_NAME: 'MyApp' });

        fs.rmSync(dir, { recursive: true, force: true });
    });
});
