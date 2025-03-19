import { AxiosError, AxiosInstance } from "axios";

import { HttpError, ITokenService } from "../interfaces/IHttpClient";

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

    private async handleResponseError(error: AxiosError) {
        if (this.isTokenExpiredError(error)) {
            return this.handleTokenExpiration(error);
        }
        return Promise.reject(this.normalizeError(error));
    }

    private isTokenExpiredError(error: AxiosError): boolean {
        return error.response?.status === 401;
    }

    private async handleTokenExpiration(error: AxiosError) {
        try {
            await this.tokenService.refreshToken();
            return this.axiosInstance.request(error.config!);
        } catch (refreshError) {
            throw this.normalizeError(refreshError as AxiosError);
        }
    }

    private normalizeError(error: AxiosError): HttpError {
        return {
            message: error.message,
            code: error.code,
            status: error.response?.status
        };
    }
}
