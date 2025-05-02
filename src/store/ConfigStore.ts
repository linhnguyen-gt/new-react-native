import { configureStore, EnhancedStore, Middleware, StoreEnhancer } from "@reduxjs/toolkit";
import { compact } from "lodash";

import { reactotron, StoreService } from "@/services";

import RootReducers from "./RootReducers";
import RootSaga from "./RootSaga";

import Logger from "@/helper/logger";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const createSagaMiddleware = require("redux-saga").default;

class StoreConfig {
    private sagaMiddleware = createSagaMiddleware({
        sagaMonitor: reactotron?.createSagaMonitor?.(),
        onError: (error: Error, { sagaStack }: { sagaStack: string }) =>
            Logger.error("SagaMiddleware", {
                error: error.message,
                stack: error.stack,
                sagaStack
            })
    });

    private enhancers: StoreEnhancer[] = compact([reactotron?.createEnhancer?.()]);

    public store: EnhancedStore = configureStore({
        reducer: RootReducers,
        enhancers: (getDefaultEnhancers) => getDefaultEnhancers().concat(this.enhancers),
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                serializableCheck: false,
                thunk: false,
                immutableCheck: !__DEV__
            }).concat(this.sagaMiddleware as Middleware),
        devTools: __DEV__
    });

    constructor() {
        try {
            this.sagaMiddleware.run(RootSaga.saga);
            StoreService.getInstance().initialize(this.store);
        } catch (error) {
            console.error("Failed to start saga:", error);
        }
    }
}

export default new StoreConfig().store;
