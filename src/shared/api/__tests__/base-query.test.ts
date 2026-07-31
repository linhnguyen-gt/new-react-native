import ApiMethod from '../api-method';
import { baseQuery } from '../base-query';
import * as httpClient from '../http-client';

import type { HttpRequestConfig } from '../types';

const CONFIG: HttpRequestConfig = { endpoint: 'data', method: ApiMethod.GET };

const mockRequest = (result: unknown) => {
    const request = jest.fn().mockResolvedValue(result);
    jest.spyOn(httpClient, 'getHttpClient').mockReturnValue({ request } as never);
    return request;
};

/** RTK Query passes an api object and extra options; the base query ignores both. */
const RTKQ_EXTRA = [{} as never, {} as never] as const;

describe('baseQuery', () => {
    afterEach(() => jest.restoreAllMocks());

    it('unwraps a successful response into { data }', async () => {
        const request = mockRequest({ ok: true, data: { data: [] }, status: 200 });

        await expect(baseQuery(CONFIG, ...RTKQ_EXTRA)).resolves.toEqual({ data: { data: [] } });
        expect(request).toHaveBeenCalledWith(CONFIG);
    });

    it('passes the classified ApiError through as { error }', async () => {
        // The point of not using fetchBaseQuery: the kind/status classification and the auth
        // refresh both live in the axios interceptors, and RTKQ endpoints see the same ones.
        const error = { kind: 'server' as const, message: 'boom', status: 500 };
        mockRequest({ ok: false, error, status: 500 });

        await expect(baseQuery(CONFIG, ...RTKQ_EXTRA)).resolves.toEqual({ error });
    });
});
