// Manual mock for the native keystore. Jest picks this up automatically for the node module.
// Backed by a plain Map so tests can assert real set/get/delete behaviour, not just call counts.
const store = new Map();

export const WHEN_UNLOCKED_THIS_DEVICE_ONLY = 'WHEN_UNLOCKED_THIS_DEVICE_ONLY';

export const setItemAsync = jest.fn(async (key, value) => {
    store.set(key, value);
});

export const getItemAsync = jest.fn(async (key) => (store.has(key) ? store.get(key) : null));

export const deleteItemAsync = jest.fn(async (key) => {
    store.delete(key);
});

/** Clears both the backing store and the call history. Call in beforeEach. */
export const __reset = () => {
    store.clear();
    setItemAsync.mockClear();
    getItemAsync.mockClear();
    deleteItemAsync.mockClear();
};
