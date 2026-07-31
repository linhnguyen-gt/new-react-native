import { tva } from '../tva';

describe('tva', () => {
    it('returns the base classes when no variants are declared', () => {
        const style = tva({ base: 'flex-1 p-4' });
        expect(style()).toBe('flex-1 p-4');
    });

    it('applies the class matching the selected variant', () => {
        const style = tva({
            base: 'text',
            variants: { size: { sm: 'text-sm', lg: 'text-lg' } },
        });
        expect(style({ size: 'sm' })).toBe('text text-sm');
        expect(style({ size: 'lg' })).toBe('text text-lg');
    });

    it('omits a variant group that was not selected', () => {
        const style = tva({ base: 'text', variants: { size: { sm: 'text-sm' } } });
        expect(style()).toBe('text');
    });

    it('supports boolean variants declared as a `true` key', () => {
        const style = tva({ base: 'text', variants: { bold: { true: 'font-bold' } } });
        expect(style({ bold: true })).toBe('text font-bold');
        expect(style({ bold: false })).toBe('text');
    });

    it('applies defaultVariants when nothing is selected', () => {
        const style = tva({
            base: 'text',
            variants: { size: { sm: 'text-sm', md: 'text-base' } },
            defaultVariants: { size: 'md' },
        });
        expect(style()).toBe('text text-base');
    });

    it('keeps the default when a variant is explicitly passed as undefined', () => {
        const style = tva({
            base: 'text',
            variants: { size: { sm: 'text-sm', md: 'text-base' } },
            defaultVariants: { size: 'md' },
        });
        expect(style({ size: undefined })).toBe('text text-base');
    });

    it('applies compoundVariants only when every condition matches', () => {
        const style = tva({
            base: 'btn',
            variants: {
                variant: { solid: 'v-solid', outline: 'v-outline' },
                action: { primary: 'a-primary', negative: 'a-negative' },
            },
            compoundVariants: [{ variant: 'solid', action: 'primary', class: 'compound-hit' }],
        });
        expect(style({ variant: 'solid', action: 'primary' })).toBe('btn v-solid a-primary compound-hit');
        expect(style({ variant: 'outline', action: 'primary' })).toBe('btn v-outline a-primary');
    });

    it('drops the variant class a caller class conflicts with', () => {
        // Keeping both would not make the caller win: NativeWind resolves precedence by
        // stylesheet rule order, not by position in the string, so the loser has to go.
        const style = tva({ base: 'p-2', variants: { size: { sm: 'text-sm' } } });
        expect(style({ size: 'sm', class: 'text-lg' })).toBe('p-2 text-lg');
        expect(style({ className: 'mt-1' })).toBe('p-2 mt-1');
    });

    it('keeps caller classes that do not conflict with a variant', () => {
        const style = tva({ base: 'p-2', variants: { size: { sm: 'text-sm' } } });
        expect(style({ size: 'sm', class: 'font-bold' })).toBe('p-2 text-sm font-bold');
    });

    it('does not emit stray whitespace for empty variant values', () => {
        const style = tva({ base: 'btn', variants: { variant: { solid: '' } } });
        expect(style({ variant: 'solid' })).toBe('btn');
    });
});
