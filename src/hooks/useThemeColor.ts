import { colorScheme } from 'nativewind';
import resolveConfig from 'tailwindcss/resolveConfig';

import tailwindConfig from '../../tailwind.config';
import { themeColors } from '../components/ui/ui-provider/config';

/**
 * Resolves a design-system colour token to a value React Native can actually use.
 *
 * The Tailwind palette cannot serve this directly: every design-system colour there is
 * `rgb(var(--color-…)/<alpha-value>)`, which NativeWind substitutes when it compiles a class
 * but which means nothing to a plain `color` prop. Reading the same variables the provider
 * installs yields a concrete `rgb(r g b)` and keeps one source of truth.
 *
 * The previous version returned the raw Tailwind entry, so every caller in the app was
 * silently handed a `var(...)` string, a whole shade object, or `undefined` — each of which
 * the consuming component quietly rendered as black.
 */

type Scheme = 'light' | 'dark';

const fullConfig = resolveConfig(tailwindConfig);

/**
 * Read from `themeColors`, never from `config`. `config` runs the same data through
 * NativeWind's `vars()`, which returns an opaque style object whose keys cannot be read back
 * at runtime — the Jest mock for nativewind is an identity function, so tests against
 * `config` pass while the app silently gets `undefined`.
 */
const THEME_VARIABLES: Record<Scheme, Record<string, string>> = {
    light: themeColors.light,
    dark: themeColors.dark,
};

/** `primary.600`, `primary-600` and `--color-primary-600` all name the same variable. */
const toVariableName = (token: string): string => `--color-${token.replace(/^--color-/, '').replace(/\./g, '-')}`;

/** Anything already expressed as a colour is handed back untouched. */
const looksLiteral = (token: string): boolean => /^(#|rgb|hsl|transparent$)/i.test(token);

const lookUpPalette = (token: string): string | undefined => {
    const value = token
        .split('.')
        .reduce<unknown>((node, key) => (node as Record<string, unknown> | undefined)?.[key], fullConfig.theme.colors);

    // A shade object or a `var(...)` expression is not something a color prop can use.
    return typeof value === 'string' && !value.includes('var(') ? value : undefined;
};

/**
 * @param token  A design-system token (`success-500`), a Tailwind palette path
 *               (`yellow.500`), or a literal colour, which is returned unchanged.
 * @param scheme Defaults to whatever `UIProvider` last set on NativeWind. This reads the
 *               value rather than subscribing, so a live theme switch needs a re-render from
 *               elsewhere before the new colour is picked up.
 */
export const getColor = (token: string, scheme?: Scheme): string | undefined => {
    if (looksLiteral(token)) return token;

    const active: Scheme = scheme ?? (colorScheme.get() === 'dark' ? 'dark' : 'light');
    const triplet = THEME_VARIABLES[active][toVariableName(token)];
    if (triplet) return `rgb(${triplet})`;

    const palette = lookUpPalette(token);
    if (palette) return palette;

    if (__DEV__) {
        console.warn(
            `getColor: no colour named "${token}". Returning undefined, which most components ` +
                'render as black. Use a design-system token such as "typography-500".'
        );
    }
    return undefined;
};
