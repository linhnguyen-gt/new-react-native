/**
 * Env precedence for a variant build.
 *
 * These pin a failure the app's own tests cannot see, because it is invisible in native
 * output: the bundle ids, app labels and version codes all come from `app.config.ts`
 * itself and stay correct, while `extra.*` — the half the running app reads — carries
 * another environment's values.
 *
 * The order under test:  shell / eas env:exec  >  .env.<variant>  >  @expo/env's files.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

const { loadVariantEnv } = require('../load-variant-env.cjs');

describe('loadVariantEnv', () => {
    let projectRoot;

    beforeEach(() => {
        projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'variant-env-'));
    });

    afterEach(() => {
        fs.rmSync(projectRoot, { recursive: true, force: true });
    });

    const write = (file, contents) => fs.writeFileSync(path.join(projectRoot, file), contents);

    const load = (envFile, env, nodeEnv) => {
        loadVariantEnv({ envFile, projectRoot, env, nodeEnv });
        return env;
    };

    it('fills in variables that are not set at all', () => {
        write('.env.staging', 'API_URL=https://staging.example.com\n');

        expect(load('.env.staging', {}).API_URL).toBe('https://staging.example.com');
    });

    it('overrides values @expo/env loaded from .env', () => {
        // The regression. @expo/env loads `.env` before this runs and knows nothing about
        // APP_ENV, so without this the staging build keeps every development value.
        write('.env', 'APP_NAME=MyApp\nAPI_URL=http://localhost:3000\n');
        write('.env.staging', 'APP_NAME=MyApp Staging\nAPI_URL=https://staging.example.com\n');

        const env = load('.env.staging', { APP_NAME: 'MyApp', API_URL: 'http://localhost:3000' });

        expect(env.APP_NAME).toBe('MyApp Staging');
        expect(env.API_URL).toBe('https://staging.example.com');
    });

    it('overrides values @expo/env loaded from .env.<NODE_ENV>', () => {
        // NODE_ENV=production is normal for a release build of *any* variant, so Expo
        // loads `.env.production` even when staging was asked for.
        write('.env.production', 'APP_NAME=MyApp Production\n');
        write('.env.staging', 'APP_NAME=MyApp Staging\n');

        expect(load('.env.staging', { APP_NAME: 'MyApp Production' }, 'production').APP_NAME).toBe('MyApp Staging');
    });

    it('lets the shell and eas env:exec win', () => {
        write('.env', 'APP_NAME=MyApp\n');
        write('.env.staging', 'APP_NAME=MyApp Staging\n');

        // A value matching no env file can only have come from the shell.
        expect(load('.env.staging', { APP_NAME: 'InjectedByEasEnvExec' }).APP_NAME).toBe('InjectedByEasEnvExec');
    });

    it('does not treat the variant file as a source it may override', () => {
        // `.env` IS the variant file for development, so nothing about it is overridable
        // and a shell value must survive.
        write('.env', 'APP_NAME=MyApp\n');

        expect(load('.env', { APP_NAME: 'MyApp' }).APP_NAME).toBe('MyApp');
        expect(load('.env', { APP_NAME: 'FromShell' }).APP_NAME).toBe('FromShell');
    });

    it('withdraws another variant’s value for a key this variant does not declare', () => {
        // A production file that omits VERSION_CODE used to inherit development's `1` from
        // `.env` and ship a release build with the wrong versionCode. Nothing downstream
        // catches it: APP_FLAVOR is present so the flavor check passes.
        write('.env', 'APP_FLAVOR=development\nVERSION_CODE=1\n');
        write('.env.production', 'APP_FLAVOR=production\n');

        const env = load('.env.production', { APP_FLAVOR: 'development', VERSION_CODE: '1' });

        expect(env.APP_FLAVOR).toBe('production');
        expect(env.VERSION_CODE).toBeUndefined();
    });

    it('keeps an injected value for a key the variant file does not declare', () => {
        // The `eas env:exec` path: the value did not come from any file, so withdrawing it
        // would defeat the whole point of injecting it.
        write('.env', 'VERSION_CODE=1\n');
        write('.env.production', 'APP_FLAVOR=production\n');

        expect(load('.env.production', { VERSION_CODE: '42' }).VERSION_CODE).toBe('42');
    });

    it('leaves unrelated variables alone', () => {
        write('.env.staging', 'API_URL=https://staging.example.com\n');

        expect(load('.env.staging', { PATH: '/usr/bin', HOME: '/home/x' })).toMatchObject({
            PATH: '/usr/bin',
            HOME: '/home/x',
        });
    });

    it('is a no-op when the variant file is missing', () => {
        // The `eas env:exec` path: the values arrive through the environment and no file
        // needs to exist. A throw here would make that route unusable.
        expect(load('.env.staging', { APP_NAME: 'MyApp' }).APP_NAME).toBe('MyApp');
    });

    it('reports the variant file contents, not the merged environment', () => {
        // `app.config.ts` checks the file for empty values; `process.env` legitimately
        // holds empty values that have nothing to do with this project.
        write('.env.staging', 'API_URL=https://staging.example.com\nEMPTY=\n');

        const fileValues = loadVariantEnv({
            envFile: '.env.staging',
            projectRoot,
            env: { PATH: '/usr/bin' },
        });

        expect(fileValues).toEqual({ API_URL: 'https://staging.example.com', EMPTY: '' });
    });
});
