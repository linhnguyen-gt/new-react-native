import { mergeClasses } from '../class-conflicts';

describe('mergeClasses', () => {
    describe('the two defects observed on device', () => {
        it('lets a caller background override a variant background', () => {
            // Toast: useShowToast asks for bg-background-0, the success variant paints
            // bg-success-500. The card rendered solid green.
            expect(mergeClasses(['rounded-lg bg-success-500 p-4', 'bg-background-0'])).toBe(
                'rounded-lg p-4 bg-background-0'
            );
        });

        it('lets an action colour override the base text colour', () => {
            // Button: base text-typography-0 is near-white, so an outline button kept white
            // text on a white background.
            expect(mergeClasses(['font-semibold text-typography-0', 'text-error-600'])).toBe(
                'font-semibold text-error-600'
            );
        });
    });

    it('keeps the last of each conflicting group and drops the rest', () => {
        expect(mergeClasses(['p-2 p-4 p-8'])).toBe('p-8');
    });

    it('preserves the position of the winning class', () => {
        // Order is kept so output stays readable and stable rather than reshuffling.
        expect(mergeClasses(['bg-red-500 flex-row bg-blue-500 gap-2'])).toBe('flex-row bg-blue-500 gap-2');
    });

    describe('text- is overloaded and must not collapse into one group', () => {
        it('separates colour, size and alignment', () => {
            expect(mergeClasses(['text-error-600 text-lg text-center'])).toBe('text-error-600 text-lg text-center');
        });

        it('still resolves within each of those groups', () => {
            expect(mergeClasses(['text-xs text-lg'])).toBe('text-lg');
            expect(mergeClasses(['text-left text-center'])).toBe('text-center');
            expect(mergeClasses(['text-primary-500 text-error-600'])).toBe('text-error-600');
        });
    });

    describe('border- is overloaded the same way', () => {
        it('separates width from colour', () => {
            expect(mergeClasses(['border border-error-300'])).toBe('border border-error-300');
        });

        it('treats each side as its own width', () => {
            expect(mergeClasses(['border-t-2 border-b-4'])).toBe('border-t-2 border-b-4');
            expect(mergeClasses(['border-t-2 border-t-4'])).toBe('border-t-4');
        });
    });

    describe('modifiers scope the conflict', () => {
        it('does not let a hover background eat the plain one', () => {
            expect(mergeClasses(['bg-primary-500 hover:bg-primary-600'])).toBe('bg-primary-500 hover:bg-primary-600');
        });

        it('resolves within the same modifier', () => {
            expect(mergeClasses(['hover:bg-primary-600 hover:bg-error-600'])).toBe('hover:bg-error-600');
        });

        it('handles NativeWind data- and web- prefixes, colons and all', () => {
            // The colon inside data-[...] must not be read as a modifier separator.
            expect(mergeClasses(['data-[hover=true]:bg-red-500 data-[hover=true]:bg-blue-500'])).toBe(
                'data-[hover=true]:bg-blue-500'
            );
            expect(mergeClasses(['web:bg-red-500 bg-blue-500'])).toBe('web:bg-red-500 bg-blue-500');
        });
    });

    it('leaves unrecognised utilities completely alone', () => {
        // Anything without a known group must survive; silently dropping a class the design
        // system relies on would be far worse than leaving a duplicate.
        expect(mergeClasses(['group/button web:select-none shrink-0 group/button'])).toBe(
            'group/button web:select-none shrink-0 group/button'
        );
    });

    it('handles arbitrary values, important and negative prefixes', () => {
        expect(mergeClasses(['w-[300px] w-full'])).toBe('w-full');
        expect(mergeClasses(['p-2 !p-0'])).toBe('!p-0');
        expect(mergeClasses(['mt-2 -mt-4'])).toBe('-mt-4');
    });

    it('ignores falsy parts and collapses whitespace', () => {
        expect(mergeClasses([undefined, '  flex-row   gap-2  ', null, false, ''])).toBe('flex-row gap-2');
    });

    it('returns an empty string for no input', () => {
        expect(mergeClasses([])).toBe('');
    });
});
