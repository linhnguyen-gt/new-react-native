import * as SecureStore from 'expo-secure-store';

/**
 * Refresh-token storage, backed by the platform keystore.
 *
 * This used to be AsyncStorage, which writes plaintext to app-private files — recoverable from
 * a device backup or by any process with filesystem access on a rooted/jailbroken device. The
 * access token lives only in memory (axios defaults), so the refresh token is the whole
 * session and is the one credential worth protecting properly.
 */
const REFRESH_TOKEN_KEY = 'REFRESH_TOKEN';

/**
 * Removes the stored refresh token.
 * @example
 * await clearToken()
 */
export const clearToken = async (): Promise<void> => {
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
};

/**
 * Stores the refresh token, or removes it when given a falsy value.
 *
 * The falsy branch is a delete rather than a no-op on purpose: `clearSession()` calls this with
 * `null`, and the previous early-return meant the credential survived every logout.
 *
 * @example
 * await setToken({ refreshToken: 'new-refresh-token' })
 * await setToken({ refreshToken: null }) // deletes
 */
export const setToken = async ({ refreshToken }: { refreshToken?: string | null }): Promise<void> => {
    if (!refreshToken) {
        await clearToken();
        return;
    }

    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken, {
        // Keeps the token out of iCloud/iTunes backups and off other devices.
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
};

/**
 * Reads the refresh token.
 *
 * A keystore that cannot be read (corrupted Android keystore, hardware-backed key invalidated
 * by a lock-screen change) is treated as logged-out rather than propagated — the caller's only
 * sensible response either way is to send the user to login.
 *
 * @example
 * const token = await getToken()
 */
export const getToken = async (): Promise<string | undefined> => {
    try {
        return (await SecureStore.getItemAsync(REFRESH_TOKEN_KEY)) ?? undefined;
    } catch {
        return undefined;
    }
};
