type EnvironmentModule = typeof import('../environment');

/**
 * The module builds its singleton at import time, so each case resets the module registry and
 * re-requires with the mocks it needs. Constructing the service directly is not an option —
 * the constructor is private and the instance is cached.
 */
const loadEnvironment = (
    jsExtra: Record<string, string> | null,
    nativeConfig: Record<string, string>
): EnvironmentModule => {
    jest.resetModules();

    jest.doMock('expo-constants', () => ({
        __esModule: true,
        default: { expoConfig: jsExtra === null ? null : { extra: jsExtra } },
    }));
    jest.doMock('react-native-config', () => ({
        __esModule: true,
        Config: nativeConfig,
        default: nativeConfig,
    }));

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('../environment') as EnvironmentModule;
};

const STAGING_EXTRA = {
    APP_FLAVOR: 'staging',
    APP_NAME: 'MyApp Staging',
    API_URL: 'https://staging.example.com',
    VERSION_NAME: '1.0.1',
    VERSION_CODE: '2',
};

describe('environment', () => {
    it('exposes the JS config when both sources agree', () => {
        const { environment } = loadEnvironment(STAGING_EXTRA, { APP_FLAVOR: 'staging' });

        expect(environment.appFlavor).toBe('staging');
        expect(environment.apiBaseUrl).toBe('https://staging.example.com');
        expect(environment.appName).toBe('MyApp Staging');
        expect(environment.versionName).toBe('1.0.1');
        expect(environment.versionCode).toBe('2');
        expect(environment.isStaging()).toBe(true);
        expect(environment.isDevelopment()).toBe(false);
        expect(environment.isProduction()).toBe(false);
    });

    it('throws naming both values when the sources disagree', () => {
        // APP_ENV selected .env.staging for the bundle while ENVFILE left the native side on
        // .env — the silent-wrong-config case the guard exists to catch.
        expect(() => loadEnvironment(STAGING_EXTRA, { APP_FLAVOR: 'development' })).toThrow(
            /APP_FLAVOR: JS bundle has "staging", native build has "development"/
        );
    });

    it('catches an inline comment kept by the native parser', () => {
        // dotenv strips `# ...` from a value; react-native-config keeps everything after `=` on
        // both platforms. Observed for real in a generated Android BuildConfig, which is why
        // this is a distinct case rather than a variation of the mismatch above.
        expect(() => loadEnvironment(STAGING_EXTRA, { APP_FLAVOR: 'staging # (development|staging)' })).toThrow(
            /APP_FLAVOR: JS bundle has "staging", native build has "staging # /
        );
    });

    it('reports every disagreeing key, not just the first', () => {
        expect(() => loadEnvironment(STAGING_EXTRA, { APP_FLAVOR: 'development', API_URL: 'http://wrong' })).toThrow(
            /APP_FLAVOR:[\s\S]*API_URL:/
        );
    });

    it('ignores keys the native build does not define', () => {
        // A build may legitimately omit a key; absent is not a mismatch.
        const { environment } = loadEnvironment(STAGING_EXTRA, { APP_FLAVOR: 'staging' });

        expect(environment.apiBaseUrl).toBe('https://staging.example.com');
    });

    it('stays quiet when the native config is absent', () => {
        // No native module is present under Jest, and release builds may legitimately omit the
        // key. Absent means "no opinion", not "mismatch".
        const { environment } = loadEnvironment(STAGING_EXTRA, {});

        expect(environment.appFlavor).toBe('staging');
    });

    it('throws when the Expo config is missing entirely', () => {
        expect(() => loadEnvironment(null, {})).toThrow('Missing Expo configuration');
    });
});
