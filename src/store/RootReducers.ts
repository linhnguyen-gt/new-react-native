import { combineReducers } from "redux";

import { CountReducers, LoadingReducers } from "@/redux/reducers";

const RootReducers = combineReducers({
    count: CountReducers,
    loading: LoadingReducers
});

export default RootReducers;

declare global {
    export type AppState = ReturnType<typeof RootReducers>;
}
