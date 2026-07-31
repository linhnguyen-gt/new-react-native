import { configureStore } from '@reduxjs/toolkit';

import { responseApi } from '../response-api';

import * as httpClient from '@/shared/api/http-client';
import ActionTypes from '@/shared/store/action-types';

const ROW = {
    'ID State': '04000US01',
    'ID Year': 2023,
    Population: 5108468,
    'Slug State': 'alabama',
    State: 'Alabama',
    Year: '2023',
};

const mockRequest = (result: unknown) => {
    const request = jest.fn().mockResolvedValue(result);
    jest.spyOn(httpClient, 'getHttpClient').mockReturnValue({ request } as never);
    return request;
};

const createTestStore = () =>
    configureStore({
        reducer: { [responseApi.reducerPath]: responseApi.reducer },
        middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(responseApi.middleware),
    });

describe('responseApi.getResponse', () => {
    afterEach(() => jest.restoreAllMocks());

    it('returns the validated rows', async () => {
        const request = mockRequest({ ok: true, data: { data: [ROW] }, status: 200 });
        const store = createTestStore();

        const result = await store.dispatch(responseApi.endpoints.getResponse.initiate());

        expect(result.data).toEqual([ROW]);
        expect(request).toHaveBeenCalledWith(
            expect.objectContaining({
                endpoint: 'data',
                params: { drilldowns: 'State', measures: 'Population', year: 'latest' },
            })
        );
    });

    it('fails closed on a payload that does not match the schema', async () => {
        // The schema existed only as a `z.infer` source: nothing validated the payload, so a
        // changed API produced silently wrong state instead of an error.
        mockRequest({ ok: true, data: { data: [{ State: 'Alabama' }] }, status: 200 });
        const store = createTestStore();

        const result = await store.dispatch(responseApi.endpoints.getResponse.initiate());

        expect(result.data).toBeUndefined();
        expect(result.error).toBeDefined();
    });

    it('surfaces a transport failure as an error result', async () => {
        mockRequest({ ok: false, error: { kind: 'network', message: 'offline' } });
        const store = createTestStore();

        const result = await store.dispatch(responseApi.endpoints.getResponse.initiate());

        expect(result.error).toEqual({ kind: 'network', message: 'offline' });
    });
});

describe('RESET_STATE', () => {
    afterEach(() => jest.restoreAllMocks());

    it('clears the cached query data along with the rest of the tree', async () => {
        // The API cache is combined into the same reducer tree, so logout drops it without a
        // separate resetApiState() call. Asserted rather than assumed.
        mockRequest({ ok: true, data: { data: [ROW] }, status: 200 });

        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const RootReducers = require('@/shared/store/root-reducers').default;
        const store = configureStore({
            reducer: RootReducers,
            middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(responseApi.middleware),
        });

        await store.dispatch(responseApi.endpoints.getResponse.initiate());
        expect(Object.keys(store.getState().responseApi.queries)).toHaveLength(1);

        store.dispatch({ type: ActionTypes.RESET_STATE });

        expect(Object.keys(store.getState().responseApi.queries)).toHaveLength(0);
    });
});
