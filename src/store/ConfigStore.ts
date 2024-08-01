import { applyMiddleware, configureStore, EnhancedStore, StoreEnhancer } from "@reduxjs/toolkit";
import { compact } from "lodash";
import createSagaMiddleware from "redux-saga";

import { Reactotron } from "@/services";

import RootReducers from "./RootReducers";
import RootSaga from "./RootSaga";

const createReactotron = (): Reactotron => {
    const reactotron = new Reactotron();
    reactotron.setup();
    return reactotron;
};

class StoreConfig {
    private reactotron = createReactotron();

    private sagaMiddleware = createSagaMiddleware({ sagaMonitor: this.reactotron.tron?.createSagaMonitor?.() });

    private enhancers: StoreEnhancer[] = compact([
        applyMiddleware(this.sagaMiddleware),
        this.reactotron.tron?.createEnhancer?.()
    ]);

    public store: EnhancedStore<AppState> = configureStore({
        reducer: RootReducers,
        enhancers: (getDefaultEnhancers) => getDefaultEnhancers().concat(this.enhancers)
    });

    constructor() {
        this.sagaMiddleware.run(RootSaga.saga);
    }
}

export default new StoreConfig();
