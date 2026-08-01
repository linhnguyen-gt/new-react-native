import * as SecureStore from 'expo-secure-store';

import ApiMethod from '../api-method';
import { TokenService } from '../token-service';

import type { HttpRequestConfig, HttpResponse, ITokenHttpPort } from '../types';

import { setToken } from '@/shared/lib/storage';
import { StoreService } from '@/shared/store/store-service';

const { __reset: resetSecureStore } = SecureStore as unknown as { __reset: () => void };

const okResponse = <T>(data: T): HttpResponse<T> => ({ ok: true, data, status: 200 });

const createPort = () => {
    const port: jest.Mocked<ITokenHttpPort> = {
        request: jest.fn(),
        setAccessToken: jest.fn(),
        clearSession: jest.fn(),
        clearRefreshTokenTimeout: jest.fn(),
        setRefreshTokenTimeout: jest.fn(),
    };
    return port;
};

describe('TokenService', () => {
    let logout: jest.SpyInstance;

    beforeEach(() => {
        resetSecureStore();
        jest.useFakeTimers();
        logout = jest.spyOn(StoreService.getInstance(), 'logout').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
        jest.restoreAllMocks();
    });

    describe('refreshToken', () => {
        it('sends the stored refresh token and bypasses its own refresh flow', async () => {
            await setToken({ refreshToken: 'stored-refresh' });
            const port = createPort();
            port.request.mockResolvedValue(okResponse({ data: { accessToken: 'fresh' } }));

            const service = new TokenService(port);

            await expect(service.refreshToken()).resolves.toBe(true);

            // The regression: the token was read only as a null check and never left the device,
            // so the server had nothing to identify the session with.
            expect(port.request).toHaveBeenCalledWith<[HttpRequestConfig]>({
                endpoint: 'refresh-token',
                method: ApiMethod.POST,
                body: { refreshToken: 'stored-refresh' },
                skipAuthRefresh: true,
            });
            expect(port.setAccessToken).toHaveBeenCalledWith('fresh');
        });

        it('makes a single call when five refreshes race', async () => {
            await setToken({ refreshToken: 'stored-refresh' });
            const port = createPort();

            let release: (value: HttpResponse<any>) => void = () => {};
            port.request.mockReturnValue(
                new Promise<HttpResponse<any>>((resolve) => {
                    release = resolve;
                })
            );

            const service = new TokenService(port);
            const inFlight = Array.from({ length: 5 }, () => service.refreshToken());

            release(okResponse({ data: { accessToken: 'fresh' } }));

            await expect(Promise.all(inFlight)).resolves.toEqual([true, true, true, true, true]);
            expect(port.request).toHaveBeenCalledTimes(1);
        });

        it('allows a new call once the previous one has settled', async () => {
            await setToken({ refreshToken: 'stored-refresh' });
            const port = createPort();
            port.request.mockResolvedValue(okResponse({ data: { accessToken: 'fresh' } }));

            const service = new TokenService(port);
            await service.refreshToken();
            await service.refreshToken();

            expect(port.request).toHaveBeenCalledTimes(2);
            // A refresh response carries no refresh token unless the backend rotates. Writing it
            // through unconditionally deleted the stored credential, so refresh worked exactly once.
            expect(await SecureStore.getItemAsync('REFRESH_TOKEN')).toBe('stored-refresh');
        });

        it('stores the rotated refresh token when the backend sends one', async () => {
            await setToken({ refreshToken: 'stored-refresh' });
            const port = createPort();
            port.request.mockResolvedValue(okResponse({ data: { accessToken: 'fresh', refreshToken: 'rotated' } }));

            const service = new TokenService(port);
            await service.refreshToken();

            expect(await SecureStore.getItemAsync('REFRESH_TOKEN')).toBe('rotated');
        });

        it('returns false without a request when nothing is stored', async () => {
            const port = createPort();
            const service = new TokenService(port);

            await expect(service.refreshToken()).resolves.toBe(false);
            expect(port.request).not.toHaveBeenCalled();
        });

        it('logs out when the refresh call fails', async () => {
            await setToken({ refreshToken: 'stored-refresh' });
            const port = createPort();
            port.request.mockResolvedValue({ ok: false, error: { kind: 'unauthorized', message: 'nope' } });

            const service = new TokenService(port);

            await expect(service.refreshToken()).resolves.toBe(false);
            expect(logout).toHaveBeenCalledTimes(1);
            expect(await SecureStore.getItemAsync('REFRESH_TOKEN')).toBeNull();
        });
    });

    // `globalThis` rather than `global`: which declaration of `global` wins depends on the
    // order files enter the TS program, so pulling a new module into it (app.config.ts's
    // shared variant table did) could resolve `global` to a type without `setTimeout` and
    // break these spies. `globalThis` is declared by the standard lib and does not move.
    describe('setSession', () => {
        it('schedules the refresh from expiredAt, not a hardcoded lifetime', async () => {
            const port = createPort();
            const service = new TokenService(port);
            const setTimeoutSpy = jest.spyOn(globalThis, 'setTimeout');

            await service.setSession({ accessToken: 'a', expiredAt: Date.now() + 120_000 });

            expect(port.clearRefreshTokenTimeout).toHaveBeenCalled();
            expect(port.setRefreshTokenTimeout).toHaveBeenCalledTimes(1);
            // 120s lifetime - 30s buffer. `expiredAt` was carried on Session and ignored; every
            // session refreshed at 14m30s regardless of when its token actually died.
            expect(setTimeoutSpy).toHaveBeenLastCalledWith(expect.any(Function), 90_000);
        });

        it('falls back to the 15-minute lifetime when the server sends no expiredAt', async () => {
            const port = createPort();
            const service = new TokenService(port);
            const setTimeoutSpy = jest.spyOn(globalThis, 'setTimeout');

            await service.setSession({ accessToken: 'a' });

            expect(setTimeoutSpy).toHaveBeenLastCalledWith(expect.any(Function), 870_000);
        });

        it('floors an already-expired session at the minimum delay', async () => {
            const port = createPort();
            const service = new TokenService(port);
            const setTimeoutSpy = jest.spyOn(globalThis, 'setTimeout');

            await service.setSession({ accessToken: 'a', expiredAt: Date.now() - 60_000 });

            expect(setTimeoutSpy).toHaveBeenLastCalledWith(expect.any(Function), 5_000);
        });

        it('persists the refresh token when one is supplied', async () => {
            const port = createPort();
            const service = new TokenService(port);

            await service.setSession({ accessToken: 'a', refreshToken: 'r' });

            expect(await SecureStore.getItemAsync('REFRESH_TOKEN')).toBe('r');
        });
    });

    describe('clearSession', () => {
        it('deletes the stored token and the timer', async () => {
            await setToken({ refreshToken: 'stored-refresh' });
            const port = createPort();
            const service = new TokenService(port);

            await service.clearSession();

            expect(await SecureStore.getItemAsync('REFRESH_TOKEN')).toBeNull();
            expect(port.clearSession).toHaveBeenCalledTimes(1);
            expect(port.clearRefreshTokenTimeout).toHaveBeenCalledTimes(1);
        });
    });
});
