import { ResponseModel } from "@/model";

import { ApiMethod, apiProblem, HttpClient } from "@/httpClient";

export const responseApi = async (): Promise<BaseResponse<ResponseModel.ResponseData[]>> => {
    const response = await HttpClient.request<
        {
            data: ResponseModel.ResponseData[];
        },
        ApiMethod.GET
    >("data", {
        method: ApiMethod.GET,
        params: {
            drilldowns: "State",
            measures: "Population",
            year: "latest"
        }
    });

    if (!response.ok) return apiProblem(response);

    return { ok: response.ok, data: response.data.data };
};
