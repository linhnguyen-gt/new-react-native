import { clearToken, getToken, setToken } from '@/helper';

import ApiMethod from '../ApiMethod';
import { ITokenHttpPort, ITokenService, Session } from '../interfaces/IHttpClient';

import Logger from '@/helper/logger';
import { StoreService } from '@/services/store';

type RefreshResponse = {
    data: {
        accessToken: string;
        /** Present only if the backend rotates refresh tokens; stored as-is when it does. */
        refreshToken?: string;
        expiredAt?: number;
    };
};

/** Refresh this long before the access token dies, so an in-flight request never races it. */
const REFRESH_BUFFER_MS = 30 * 1000;

/** Used when the server does not tell us when the access token expires. */
const FALLBACK_TOKEN_LIFETIME_MS = 15 * 60 * 1000;

/** A timer shorter than this is not worth scheduling — refresh immediately-ish instead. */
const MIN_REFRESH_DELAY_MS = 5 * 1000;

export class TokenService implements ITokenService {
    private readonly port: ITokenHttpPort;

    /** Single-flight guard: concurrent 401s share one refresh call. */
    private refreshPromise: Promise<boolean> | null = null;

    constructor(port: ITokenHttpPort) {
        this.port = port;
    }

    async setSession(session: Session): Promise<void> {
        this.port.setAccessToken(session.accessToken);

        // Only touch storage when the session actually carries a refresh token. A refresh
        // response contains a new access token and (unless the backend rotates) no refresh
        // token, so writing unconditionally would delete the credential the next refresh needs.
        // Clearing is `clearSession`'s job, not a side effect of setting a new access token.
        if (session.refreshToken !== undefined) {
            await setToken({ refreshToken: session.refreshToken });
        }

        this.port.clearRefreshTokenTimeout();

        const timeoutId = setTimeout(() => {
            this.refreshToken();
        }, refreshDelayFor(session.expiredAt));

        this.port.setRefreshTokenTimeout(timeoutId);
    }

    async clearSession(): Promise<void> {
        await clearToken();
        this.port.clearSession();
        this.port.clearRefreshTokenTimeout();
    }

    async getRefreshToken(): Promise<string | null> {
        const token = await getToken();
        return token ?? null;
    }

    /**
     * Returns the in-flight refresh when there is one.
     *
     * Five concurrent 401s used to mean five refresh calls, each overwriting the shared timer —
     * and against a backend that rotates the refresh token, four of them logging the user out.
     */
    async refreshToken(): Promise<boolean> {
        if (this.refreshPromise) return this.refreshPromise;

        this.refreshPromise = this.doRefresh().finally(() => {
            this.refreshPromise = null;
        });

        return this.refreshPromise;
    }

    async logout(): Promise<void> {
        await this.clearSession();
        StoreService.getInstance().logout();
    }

    private async doRefresh(): Promise<boolean> {
        const refreshToken = await this.getRefreshToken();
        if (!refreshToken) return false;

        // The credential used to be read purely as a null check and never sent, so the server had
        // nothing to identify the session with. If the backend moves to a refresh cookie, drop the
        // body and switch on `withCredentials` in HttpClient's axios factory instead.
        const response = await this.port.request<RefreshResponse>({
            endpoint: 'refresh-token',
            method: ApiMethod.POST,
            body: { refreshToken },
            skipAuthRefresh: true,
        });

        if (!response.ok) {
            await this.logout();
            return false;
        }

        const data = response.data?.data;
        if (!data?.accessToken) {
            Logger.error('TokenService', 'refresh-token responded without an access token');
            await this.logout();
            return false;
        }

        await this.setSession({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            expiredAt: data.expiredAt,
        });
        return true;
    }
}

/**
 * `Session.expiredAt` was already carried on the type and ignored in favour of a hardcoded
 * 15 minutes, so a session with any other lifetime refreshed at the wrong moment.
 */
const refreshDelayFor = (expiredAt?: number): number => {
    if (!expiredAt) return FALLBACK_TOKEN_LIFETIME_MS - REFRESH_BUFFER_MS;
    return Math.max(expiredAt - Date.now() - REFRESH_BUFFER_MS, MIN_REFRESH_DELAY_MS);
};
