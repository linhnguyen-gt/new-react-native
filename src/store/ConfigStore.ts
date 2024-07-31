import { applyMiddleware, configureStore, EnhancedStore } from "@reduxjs/toolkit";
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

    public store: EnhancedStore<AppState> = configureStore({
        reducer: RootReducers,
        enhancers: (getDefaultEnhancers) => getDefaultEnhancers().concat(applyMiddleware(this.sagaMiddleware))
    });

    constructor() {
        this.sagaMiddleware.run(RootSaga.saga);
    }
}

export default new StoreConfig();
