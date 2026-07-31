import type { ApiError, HttpRequestConfig } from '@/shared/api/types';
import type { BaseQueryFn } from '@reduxjs/toolkit/query';

import { getHttpClient } from '@/shared/api/http-client';

/**
 * RTK Query on top of the existing `HttpClient`, not `fetchBaseQuery`.
 *
 * The auth refresh, the single-retry `_retry` guard and the error classification all live in the
 * axios interceptors. `fetchBaseQuery` would fork every one of them, so a 401 inside an RTKQ
 * endpoint would behave differently from a 401 anywhere else in the app.
 */
export const baseQuery: BaseQueryFn<HttpRequestConfig, unknown, ApiError> = async (args) => {
    const response = await getHttpClient().request(args);

    if (!response.ok) {
        return { error: response.error };
    }

    return { data: response.data };
};

export default baseQuery;
