import { createApi } from '@reduxjs/toolkit/query/react';

import { ResponseSchema } from '@/features/response/model/response-model';
import ApiMethod from '@/shared/api/api-method';
import { baseQuery } from '@/shared/api/base-query';

/**
 * Server state lives in RTK Query. Local state and multi-step async flows stay on redux-saga —
 * see `features/count/model/count-sagas.ts` for the other half of that boundary.
 */
export const responseApi = createApi({
    reducerPath: 'responseApi',
    baseQuery,
    tagTypes: ['Response'],
    endpoints: (build) => ({
        getResponse: build.query<ResponseData[], void>({
            query: () => ({
                endpoint: 'data',
                method: ApiMethod.GET,
                params: {
                    drilldowns: 'State',
                    measures: 'Population',
                    year: 'latest',
                },
            }),
            /**
             * The schema was `z.infer`-only: it described the payload the app hoped for, nothing
             * checked it, and a changed API silently produced wrong state. Throwing here turns
             * that into an error result — failing closed rather than open.
             */
            transformResponse: (raw: { data: unknown }) => {
                const parsed = ResponseSchema.array().safeParse(raw?.data);

                if (!parsed.success) {
                    throw new Error('The response payload did not match the expected shape');
                }

                return parsed.data;
            },
            providesTags: ['Response'],
        }),
    }),
});

export const { useGetResponseQuery } = responseApi;
