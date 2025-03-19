import { clearToken, getToken, setToken } from "@/helper";

import ApiMethod from "../ApiMethod";
import { HttpClient } from "../HttpClient";
import { ITokenService, Session } from "../interfaces/IHttpClient";

interface LoginResponse {
    access_token: string;
    refresh_token: string;
    access_token_expires_at: string;
}

export class TokenService implements ITokenService {
    private readonly httpClient: HttpClient;

    constructor(httpClient: HttpClient) {
        this.httpClient = httpClient;
    }

    async setSession(session: Session): Promise<void> {
        await setToken({
            refreshToken: session.refreshToken
        });
        this.httpClient.setSession(session.accessToken);

        if (session.accessTokenExpiresAt) {
            this.httpClient.countDownAccessTokenExpired(session.accessTokenExpiresAt);
        }
    }

    async clearSession(): Promise<void> {
        await setToken({ refreshToken: null });
        this.httpClient.clearSession();
    }

    async getRefreshToken(): Promise<string | null> {
        const token = await getToken();
        return token ?? null;
    }

    async refreshToken(): Promise<void> {
        try {
            const refreshToken = await this.getRefreshToken();
            if (!refreshToken) return;

            const response = await this.httpClient.request<{
                data: LoginResponse;
            }>({
                endpoint: "auth/refresh-token",
                method: ApiMethod.POST,
                body: { refresh_token: refreshToken }
            });

            if (!response?.ok) {
                await this.clearSession();
                return;
            }

            const data = response.data?.data;
            await this.setSession({
                accessToken: data?.access_token,
                refreshToken: data?.refresh_token,
                accessTokenExpiresAt: data?.access_token_expires_at
            });
        } catch (e) {
            console.error("Error refreshing token:", e);
            await this.clearSession();
        }
    }

    async logout(): Promise<void> {
        try {
            // TODO: Call logout API
            // TODO: Clear token from storage
            // TODO: Add Logic to clear all tokens including refresh token
            // Clear token from storage
            await clearToken();
            // Clear session from HttpClient
            this.httpClient.clearSession();
            // Clear any pending token refresh timeouts
            this.httpClient.clearRefreshTokenTimeout();
        } catch (error) {
            console.error("Error during logout:", error);
        }
    }
}
