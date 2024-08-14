import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

import ApiMethod from "./ApiMethod";

const DEFAULT_API_CONFIG = {
    baseURL: ""
} as const;

const _methodRes = [ApiMethod.GET, ApiMethod.DELETE];

class HttpClient {
    private static _instance: HttpClient;
    INSTANCE!: AxiosInstance;
    TOKEN!: string | undefined;

    constructor() {
        this._init();
    }

    static getInstance(): HttpClient {
        if (!HttpClient._instance) {
            return new HttpClient();
        }
        return HttpClient._instance;
    }

    _init() {
        if (!this.INSTANCE) {
            this.INSTANCE = axios.create({
                baseURL: DEFAULT_API_CONFIG.baseURL
            });
            this.setInterceptorRequest();
            this.setInterceptorResponse();
        }
    }

    async request<
        Data extends Record<string, any>,
        Method extends ApiMethod,
        Body = Record<string, any>,
        Params = Record<string, any>
    >(
        endpoint: string,
        apiConfig: ApiClientConfig<Body, Params, Method>,
        config?: AxiosRequestConfig
    ): Promise<BaseResponse<Data>> {
        const { method, params, body } = apiConfig;
        const data = _methodRes.includes(method)
            ? {
                  params
              }
            : body;
        try {
            const res = await (
                this.INSTANCE[method.toLowerCase() as "get" | "post" | "put" | "patch" | "delete"] as AxiosRequestMethod
            )(endpoint, data, config);

            return {
                ok: true,
                data: res.data,
                status: res.status
            };
        } catch (e) {
            const error = e as AxiosError;
            return {
                ok: false,
                data: error.response?.data,
                status: error.response?.status
            };
        }
    }

    setInterceptorRequest() {
        return this.INSTANCE.interceptors.request.use(
            async (config) => {
                this.TOKEN = "token";

                if (this.TOKEN) {
                    config.headers.Authorization = `Bearer ${this.TOKEN}`;
                }

                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );
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

    setInterceptorResponse() {
        return this.INSTANCE.interceptors.response.use(
            (response) => response,
            async (error) => {
                console.warn("error config::", error.response.data);
                // Access Token was expired
                if (error.response.status === 401) {
                    if (error.response.data.message === "Unauthorized") {
                        try {
                            await this.refreshToken();
                            return this.INSTANCE.request(error.config);
                        } catch (refreshError) {
                            return Promise.reject(refreshError.response?.data || refreshError);
                        }
                    } else {
                        return Promise.reject(error.response.data || error);
                    }
                }

                return Promise.reject(error);
            }
        );
    }

    async refreshToken() {
        // refresh token
    }
}

export default HttpClient.getInstance();

declare global {
    type HttpClientBaseConfig<M extends ApiMethod, P = Record<string, any>, B = Record<string, any>> = {
        method: M;
        params?: P;
        body?: B;
    };

    type ApiClientConfig<B, P, M extends ApiMethod> = M extends ApiMethod.GET | ApiMethod.DELETE
        ? HttpClientBaseConfig<M, P>
        : HttpClientBaseConfig<M, P, B>;

    type AxiosRequestMethod = <T = any, R = AxiosResponse<T>>(
        url: string,
        data?: any,
        config?: AxiosRequestConfig
    ) => Promise<R>;
}
