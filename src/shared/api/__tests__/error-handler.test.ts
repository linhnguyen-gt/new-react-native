import { AxiosHeaders } from 'axios';

import { ErrorHandler } from '../error-handler';

import type { AxiosError } from 'axios';

/**
 * The leak this file guards: axios merges `INSTANCE.defaults.headers` into `error.config.headers`,
 * so logging the config published a live `Authorization: Bearer …` to logcat / Console.app.
 */
const buildError = ({ status, code, data }: { status?: number; code?: string; data?: unknown } = {}): AxiosError => {
    const headers = new AxiosHeaders();
    headers.set('Authorization', 'Bearer secret-token');

    return {
        isAxiosError: true,
        name: 'AxiosError',
        message: 'Request failed',
        code,
        toJSON: () => ({}),
        config: { url: '/data', method: 'get', headers },
        response: status === undefined ? undefined : { status, statusText: '', data, headers: {}, config: { headers } },
    } as unknown as AxiosError;
};

describe('ErrorHandler.toApiError', () => {
    let errorSpy: jest.SpyInstance;
    const handler = new ErrorHandler();

    beforeEach(() => {
        errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    const loggedText = () => JSON.stringify(errorSpy.mock.calls);

    it('never logs the Authorization header', () => {
        handler.toApiError(buildError({ status: 500, data: { message: 'boom' } }));

        expect(errorSpy).toHaveBeenCalled();
        expect(loggedText()).not.toContain('Bearer');
        expect(loggedText()).not.toContain('secret-token');
    });

    it('still logs enough to identify the failing request', () => {
        handler.toApiError(buildError({ status: 500 }));

        expect(loggedText()).toContain('/data');
        expect(loggedText()).toContain('500');
    });

    it.each([
        ['timeout', { code: 'ECONNABORTED' }],
        ['network', {}],
        ['unauthorized', { status: 401 }],
        ['client', { status: 404 }],
        ['server', { status: 503 }],
    ] as const)('classifies %s', (kind, input) => {
        expect(handler.toApiError(buildError(input)).kind).toBe(kind);
    });

    it('surfaces the server message when it is short enough to be a message', () => {
        const error = handler.toApiError(buildError({ status: 400, data: { message: 'Email already taken' } }));

        expect(error.message).toBe('Email already taken');
    });

    // A body dump can carry stack fragments and internal identifiers.
    it('falls back to a generic message when the body is payload-shaped', () => {
        const error = handler.toApiError(buildError({ status: 500, data: { message: 'x'.repeat(500) } }));

        expect(error.message).not.toContain('xxx');
        expect(error.message).toBe('Something went wrong on our side. Try again shortly.');
    });

    // Regression: it used to Promise.reject a JSON.stringify'd Error, which serialises to "{}" —
    // the source of `Uncaught (in promise, id: 0): "Error: {}"` in LogBox.
    it('returns a value instead of rejecting', () => {
        expect(() => handler.toApiError(buildError({ status: 500 }))).not.toThrow();
        expect(handler.toApiError(new TypeError('not axios'))).toEqual({
            kind: 'unknown',
            message: 'An unexpected error occurred.',
        });
    });
});
