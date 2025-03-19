import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

import { environment } from "../environment";

import ApiMethod from "./ApiMethod";
import { HttpRequestConfig, HttpResponse, IHttpClient, ITokenService } from "./interfaces/IHttpClient";
import { ErrorHandler, IErrorHandler } from "./services/ErrorHandler";
import { RequestInterceptor } from "./services/RequestInterceptor";
import { TokenService } from "./services/TokenService";

const DEFAULT_API_CONFIG = {
    baseURL: environment.apiBaseUrl,
    timeout: 30000
} as const;

export class HttpClient implements IHttpClient {
    private static _instance: HttpClient;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    private readonly INSTANCE: AxiosInstance;
    private readonly tokenService: ITokenService;
    private readonly errorHandler: IErrorHandler;
    private readonly requestInterceptor: RequestInterceptor;
    private timeoutId: NodeJS.Timeout | null = null;

    private constructor(
        tokenService?: ITokenService,
        errorHandler?: IErrorHandler,
        config: Partial<AxiosRequestConfig> = {}
    ) {
        this.INSTANCE = axios.create({
            baseURL: DEFAULT_API_CONFIG.baseURL,
            timeout: DEFAULT_API_CONFIG.timeout,
            headers: {
                "Content-Type": "application/json"
            },
            ...config
        });
        this.errorHandler = errorHandler ?? new ErrorHandler();
        this.tokenService = tokenService ?? new TokenService(this);
        this.requestInterceptor = new RequestInterceptor(this.INSTANCE, this.tokenService);
        this.requestInterceptor.setupInterceptors();
    }

    static getInstance(tokenService?: ITokenService, errorHandler?: IErrorHandler): HttpClient {
        if (!HttpClient._instance) {
            HttpClient._instance = new HttpClient(tokenService, errorHandler);
        }
        return HttpClient._instance;
    }

    async request<T>(config: HttpRequestConfig): Promise<HttpResponse<T> | undefined> {
        try {
            const response = await this.INSTANCE.request<T>({
                url: config.endpoint,
                method: config.method.toLowerCase(),
                params: this.shouldIncludeParams(config.method) ? config.params : undefined,
                data: this.shouldIncludeBody(config.method) ? config.body : undefined,
                headers: config.headers,
                timeout: config.timeout
            });

            return {
                ok: true,
                data: response.data,
                status: response.status
            };
        } catch (e) {
            return this.errorHandler.handleError(e);
        }
    }

    private shouldIncludeParams(method: ApiMethod): boolean {
        return [ApiMethod.GET, ApiMethod.DELETE].includes(method);
    }

    private shouldIncludeBody(method: ApiMethod): boolean {
        return !this.shouldIncludeParams(method);
    }

    // update headers if needed
    updateHeaders(newHeaders: Record<string, string>): void {
        if (this.INSTANCE) {
            this.INSTANCE.defaults.headers = {
                ...this.INSTANCE.defaults.headers,
                ...newHeaders
            };
        }
    }

    setSession(token?: string): void {
        if (!token) return;
        this.INSTANCE.defaults.headers.Authorization = `Bearer ${token}`;
    }

    clearSession(): void {
        delete this.INSTANCE.defaults.headers.Authorization;
    }

    clearRefreshTokenTimeout(): void {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
    }

    countDownAccessTokenExpired(timeExpired: string): void {
        try {
            this.clearRefreshTokenTimeout();
            const expirationTime = new Date(timeExpired).getTime();
            const currentTime = Date.now();
            const timeUntilExpiry = expirationTime - currentTime;

            if (isNaN(expirationTime)) {
                console.error("Invalid expiration time format");
                return;
            }

            if (timeUntilExpiry <= 60 * 1000) {
                this.tokenService.refreshToken();
                return;
            }

            const refreshOffset = 60 * 1000;
            this.timeoutId = setTimeout(() => {
                this.tokenService.refreshToken();
            }, timeUntilExpiry - refreshOffset);
        } catch (error) {
            console.error("Error in countDownAccessTokenExpired:", error);
            this.tokenService.refreshToken();
        }
    }
}

export default HttpClient.getInstance();

declare global {
    type HttpClientBaseConfig<M extends ApiMethod, P = Record<string, any>, B = Record<string, any>> = {
        method: M;
        params?: P;
        body?: B;
        headers?: Record<string, string>;
    };

    type ApiClientConfig<B, P, M extends ApiMethod> = M extends ApiMethod.GET | ApiMethod.DELETE
        ? HttpClientBaseConfig<M, P>
        : HttpClientBaseConfig<M, P, B>;
}
