import { configureStore } from '@reduxjs/toolkit';
import { compact } from 'lodash';
import createSagaMiddleware from 'redux-saga';

import { initReactotron, reactotron, StoreService } from '@/services';

import RootReducers from './root-reducers';
import RootSaga from './root-saga';

import type { EnhancedStore, StoreEnhancer } from '@reduxjs/toolkit';

import Logger from '@/helper/logger';

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

    const enhancers: StoreEnhancer[] = compact([reactotron?.createEnhancer?.()]);

    const store = configureStore({
        reducer: RootReducers,
        enhancers: (getDefaultEnhancers) => getDefaultEnhancers().concat(enhancers),
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                serializableCheck: false,
                thunk: false,
                immutableCheck: !__DEV__,
            }).concat(sagaMiddleware),
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
