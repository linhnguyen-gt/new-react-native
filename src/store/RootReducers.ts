import { combineReducers } from "redux";

import { CountReducers } from "@/redux/reducers";

const RootReducers = combineReducers({
    count: CountReducers
});

export default RootReducers;

declare global {
    export type AppState = ReturnType<typeof RootReducers>;
}
