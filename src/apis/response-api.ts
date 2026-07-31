import type { HttpResponse } from '@/services';
import { ApiMethod, getHttpClient } from '@/services';

/**
 * Failures are returned, not dropped. The previous `if (!response?.ok) return;` collapsed every
 * error into `undefined`, which the caller could not tell apart from an empty result.
 */
export const responseApi = async (): Promise<HttpResponse<ResponseData[]>> => {
    const response = await getHttpClient().request<{
        data: ResponseData[];
    }>({
        endpoint: 'data',
        method: ApiMethod.GET,
        params: {
            drilldowns: 'State',
            measures: 'Population',
            year: 'latest',
        },
    });

    if (!response.ok) return response;

    return { ok: true, data: response.data.data, status: response.status };
};
