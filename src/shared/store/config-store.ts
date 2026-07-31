import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';

import RootReducers from './root-reducers';
import RootSaga from './root-saga';

import type { EnhancedStore } from '@reduxjs/toolkit';

import { responseApi } from '@/features/response/api/response-api';
import { reactotron } from '@/shared/config/reactotron';
import { initReactotron } from '@/shared/config/reactotron';
import Logger from '@/shared/lib/logger';
import { StoreService } from '@/shared/store/store-service';

/**
 * A factory, not a module-level instance.
 *
 * The store used to be built while this module loaded, and a `sagaMiddleware.run()` failure was
 * swallowed by a `console.error` — the app then rendered normally with no saga watchers at all:
 * every button dead, nothing reported. Failing here is fatal on purpose, and `Root` turns it
 * into a visible bootstrap screen.
 */
export const createAppStore = (): EnhancedStore => {
    // Must precede the enhancer and saga-monitor calls below; both come from `tron`, which only
    // exists after setup.
    if (__DEV__) initReactotron();

    const sagaMiddleware = createSagaMiddleware({
        sagaMonitor: reactotron?.createSagaMonitor?.(),
        onError: (error) =>
            Logger.error('SagaMiddleware', {
                error: error.message,
                stack: error.stack,
            }),
    });

    // A conditional concat rather than an array of possibly-undefined enhancers: a
    // `StoreEnhancer[]` widens the store's enhancer tuple, and the inference failure surfaces
    // as an unrelated middleware type error further down.
    const reactotronEnhancer = reactotron?.createEnhancer?.();

    const store = configureStore({
        reducer: RootReducers,
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                serializableCheck: false,
                // RTK Query's middleware is built on thunks; with `thunk: false` its endpoints
                // silently never run.
                immutableCheck: !__DEV__,
            }).concat(sagaMiddleware, responseApi.middleware),
        // Must stay *after* `middleware`: TypeScript infers these keys in source order, and an
        // `enhancers` callback seen first pins the middleware tuple to its default single entry,
        // which then rejects the two middlewares added above.
        enhancers: (getDefaultEnhancers) =>
            reactotronEnhancer ? getDefaultEnhancers().concat(reactotronEnhancer) : getDefaultEnhancers(),
        devTools: __DEV__,
    });

    try {
        sagaMiddleware.run(RootSaga.saga);
    } catch (error) {
        Logger.error('createAppStore', 'the root saga failed to start', error);
        throw error;
    }

    StoreService.getInstance().initialize(store);

    return store;
};
