import { Action, combineReducers } from "redux";

import { ActionTypes } from "@/constants";

import { CountReducers, LoadingReducers, ResponseReducers } from "@/redux/reducers";

const appReducer = combineReducers({
    count: CountReducers,
    response: ResponseReducers,
    loading: LoadingReducers
});

export type RootState = ReturnType<typeof appReducer>;

const RootReducers = (state: RootState | undefined, action: Action): RootState => {
    if (action.type === ActionTypes.RESET_STATE) {
        return appReducer(undefined, action);
    }
    return appReducer(state, action);
};

export default RootReducers;

declare global {
    export type AppState = ReturnType<typeof RootReducers>;
}
