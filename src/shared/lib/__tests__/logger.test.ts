import Logger from '../logger';

/** `__DEV__` is a read-only global in the RN types; tests need to flip it. */
const setDev = (value: boolean) => {
    (globalThis as unknown as { __DEV__: boolean }).__DEV__ = value;
};

describe('Logger', () => {
    let errorSpy: jest.SpyInstance;
    let warnSpy: jest.SpyInstance;
    let infoSpy: jest.SpyInstance;

    beforeEach(() => {
        errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        infoSpy = jest.spyOn(console, 'info').mockImplementation(() => {});
    });

    afterEach(() => {
        setDev(true);
        jest.restoreAllMocks();
    });

    it('writes to the console in development', () => {
        setDev(true);

        Logger.error('Tag', 'boom');
        Logger.info('Tag', 'note');

        expect(errorSpy).toHaveBeenCalledTimes(1);
        expect(infoSpy).toHaveBeenCalledTimes(1);
    });

    it('reports info at info level, not error level', () => {
        setDev(true);

        Logger.info('Tag', 'note');

        expect(infoSpy).toHaveBeenCalledTimes(1);
        expect(errorSpy).not.toHaveBeenCalled();
    });

    // The regression this file exists for: release logging reached logcat / Console.app, and
    // ErrorHandler was feeding it bearer tokens.
    it('emits nothing at all in release builds', () => {
        setDev(false);

        Logger.error('Tag', { authorization: 'Bearer secret-token' });
        Logger.info('Tag', 'note');

        expect(errorSpy).not.toHaveBeenCalled();
        expect(warnSpy).not.toHaveBeenCalled();
        expect(infoSpy).not.toHaveBeenCalled();
    });
});
