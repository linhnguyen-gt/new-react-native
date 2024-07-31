import { combineReducers, Reducer } from "redux";

const RootReducers: Reducer<AppState> = combineReducers<AppState>({});

export default RootReducers;

declare global {
    export type AppState = {};
}
