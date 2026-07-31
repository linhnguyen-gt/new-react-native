export const colorScheme = {
    set: jest.fn(),
    // getColor reads the active scheme through this. Defaults to light, matching UIProvider's
    // own default; a test needing dark mode overrides it with mockReturnValue('dark').
    get: jest.fn(() => 'light'),
};

export const vars = (config) => config;

export const cssInterop = jest.fn();
