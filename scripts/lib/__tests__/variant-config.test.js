/**
 * Guards the shared variant table against the drift TypeScript cannot see.
 *
 * `variant-config.d.cts` is hand-written, so adding a fourth variant to the runtime table
 * without adding it to the declaration is silent: every consumer keeps compiling, and the
 * new variant simply never appears where `AppEnv` is the key type. These assertions fail
 * instead.
 *
 * The env-file and EAS-environment checks matter for the same reason `env-sync.cjs` reads
 * the mapping from here: pushing a variant's values to the wrong EAS environment succeeds
 * silently, and the next build reads another environment's API_URL.
 */

const fs = require('fs');
const path = require('path');

const { BASE_BUNDLE_ID, DEFAULT_VARIANT, PUBLISHED_ENV_KEYS, VARIANTS } = require('../variant-config.cjs');

const EAS_ENVIRONMENTS = ['development', 'preview', 'production'];

const declaration = () => fs.readFileSync(path.join(__dirname, '..', 'variant-config.d.cts'), 'utf8');

/** String literals inside a declaration fragment, however it happens to be formatted. */
const literals = (fragment) => [...fragment.matchAll(/['"]([^'"]+)['"]/g)].map((match) => match[1]);

/** The `AppEnv` union as the declaration file states it. */
const declaredVariants = () => {
    // Tolerates a prettier-reformatted multi-line union and either quote style: only the
    // string literals are read, not the layout around them.
    const union = declaration().match(/export type AppEnv =([^;]+);/);

    if (!union) {
        throw new Error('variant-config.d.cts no longer declares an AppEnv union');
    }

    return literals(union[1]);
};

/** The `PUBLISHED_ENV_KEYS` tuple as the declaration file states it. */
const declaredPublishedKeys = () => {
    const tuple = declaration().match(/export declare const PUBLISHED_ENV_KEYS:([^;]+);/);

    if (!tuple) {
        throw new Error('variant-config.d.cts no longer declares PUBLISHED_ENV_KEYS');
    }

    return literals(tuple[1]);
};

describe('variant table', () => {
    it('declares the same variants at runtime and in the type declaration', () => {
        expect(declaredVariants().sort()).toEqual(Object.keys(VARIANTS).sort());
    });

    it('defaults to a variant that exists', () => {
        expect(VARIANTS[DEFAULT_VARIANT]).toBeDefined();
    });

    it.each(Object.entries(VARIANTS))('%s is fully specified', (_name, variant) => {
        expect(variant.envFile).toMatch(/^\.env/);
        expect(variant.bundleId.startsWith(BASE_BUNDLE_ID)).toBe(true);
        // EAS ships exactly these three; a fourth name is a paid feature, which is why
        // `staging` maps onto `preview`.
        expect(EAS_ENVIRONMENTS).toContain(variant.easEnvironment);
    });

    it('gives every variant its own env file, bundle id and EAS environment', () => {
        for (const field of ['envFile', 'bundleId', 'easEnvironment']) {
            const values = Object.values(VARIANTS).map((variant) => variant[field]);
            expect(new Set(values).size).toBe(values.length);
        }
    });

    it('declares the same published keys at runtime and in the type declaration', () => {
        // `PublishedEnv` in app.config.ts is derived from the declared tuple, so a key added
        // to the runtime array alone is validated at build time but absent from the type —
        // and one removed from the array alone types as present and resolves undefined.
        expect(declaredPublishedKeys()).toEqual([...PUBLISHED_ENV_KEYS]);
    });

    it('publishes the keys the app reads through extra', () => {
        // Duplicated as SHARED_KEYS in src/shared/config/environment.ts, which is bundled
        // into the app and deliberately does not import from scripts/. The two must agree:
        // environment.ts compares the manifest against the native values and throws when
        // a key is missing from either side.
        expect(PUBLISHED_ENV_KEYS).toEqual(['APP_FLAVOR', 'APP_NAME', 'API_URL', 'VERSION_NAME', 'VERSION_CODE']);
    });
});
