import { HttpStatusCode } from 'axios';

import type { ITokenService } from '../interfaces/IHttpClient';
import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

interface ErrorResponseData {
    message: string;
    status?: number;
}

export class RequestInterceptor {
    constructor(
        private readonly axiosInstance: AxiosInstance,
        private readonly tokenService: ITokenService
    ) {}

    setupInterceptors(): void {
        this.axiosInstance.interceptors.request.use(this.handleRequest.bind(this), this.handleRequestError.bind(this));

        this.axiosInstance.interceptors.response.use(
            this.handleResponse.bind(this),
            this.handleResponseError.bind(this)
        );
    }

    /**
     * A 401 buys exactly one refresh-and-replay.
     *
     * Previously a *successful* refresh still fell through to the generic reject, so the caller
     * saw the failure anyway and the refreshed token was never used; and the `TOKEN_EXPIRED`
     * catch branch was dead code, because `refreshToken()` swallows its own errors and returns
     * `false` rather than throwing.
     */
    private async handleResponseError(error: AxiosError) {
        const config = error.config;

        if (config && this.shouldAttemptRefresh(error, config)) {
            const refreshed = await this.tokenService.refreshToken();

            if (refreshed) {
                config._retry = true;
                return this.axiosInstance(config);
            }

            await this.tokenService.logout();
            return Promise.reject({
                message: 'Session expired, please login again',
                status: HttpStatusCode.Unauthorized,
                code: 'TOKEN_EXPIRED',
            });
        }

        if (this.isUserNotFoundError(error)) {
            await this.tokenService.logout();
            return Promise.reject({
                message: 'Account not found, please login again',
                status: HttpStatusCode.BadRequest,
                code: 'USER_NOT_FOUND',
            });
        }

        if (error.response?.data) {
            const errorData = error.response.data as ErrorResponseData;
            return Promise.reject({
                ...error,
                message: errorData.message,
                status: error.response.status,
            });
        }

        return Promise.reject(error);
    }

    private shouldAttemptRefresh(error: AxiosError, config: InternalAxiosRequestConfig): boolean {
        // The refresh call travels on this same instance; without the bypass its own 401 would
        // re-enter the flow that issued it.
        if (config.skipAuthRefresh || config._retry) return false;

        // Was a substring match on "token expired" in the response body — a server-specific
        // wording that silently disabled refresh for every other 401.
        return error.response?.status === HttpStatusCode.Unauthorized;
    }

    private async handleRequest(config: any) {
        // TODO: Add request handling logic (logging, metrics, etc.)
        return config;
    }

    private handleRequestError(error: AxiosError) {
        return Promise.reject(error);
    }

    private handleResponse(response: any) {
        return response;
    }

    private isUserNotFoundError(error: AxiosError): boolean {
        const errorData = error.response?.data as ErrorResponseData;
        return (
            error.response?.status === HttpStatusCode.BadRequest &&
            errorData?.message?.toLowerCase().includes('user not found')
        );
    }
}
