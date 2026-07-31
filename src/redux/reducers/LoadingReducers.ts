import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * A count of in-flight tasks per action type, not a boolean.
 *
 * Under `takeEvery` two tasks of the same type overlap routinely, and with a boolean the first
 * one to finish hid the spinner while the second was still running. Keys were also only ever set
 * to `false`, so the map grew for the life of the app; they are deleted at zero now.
 */
type LoadingState = Record<string, number>;

const initialState: LoadingState = {};

const LoadingReducers = createSlice({
    name: 'loading',
    initialState,
    reducers: {
        startLoading: (state, action: PayloadAction<string>) => {
            state[action.payload] = (state[action.payload] ?? 0) + 1;
        },
        stopLoading: (state, action: PayloadAction<string>) => {
            const pending = state[action.payload] ?? 0;
            if (pending <= 1) {
                delete state[action.payload];
                return;
            }
            state[action.payload] = pending - 1;
        },
    },
});

export const { startLoading, stopLoading } = LoadingReducers.actions;

export default LoadingReducers.reducer;
