import { configureStore, EnhancedStore, StoreEnhancer } from '@reduxjs/toolkit';
import { compact } from 'lodash';
import createSagaMiddleware from 'redux-saga';

import { reactotron, StoreService } from '@/services';

import RootReducers from './RootReducers';
import RootSaga from './RootSaga';

import Logger from '@/helper/logger';

class StoreConfig {
    private sagaMiddleware = createSagaMiddleware({
        sagaMonitor: reactotron?.createSagaMonitor?.(),
        onError: (error) =>
            Logger.error('SagaMiddleware', {
                error: error.message,
                stack: error.stack,
            }),
    });

    private enhancers: StoreEnhancer[] = compact([reactotron?.createEnhancer?.()]);

    public store: EnhancedStore = configureStore({
        reducer: RootReducers,
        enhancers: (getDefaultEnhancers) => getDefaultEnhancers().concat(this.enhancers),
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                serializableCheck: false,
                thunk: false,
                immutableCheck: !__DEV__,
            }).concat(this.sagaMiddleware),
        devTools: __DEV__,
    });

    constructor() {
        try {
            this.sagaMiddleware.run(RootSaga.saga);
            StoreService.getInstance().initialize(this.store);
        } catch (error) {
            console.error('Failed to start saga:', error);
        }
    }
}

export default new StoreConfig().store;
