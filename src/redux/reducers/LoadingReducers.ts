import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import ActionTypes from "../../constants/ActionTypes";

interface LoadingState {
    [key: string]: boolean;
}

const initialState: LoadingState = {};

const LoadingReducers = createSlice({
    name: "loading",
    initialState,
    reducers: {
        startLoading: (state, action: PayloadAction<ActionTypes>) => {
            // Resetting state to empty before setting new loading state
            Object.keys(state).forEach((key) => {
                delete state[key];
            });
            state[action.payload] = true;

            // console.log(state);
        },
        stopLoading: (state, action: PayloadAction<ActionTypes>) => {
            // Resetting state to empty before setting new loading state
            Object.keys(state).forEach((key) => {
                delete state[key];
            });
            state[action.payload] = false;
            // console.log(state);
        }
    }
});

export const { startLoading, stopLoading } = LoadingReducers.actions;

export default LoadingReducers.reducer;
