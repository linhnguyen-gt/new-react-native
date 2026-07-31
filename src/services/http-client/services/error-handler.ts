import { isAxiosError } from 'axios';

import type { ApiError, ApiErrorKind } from '../interfaces/http-client';

import Logger from '@/helper/logger';

/**
 * Shown to the user when the server offers nothing better. Deliberately vague: a response body
 * can carry stack fragments and internal identifiers, so it never reaches the UI verbatim.
 */
const FALLBACK_MESSAGE: Record<ApiErrorKind, string> = {
    network: 'No connection. Check your network and try again.',
    timeout: 'The request took too long. Try again.',
    unauthorized: 'Your session has expired. Please sign in again.',
    client: 'The request could not be completed.',
    server: 'Something went wrong on our side. Try again shortly.',
    unknown: 'An unexpected error occurred.',
};

/** A server `message` longer than this is a payload dump, not a message. */
const MAX_SERVER_MESSAGE_LENGTH = 200;

export interface IErrorHandler {
    toApiError(error: unknown): ApiError;
}

const classify = (status: number | undefined, code: string | undefined, hasResponse: boolean): ApiErrorKind => {
    if (code === 'ECONNABORTED' || code === 'ETIMEDOUT') return 'timeout';
    if (!hasResponse) return 'network';
    if (status === 401 || status === 403) return 'unauthorized';
    if (status !== undefined && status >= 500) return 'server';
    if (status !== undefined && status >= 400) return 'client';
    return 'unknown';
};

/** Accepts the server's own short `message`/`error` string; rejects anything payload-shaped. */
const serverMessage = (data: unknown): string | undefined => {
    if (typeof data === 'string') {
        return data.length <= MAX_SERVER_MESSAGE_LENGTH ? data : undefined;
    }
    if (typeof data !== 'object' || data === null) return undefined;

    const candidate = (data as { message?: unknown; error?: unknown }).message ?? (data as { error?: unknown }).error;
    if (typeof candidate !== 'string' || candidate.length > MAX_SERVER_MESSAGE_LENGTH) return undefined;

    return candidate;
};

export class ErrorHandler implements IErrorHandler {
    /**
     * Pure: classifies and logs, then returns. It used to `Promise.reject`, which the caller
     * never awaited — one unhandled rejection per failed request, and the only structured error
     * data went with it. It also stringified an `Error`, which JSON renders as `{}`; that is
     * where the `Uncaught (in promise, id: 0): "Error: {}"` in LogBox came from.
     */
    toApiError(error: unknown): ApiError {
        if (!isAxiosError(error)) {
            Logger.error('HttpError', { kind: 'unknown' });
            return { kind: 'unknown', message: FALLBACK_MESSAGE.unknown };
        }

        const status = error.response?.status;
        const kind = classify(status, error.code, error.response !== undefined);

        // Headers are absent on purpose: axios merges INSTANCE.defaults into config.headers, so
        // logging them publishes the live `Authorization: Bearer …`.
        Logger.error('HttpError', {
            kind,
            status,
            data: error.response?.data,
            config: {
                url: error.config?.url,
                method: error.config?.method,
            },
        });

        return {
            kind,
            message: serverMessage(error.response?.data) ?? FALLBACK_MESSAGE[kind],
            status,
        };
    }
}
