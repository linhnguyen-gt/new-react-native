import { HttpStatusCode } from "axios";
import { Alert } from "react-native";

export const apiProblem = <T extends Data>(response: ErrorResponse<T>): ErrorResponse<T> => {
    try {
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
                errorResponse = { ok: false, data: response.data, status: response.status };
        }
        showErrorDialog(errorResponse);
        return errorResponse;
    } catch (error) {
        if (__DEV__) {
            console.error("Unexpected error in apiProblem:", error);
        }
        const unexpectedErrorResponse: ErrorResponse<Data> = {
            ok: false,
            data: response.data ?? "An unexpected error occurred",
            status: HttpStatusCode.InternalServerError
        };
        showErrorDialog(unexpectedErrorResponse);
        return unexpectedErrorResponse;
    }
};

const showErrorDialog = <T extends Data>(errorResponse: ErrorResponse<T>) => {
    if (__DEV__) {
        console.error("Error occurred:", errorResponse.data);
    }

    let errorMessage = "An unexpected error occurred";

    if (errorResponse.data) {
        if (typeof errorResponse.data === "string") {
            errorMessage = errorResponse.data;
        } else if (typeof errorResponse.data === "object" && "message" in errorResponse.data) {
            errorMessage = errorResponse.data.message as string;
        }
    }

    Alert.alert("Error", errorMessage, [{ text: "OK", onPress: () => {} }], { cancelable: false });
};

declare global {
    type Data = Record<string, any>;

    type SuccessfulResponse<D extends Data, S = HttpStatusCode> = {
        ok: true;
        data: D;
        status?: S;
    };

    type ErrorResponse<D extends Data, S = HttpStatusCode> = {
        ok: false;
        data: D | unknown;
        status?: S;
    };
    type BaseResponse<D extends Data> = SuccessfulResponse<D> | ErrorResponse<D>;
}
