import * as SecureStore from 'expo-secure-store';

import { clearToken, getToken, setToken } from '../storage';

const mock = SecureStore as unknown as typeof SecureStore & { __reset: () => void };

describe('refresh token storage', () => {
    beforeEach(() => {
        mock.__reset();
    });

    it('round-trips a token through the keystore', async () => {
        await setToken({ refreshToken: 'refresh-abc' });

        await expect(getToken()).resolves.toBe('refresh-abc');
    });

    it('writes with a device-only accessibility class so the token is not backed up', async () => {
        await setToken({ refreshToken: 'refresh-abc' });

        expect(SecureStore.setItemAsync).toHaveBeenCalledWith('REFRESH_TOKEN', 'refresh-abc', {
            keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        });
    });

    // The regression: setToken({refreshToken: null}) used to early-return, so clearSession()
    // left a valid credential on disk after logout.
    it.each([[null], [undefined], ['']])('deletes the stored token when given %p', async (value) => {
        await setToken({ refreshToken: 'refresh-abc' });

        await setToken({ refreshToken: value });

        expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('REFRESH_TOKEN');
        await expect(getToken()).resolves.toBeUndefined();
    });

    it('clearToken removes the entry', async () => {
        await setToken({ refreshToken: 'refresh-abc' });

        await clearToken();

        await expect(getToken()).resolves.toBeUndefined();
    });

    it('reports an unreadable keystore as logged-out rather than throwing', async () => {
        jest.mocked(SecureStore.getItemAsync).mockRejectedValueOnce(new Error('keystore unavailable'));

        await expect(getToken()).resolves.toBeUndefined();
    });
});
