import { HttpStatusCode, AxiosError } from "axios";
import { Alert } from "react-native";

export const apiProblem = (response: BaseResponse<Data> | AxiosError): BaseResponse<Data> => {
    try {
        if (response instanceof AxiosError) {
            // Handle AxiosError
            const errorResponse: ErrorResponse<Data> = {
                ok: false,
                data: response.response?.data || response.message,
                status: response.response?.status || HttpStatusCode.InternalServerError
            };
            showErrorDialog(errorResponse);
            return errorResponse;
        }

        let errorResponse: ErrorResponse<Data>;
        switch (response.status) {
            case HttpStatusCode.BadRequest:
            case HttpStatusCode.Unauthorized:
            case HttpStatusCode.Forbidden:
            case HttpStatusCode.NotFound:
            case HttpStatusCode.MethodNotAllowed:
            case HttpStatusCode.RequestTimeout:
            case HttpStatusCode.Conflict:
            case HttpStatusCode.UnprocessableEntity:
            case HttpStatusCode.TooManyRequests:
            case HttpStatusCode.InternalServerError:
            case HttpStatusCode.BadGateway:
            case HttpStatusCode.ServiceUnavailable:
            case HttpStatusCode.GatewayTimeout:
                errorResponse = { ok: false, data: response.data, status: response.status };
                break;
            default:
                errorResponse = { ok: false, data: undefined, status: response.status };
        }
        showErrorDialog(errorResponse);
        return errorResponse;
    } catch (error) {
        if (__DEV__) {
            console.error("Unexpected error in apiProblem:", error);
        }
        const unexpectedErrorResponse: ErrorResponse<Data> = {
            ok: false,
            data: "An unexpected error occurred",
            status: HttpStatusCode.InternalServerError
        };
        showErrorDialog(unexpectedErrorResponse);
        return unexpectedErrorResponse;
    }
};

const showErrorDialog = (errorResponse: ErrorResponse<Data>) => {
    if (__DEV__) {
        console.error("Error occurred:", errorResponse.data);
    }

    const errorMessage = typeof errorResponse.data === "string" ? errorResponse.data : "An unexpected error occurred";

    Alert.alert("Error", errorMessage, [{ text: "OK", onPress: () => {} }], {
        cancelable: false
    });
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
