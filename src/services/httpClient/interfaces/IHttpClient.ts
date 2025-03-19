import ApiMethod from "../ApiMethod";

export interface Session {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpiresAt?: string;
}

export interface IHttpClient {
    request<T>(config: HttpRequestConfig): Promise<HttpResponse<T> | undefined>;
    setSession(token: string): void;
    clearSession(): void;
}

export interface ITokenService {
    refreshToken(): Promise<void>;
    setSession(session: Session): Promise<void>;
    clearSession(): Promise<void>;
    getRefreshToken(): Promise<string | null>;
}

export interface HttpRequestConfig {
    endpoint: string;
    method: ApiMethod;
    params?: Record<string, any>;
    body?: Record<string, any>;
    headers?: Record<string, string>;
    timeout?: number;
}

export interface HttpResponse<T> {
    ok: boolean;
    data?: T;
    error?: HttpError;
    status: number;
}

export interface HttpError {
    message: string;
    code?: string;
    status?: number;
}
