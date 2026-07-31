import axios from 'axios';

import { environment } from '../environment';

import ApiMethod from './api-method';
import { ErrorHandler } from './services/error-handler';
import { RequestInterceptor } from './services/request-interceptor';
import { TokenService } from './services/token-service';

import type { HttpRequestConfig, HttpResponse, IHttpClient, ITokenHttpPort } from './interfaces/http-client';
import type { AxiosInstance, AxiosRequestConfig } from 'axios';

const DEFAULT_TIMEOUT_MS = 30000;

export class HttpClient implements IHttpClient, ITokenHttpPort {
    private static _instance: HttpClient;

    private readonly INSTANCE: AxiosInstance;

    private readonly tokenService: TokenService;

    private readonly errorHandler: ErrorHandler;

    private readonly requestInterceptor: RequestInterceptor;

    private timeoutId: ReturnType<typeof setTimeout> | null = null;

    private constructor(
        tokenService?: TokenService,
        errorHandler?: ErrorHandler,
        config: Partial<AxiosRequestConfig> = {}
    ) {
        this.INSTANCE = axios.create({
            // Read here rather than at module scope: importing this file must not touch the
            // environment, which can throw on a bad config.
            baseURL: environment.apiBaseUrl,
            timeout: DEFAULT_TIMEOUT_MS,
            // TODO: Uncomment this when the backend is ready to receive cookies
            // withCredentials: true,
            ...config,
        });
        this.errorHandler = errorHandler ?? new ErrorHandler();
        this.tokenService = tokenService ?? new TokenService(this);
        this.requestInterceptor = new RequestInterceptor(this.INSTANCE, this.tokenService);
        this.requestInterceptor.setupInterceptors();
    }

    static getInstance(tokenService?: TokenService, errorHandler?: ErrorHandler): HttpClient {
        if (!HttpClient._instance) {
            HttpClient._instance = new HttpClient(tokenService, errorHandler);
        }
        return HttpClient._instance;
    }

    async request<T>(config: HttpRequestConfig): Promise<HttpResponse<T>> {
        try {
            const headers = { ...config.headers };

            const response = await this.INSTANCE.request<T>({
                url: config.endpoint,
                method: config.method.toLowerCase(),
                params: this.shouldIncludeParams(config.method) ? config.params : undefined,
                data: this.shouldIncludeBody(config.method) ? config.body : undefined,
                // Was silently dropped: HttpRequestConfig.timeout is part of the public type.
                timeout: config.timeout,
                // Read back by the response interceptor; keeps the refresh call out of the
                // refresh flow it would otherwise trigger.
                skipAuthRefresh: config.skipAuthRefresh,
                headers,
            });

            return {
                ok: true,
                data: response.data,
                status: response.status,
                headers: response.headers,
            };
        } catch (e) {
            // Resolves with the failure instead of returning `undefined` and leaving a floating
            // rejection behind. Callers narrow on `ok`; nobody has to guess what `undefined` meant.
            const error = this.errorHandler.toApiError(e);
            return { ok: false, error, status: error.status };
        }
    }

    private shouldIncludeParams(method: ApiMethod): boolean {
        return [ApiMethod.GET].includes(method);
    }

    private shouldIncludeBody(method: ApiMethod): boolean {
        return !this.shouldIncludeParams(method);
    }

    updateHeaders(newHeaders: Record<string, string>): void {
        if (this.INSTANCE) {
            this.INSTANCE.defaults.headers = {
                ...this.INSTANCE.defaults.headers,
                ...newHeaders,
            };
        }
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

    setRefreshTokenTimeout(timeoutId: ReturnType<typeof setTimeout>): void {
        this.timeoutId = timeoutId;
    }

    public getTokenService(): TokenService {
        return this.tokenService;
    }

    public setAccessToken(accessToken?: string): void {
        this.INSTANCE.defaults.headers.Authorization = `Bearer ${accessToken}`;
    }

    public getInstance(): AxiosInstance {
        return this.INSTANCE;
    }
}

/**
 * The single entry point for callers.
 *
 * This module used to end in `export default HttpClient.getInstance()`, so merely importing
 * anything from `@/services` constructed axios and read the environment. It also meant the
 * `getInstance(tokenService, errorHandler)` parameters were already spent by the time any test
 * could pass its own — DI in shape only.
 */
export const getHttpClient = (): HttpClient => HttpClient.getInstance();

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
