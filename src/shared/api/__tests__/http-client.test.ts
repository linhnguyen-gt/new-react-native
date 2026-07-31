import axios from 'axios';

import ApiMethod from '../api-method';
import { getHttpClient, HttpClient } from '../http-client';

import type { ErrorHandler } from '../error-handler';
import type { TokenService } from '../token-service';
import type { ApiError } from '../types';
import type { AxiosInstance } from 'axios';

// The constructor reads `environment.apiBaseUrl`, and EnvironmentService throws under Jest
// because there is no `Constants.expoConfig.extra`. Mocking the leaf keeps that out of scope.
jest.mock('../../config/environment', () => ({
    environment: { apiBaseUrl: 'https://api.test' },
}));

const axiosRequest = jest.fn();

const fakeAxiosInstance = {
    request: axiosRequest,
    defaults: { headers: {} },
    interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } },
} as unknown as AxiosInstance;

const toApiError = jest.fn<ApiError, [unknown]>();

/**
 * The constructor is private and `getInstance` caches, so the axios spy has to be in place
 * before the first call and every test then shares the one client. Injecting both collaborators
 * here is the DI the singleton export used to make impossible: `export default
 * HttpClient.getInstance()` had already spent the parameters before any test could pass its own.
 */
jest.spyOn(axios, 'create').mockReturnValue(fakeAxiosInstance);
const client = HttpClient.getInstance({} as TokenService, { toApiError } as unknown as ErrorHandler);

/** What axios was asked to send, for the tests that care about payload shaping. */
const sentConfig = () => axiosRequest.mock.calls[0]?.[0];

describe('HttpClient.request', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        axiosRequest.mockResolvedValue({ data: { id: 1 }, status: 200, headers: { etag: 'w/"1"' } });
    });

    it('wraps a success as ok: true with the payload, status and headers', async () => {
        await expect(client.request({ endpoint: 'things', method: ApiMethod.GET })).resolves.toEqual({
            ok: true,
            data: { id: 1 },
            status: 200,
            headers: { etag: 'w/"1"' },
        });
    });

    it('maps endpoint to url and lowercases the method', async () => {
        await client.request({ endpoint: 'things', method: ApiMethod.GET });

        expect(sentConfig()).toMatchObject({ url: 'things', method: 'get' });
    });

    it('sends params on a GET and no body', async () => {
        await client.request({ endpoint: 'things', method: ApiMethod.GET, params: { page: 2 } });

        expect(sentConfig()).toMatchObject({ params: { page: 2 }, data: undefined });
    });

    it('sends a body on a POST and no params', async () => {
        await client.request({ endpoint: 'things', method: ApiMethod.POST, body: { name: 'x' } });

        expect(sentConfig()).toMatchObject({ data: { name: 'x' }, params: undefined });
    });

    it('sends a body on a DELETE, which is not a params method', async () => {
        // GET is the only method that carries params, so DELETE takes the body branch.
        await client.request({ endpoint: 'things/1', method: ApiMethod.DELETE, body: { reason: 'spam' } });

        expect(sentConfig()).toMatchObject({ data: { reason: 'spam' }, params: undefined });
    });

    it('forwards timeout, skipAuthRefresh and headers', async () => {
        // `timeout` was silently dropped despite being part of the public HttpRequestConfig, and
        // `skipAuthRefresh` is what stops the refresh call from re-entering its own 401 flow.
        await client.request({
            endpoint: 'refresh-token',
            method: ApiMethod.POST,
            timeout: 5000,
            skipAuthRefresh: true,
            headers: { 'X-Trace': 'abc' },
        });

        expect(sentConfig()).toMatchObject({
            timeout: 5000,
            skipAuthRefresh: true,
            headers: { 'X-Trace': 'abc' },
        });
    });

    it('resolves with the classified error instead of rejecting', async () => {
        // It used to return `undefined` and leave the rejection floating, so at every call site
        // "failed" and "succeeded with nothing" were the same value.
        const thrown = new Error('boom');
        const error: ApiError = { kind: 'server', message: 'Something went wrong', status: 500 };
        axiosRequest.mockRejectedValue(thrown);
        toApiError.mockReturnValue(error);

        await expect(client.request({ endpoint: 'things', method: ApiMethod.GET })).resolves.toEqual({
            ok: false,
            error,
            status: 500,
        });
        expect(toApiError).toHaveBeenCalledWith(thrown);
    });

    it('leaves status undefined when the failure never reached the server', async () => {
        axiosRequest.mockRejectedValue(new Error('Network Error'));
        toApiError.mockReturnValue({ kind: 'network', message: 'No connection.' });

        await expect(client.request({ endpoint: 'things', method: ApiMethod.GET })).resolves.toEqual({
            ok: false,
            error: { kind: 'network', message: 'No connection.' },
            status: undefined,
        });
    });
});

describe('getHttpClient', () => {
    it('hands out the single instance', () => {
        expect(getHttpClient()).toBe(client);
    });
});
