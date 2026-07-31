import type ApiMethod from './api-method';

declare module 'axios' {
    interface AxiosRequestConfig {
        /** See `BaseHttpRequestConfig.skipAuthRefresh`. */
        skipAuthRefresh?: boolean;
        /** Set by the response interceptor before it replays a request, so one 401 buys one retry. */
        _retry?: boolean;
    }
}

export interface Session {
    accessToken?: string;
    refreshToken?: string;
    expiredAt?: number;
}

type BaseHttpRequestConfig = {
    endpoint: string;
    method: ApiMethod;
    headers?: Record<string, string>;
    timeout?: number;
    /**
     * Bypasses the 401 refresh branch in the response interceptor.
     *
     * The refresh call itself travels through the same axios instance, so without this a 401
     * from `refresh-token` re-entered the refresh flow that issued it.
     */
    skipAuthRefresh?: boolean;
};

type PostHttpRequestConfig = BaseHttpRequestConfig & {
    method: ApiMethod.POST | ApiMethod.DELETE;
    body?: Record<string, any>;
    params?: never;
};

type NonPostHttpRequestConfig = BaseHttpRequestConfig & {
    method: Exclude<ApiMethod, ApiMethod.POST>;
    params?: Record<string, any>;
    body?: never;
};

export type HttpRequestConfig = PostHttpRequestConfig | NonPostHttpRequestConfig;

/**
 * Why the caller cares which kind it was: a network drop is worth a retry button, a 4xx is
 * not, and an unauthorized needs the session flow rather than an error message.
 */
export type ApiErrorKind = 'network' | 'timeout' | 'unauthorized' | 'client' | 'server' | 'unknown';

export type ApiError = {
    kind: ApiErrorKind;
    /** Safe to render. Never the raw response body — see ErrorHandler.toApiError. */
    message: string;
    status?: number;
};

/**
 * A discriminated union, not a bag of optionals.
 *
 * The previous shape was `{ ok: boolean; data?; error? }` and `request` could additionally
 * resolve to `undefined`, so "failed" and "succeeded with nothing" were the same value at
 * every call site. Narrowing on `ok` now gives the caller either `data` or `error`, and the
 * compiler stops them reading the wrong one.
 */
export type HttpResponse<T> =
    | { ok: true; data: T; status: number; headers?: Record<string, any> }
    | { ok: false; error: ApiError; status?: number };

export interface IHttpClient {
    request<T>(config: HttpRequestConfig): Promise<HttpResponse<T>>;
    clearSession(): void;
    setAccessToken(accessToken: string): void;
}

/**
 * The slice of the transport `TokenService` actually needs.
 *
 * It used to hold a `HttpClient` instance, which made the two modules import each other
 * (`madge` reported the cycle) and handed a half-constructed `this` to the constructor.
 * Depending on the port instead keeps the arrow pointing one way.
 */
export interface ITokenHttpPort {
    request<T>(config: HttpRequestConfig): Promise<HttpResponse<T>>;
    setAccessToken(accessToken?: string): void;
    clearSession(): void;
    clearRefreshTokenTimeout(): void;
    setRefreshTokenTimeout(timeoutId: ReturnType<typeof setTimeout>): void;
}

export interface ITokenService {
    refreshToken(): Promise<boolean>;
    setSession(session: Session): Promise<void>;
    clearSession(): Promise<void>;
    getRefreshToken(): Promise<string | null>;
    logout(): Promise<void>;
}
