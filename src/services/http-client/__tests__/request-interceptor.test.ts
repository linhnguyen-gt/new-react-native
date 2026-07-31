import { HttpStatusCode } from 'axios';

import { RequestInterceptor } from '../services/request-interceptor';

import type { ITokenService } from '../interfaces/http-client';
import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

type ResponseErrorHandler = (error: AxiosError) => Promise<unknown>;

const createConfig = (overrides: Partial<InternalAxiosRequestConfig> = {}) =>
    ({ url: '/things', headers: {}, ...overrides }) as InternalAxiosRequestConfig;

const createError = (status: number, config: InternalAxiosRequestConfig, data?: unknown) =>
    ({
        config,
        isAxiosError: true,
        response: { status, data, headers: {}, config, statusText: '' },
    }) as unknown as AxiosError;

/** Captures the rejection handler the interceptor registers, which is what we want to exercise. */
const setup = () => {
    let onResponseError: ResponseErrorHandler = async () => undefined;

    const axiosInstance = Object.assign(jest.fn().mockResolvedValue({ status: 200, data: 'replayed' }), {
        interceptors: {
            request: { use: jest.fn() },
            response: {
                use: jest.fn((_ok: unknown, err: ResponseErrorHandler) => {
                    onResponseError = err;
                }),
            },
        },
    }) as unknown as AxiosInstance & jest.Mock;

    const tokenService: jest.Mocked<ITokenService> = {
        refreshToken: jest.fn(),
        setSession: jest.fn(),
        clearSession: jest.fn(),
        getRefreshToken: jest.fn(),
        logout: jest.fn(),
    };

    new RequestInterceptor(axiosInstance, tokenService).setupInterceptors();

    return { axiosInstance, tokenService, onResponseError: (e: AxiosError) => onResponseError(e) };
};

describe('RequestInterceptor response errors', () => {
    it('replays the original request after a successful refresh', async () => {
        const { axiosInstance, tokenService, onResponseError } = setup();
        tokenService.refreshToken.mockResolvedValue(true);
        const config = createConfig();

        // The regression: a successful refresh still fell through to the generic reject, so the
        // caller saw the 401 anyway and the new token was never used.
        await expect(onResponseError(createError(HttpStatusCode.Unauthorized, config))).resolves.toEqual({
            status: 200,
            data: 'replayed',
        });

        expect(axiosInstance).toHaveBeenCalledWith(config);
        expect(config._retry).toBe(true);
    });

    it('logs out and rejects when the refresh fails', async () => {
        const { axiosInstance, tokenService, onResponseError } = setup();
        tokenService.refreshToken.mockResolvedValue(false);

        await expect(onResponseError(createError(HttpStatusCode.Unauthorized, createConfig()))).rejects.toMatchObject({
            code: 'TOKEN_EXPIRED',
            status: HttpStatusCode.Unauthorized,
        });

        expect(tokenService.logout).toHaveBeenCalledTimes(1);
        expect(axiosInstance).not.toHaveBeenCalled();
    });

    it('refreshes on any 401, not only on a "token expired" message', async () => {
        const { tokenService, onResponseError } = setup();
        tokenService.refreshToken.mockResolvedValue(true);

        await onResponseError(createError(HttpStatusCode.Unauthorized, createConfig(), { message: 'Unauthorized' }));

        expect(tokenService.refreshToken).toHaveBeenCalledTimes(1);
    });

    it('does not refresh for the refresh call itself', async () => {
        const { tokenService, onResponseError } = setup();
        const config = createConfig({ skipAuthRefresh: true });

        await expect(onResponseError(createError(HttpStatusCode.Unauthorized, config))).rejects.toBeDefined();

        expect(tokenService.refreshToken).not.toHaveBeenCalled();
    });

    it('gives one 401 exactly one retry', async () => {
        const { axiosInstance, tokenService, onResponseError } = setup();
        const config = createConfig({ _retry: true });

        await expect(onResponseError(createError(HttpStatusCode.Unauthorized, config))).rejects.toBeDefined();

        expect(tokenService.refreshToken).not.toHaveBeenCalled();
        expect(axiosInstance).not.toHaveBeenCalled();
    });

    it('logs out on a user-not-found response', async () => {
        const { tokenService, onResponseError } = setup();

        await expect(
            onResponseError(createError(HttpStatusCode.BadRequest, createConfig(), { message: 'User not found' }))
        ).rejects.toMatchObject({ code: 'USER_NOT_FOUND' });

        expect(tokenService.logout).toHaveBeenCalledTimes(1);
    });

    it('passes other failures straight through', async () => {
        const { tokenService, onResponseError } = setup();

        await expect(
            onResponseError(createError(HttpStatusCode.InternalServerError, createConfig(), { message: 'boom' }))
        ).rejects.toMatchObject({ message: 'boom', status: HttpStatusCode.InternalServerError });

        expect(tokenService.refreshToken).not.toHaveBeenCalled();
    });
});
