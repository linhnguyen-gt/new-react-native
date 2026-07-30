import { colorScheme } from 'nativewind';

import { getColor } from '../useThemeColor';

const mockedScheme = colorScheme.get as jest.Mock;

describe('getColor', () => {
    beforeEach(() => {
        mockedScheme.mockReturnValue('light');
        jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('the defect this replaced', () => {
        it('returns a usable colour for a design-system token', () => {
            // Previously this reached the Tailwind palette and came back as
            // "rgb(var(--color-success-500)/<alpha-value>)", which an icon renders as black.
            expect(getColor('success-500')).toBe('rgb(52 131 82)');
        });

        it('resolves the tokens the old call sites got wrong', () => {
            // getColor('iconGrey') was undefined and getColor('yellow') was a shade object.
            expect(getColor('typography-500')).toBe('rgb(140 140 140)');
            expect(getColor('yellow.500')).toBe('#eab308');
        });
    });

    it('accepts dot and dash separators for the same token', () => {
        expect(getColor('primary.600')).toBe(getColor('primary-600'));
        expect(getColor('primary-600')).toBe('rgb(41 41 41)');
    });

    it('accepts a fully qualified variable name', () => {
        expect(getColor('--color-error-500')).toBe('rgb(230 53 53)');
    });

    it('follows the active colour scheme', () => {
        expect(getColor('typography-500')).toBe('rgb(140 140 140)');

        mockedScheme.mockReturnValue('dark');
        expect(getColor('typography-500')).toBe('rgb(163 163 163)');
    });

    it('honours an explicit scheme over the active one', () => {
        mockedScheme.mockReturnValue('dark');
        expect(getColor('typography-500', 'light')).toBe('rgb(140 140 140)');
    });

    it('passes literal colours straight through', () => {
        // IconComponent forwards whatever a caller gives it, so literals must survive.
        expect(getColor('#ffffff')).toBe('#ffffff');
        expect(getColor('rgb(1 2 3)')).toBe('rgb(1 2 3)');
        expect(getColor('transparent')).toBe('transparent');
    });

    it('warns and returns undefined for a name that does not exist', () => {
        // The old silent undefined is exactly how "iconGrey" survived unnoticed.
        expect(getColor('iconGrey')).toBeUndefined();
        expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('no colour named "iconGrey"'));
    });

    it('never returns a shade object or a var() expression', () => {
        // Both were previously returned verbatim to components expecting a colour string.
        expect(getColor('yellow')).toBeUndefined();
        expect(getColor('background.light')).toBe('#FBFBFB');
    });
});
