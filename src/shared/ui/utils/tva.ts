import { mergeClasses } from './class-conflicts';

/**
 * Minimal Tailwind-variants helper.
 *
 * Replaces `@gluestack-ui/nativewind-utils/tva`. Deliberately does NOT run tailwind-merge:
 * NativeWind emits prefixes such as `web:`, `data-[hover=true]:` and arbitrary values that
 * tailwind-merge does not understand and will drop.
 *
 * Conflicts are resolved by `mergeClasses`, which removes the losing utility from the string
 * entirely. Appending a class is not enough on its own — NativeWind resolves precedence by
 * stylesheet rule order, not by position in `className` — so a conflicting earlier class has
 * to actually go. Order of intent is still base, variants, compound variants, caller.
 */

type ClassValue = string | false | null | undefined;

/** A variant group maps a selectable value to the classes it contributes. */
type VariantShape = Record<string, Record<string, string>>;

/** Boolean variants are declared as `{ true: '...' }` but selected with `true`. */
type VariantSelection<TVariants extends VariantShape> = {
    [K in keyof TVariants]?: keyof TVariants[K] extends 'true' | 'false'
        ? boolean | keyof TVariants[K]
        : keyof TVariants[K];
};

type CompoundVariant<TVariants extends VariantShape> = VariantSelection<TVariants> & {
    class: string;
};

export type TvaConfig<TVariants extends VariantShape> = {
    base?: string;
    variants?: TVariants;
    compoundVariants?: CompoundVariant<TVariants>[];
    defaultVariants?: VariantSelection<TVariants>;
};

type TvaProps<TVariants extends VariantShape> = VariantSelection<TVariants> & {
    class?: ClassValue;
    className?: ClassValue;
};

/** Props a component accepts to drive a given tva instance. */
export type VariantProps<TComponent extends (...args: never[]) => string> = Omit<
    NonNullable<Parameters<TComponent>[0]>,
    'class' | 'className'
>;

/** Variant keys are stored as strings, so booleans must be looked up as 'true'/'false'. */
const toKey = (value: unknown): string | undefined => {
    if (value === undefined || value === null) return undefined;
    return String(value);
};

// Default must have NO keys. Defaulting to VariantShape would leave an open
// index signature, and VariantProps would then absorb every prop on the component.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export function tva<TVariants extends VariantShape = {}>(config: TvaConfig<TVariants>) {
    const { base, variants, compoundVariants, defaultVariants } = config;

    return (props?: TvaProps<TVariants>): string => {
        // Explicitly-passed `undefined` must not clobber a configured default,
        // which a plain spread would do.
        const selection = { ...defaultVariants } as Record<string, unknown>;
        if (props) {
            for (const [key, value] of Object.entries(props)) {
                if (value !== undefined) selection[key] = value;
            }
        }

        const classes: ClassValue[] = [base];

        if (variants) {
            for (const variantName of Object.keys(variants)) {
                const key = toKey(selection[variantName]);
                if (key === undefined) continue;
                classes.push(variants[variantName]?.[key]);
            }
        }

        if (compoundVariants) {
            for (const compound of compoundVariants) {
                const { class: compoundClass, ...conditions } = compound as Record<string, unknown> & {
                    class: string;
                };
                const matches = Object.keys(conditions).every(
                    (name) => toKey(conditions[name]) === toKey(selection[name])
                );
                if (matches) classes.push(compoundClass);
            }
        }

        // Caller-supplied classes go last so they win on conflict.
        classes.push(props?.class, props?.className);

        return mergeClasses(classes);
    };
}
