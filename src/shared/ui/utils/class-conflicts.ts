/**
 * Resolves conflicting Tailwind utilities so that only one class per CSS property survives.
 *
 * This exists because appending a class to the end of the string does NOT make it win.
 * NativeWind compiles every class to a stylesheet rule, and the browser/runtime picks the
 * winner by rule order there, not by the order the names appear in `className`. So
 * `tva({ base: 'text-typography-0' })({ className: 'text-error-600' })` was silently keeping
 * the base colour — white text on a white button.
 *
 * tailwind-merge would normally do this job, but it drops NativeWind's `web:` and
 * `data-[hover=true]:` prefixes and its arbitrary values. This is the narrow substitute:
 * group the utilities this design system actually uses, keep the last of each group, and
 * leave anything unrecognised completely alone.
 */

const FONT_SIZES = new Set(['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', '8xl', '9xl']);

const TEXT_ALIGNS = new Set(['left', 'center', 'right', 'justify', 'start', 'end']);

const FONT_WEIGHTS = new Set([
    'thin',
    'extralight',
    'light',
    'normal',
    'medium',
    'semibold',
    'bold',
    'extrabold',
    'black',
    'extrablack',
]);

/** Utilities whose prefix alone identifies the property, mapped to their conflict group. */
const SIMPLE_PREFIXES = [
    'bg',
    'rounded',
    'opacity',
    'shadow',
    'gap',
    'gap-x',
    'gap-y',
    'w',
    'h',
    'min-w',
    'min-h',
    'max-w',
    'max-h',
    'p',
    'px',
    'py',
    'pt',
    'pr',
    'pb',
    'pl',
    'm',
    'mx',
    'my',
    'mt',
    'mr',
    'mb',
    'ml',
    'items',
    'justify',
    'self',
    'leading',
    'tracking',
] as const;

/**
 * Splits `hover:web:bg-red-500` into its modifiers and the bare utility. Colons inside
 * brackets belong to arbitrary values (`data-[state=open]:`) and must not split.
 */
const splitModifiers = (className: string): { modifiers: string; utility: string } => {
    let depth = 0;
    let lastColon = -1;

    for (let i = 0; i < className.length; i += 1) {
        const char = className[i];
        if (char === '[') depth += 1;
        else if (char === ']') depth -= 1;
        else if (char === ':' && depth === 0) lastColon = i;
    }

    return lastColon === -1
        ? { modifiers: '', utility: className }
        : { modifiers: className.slice(0, lastColon), utility: className.slice(lastColon + 1) };
};

/**
 * The CSS property a utility sets, or undefined when unrecognised. Returning undefined is the
 * safe answer: the class is then never treated as conflicting and always survives.
 */
const groupOf = (utility: string): string | undefined => {
    // `!p-0` and `-mt-2` carry the same group as their plain forms.
    const bare = utility.replace(/^!/, '').replace(/^-/, '');

    if (bare.startsWith('text-')) {
        const value = bare.slice('text-'.length);
        if (FONT_SIZES.has(value)) return 'font-size';
        if (TEXT_ALIGNS.has(value)) return 'text-align';
        return 'text-color';
    }

    if (bare.startsWith('font-')) {
        return FONT_WEIGHTS.has(bare.slice('font-'.length)) ? 'font-weight' : 'font-family';
    }

    if (bare === 'border' || /^border-\d+$/.test(bare)) return 'border-width';
    if (bare.startsWith('border-')) {
        const value = bare.slice('border-'.length);
        // border-x-2 / border-t-4 are per-side widths; border-x / border-t are too.
        const sideWidth = /^([xytrbl]|top|right|bottom|left)(-\d+)?$/.exec(value);
        if (sideWidth) return `border-width-${sideWidth[1]}`;
        return 'border-color';
    }

    for (const prefix of SIMPLE_PREFIXES) {
        if (bare.startsWith(`${prefix}-`)) return prefix;
    }

    return undefined;
};

/**
 * Joins class strings, dropping every utility that a later one overrides.
 *
 * Later wins, which is what the variant order already assumes: base, then variants, then
 * compound variants, then the caller's own className.
 */
export const mergeClasses = (parts: (string | false | null | undefined)[]): string => {
    const classNames = parts
        .filter(Boolean)
        .join(' ')
        .split(/\s+/)
        .filter((name) => name.length > 0);

    // Group key -> index of the winning class, so the last occurrence replaces earlier ones
    // in place rather than being appended (order is preserved for readability and snapshots).
    const winnerIndex = new Map<string, number>();
    const kept: (string | undefined)[] = [];

    for (const className of classNames) {
        const { modifiers, utility } = splitModifiers(className);
        const group = groupOf(utility);

        if (group === undefined) {
            kept.push(className);
            continue;
        }

        const key = `${modifiers}|${group}`;
        const previous = winnerIndex.get(key);
        if (previous !== undefined) {
            kept[previous] = undefined;
        }

        winnerIndex.set(key, kept.length);
        kept.push(className);
    }

    return kept.filter(Boolean).join(' ');
};
