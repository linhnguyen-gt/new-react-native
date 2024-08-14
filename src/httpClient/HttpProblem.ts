import { HttpStatusCode } from "axios";

export const apiProblem = (response: BaseResponse<Data>): BaseResponse<Data> => {
    // const { message } = response.data;
    switch (response.status) {
        case HttpStatusCode.Unauthorized:
            return { ok: false, data: response.data };
        case HttpStatusCode.Forbidden:
            return { ok: false, data: response.data };
        case HttpStatusCode.NotFound:
            return { ok: false, data: response.data };
        case HttpStatusCode.InternalServerError:
            return { ok: false, data: response.data };
        default:
            return { ok: false, data: undefined };
    }
};

declare global {
    type Data = any;

    type SuccessfulResponse<D extends Record<string, any>, S = HttpStatusCode> = {
        ok: true;
        data: D;
        status?: S;
    };

    type ErrorResponse<D extends Record<string, any>, S = HttpStatusCode> = {
        ok: false;
        data: D | unknown;
        status?: S;
    };
    type BaseResponse<D extends Record<string, any>> = SuccessfulResponse<D> | ErrorResponse<D>;
}
