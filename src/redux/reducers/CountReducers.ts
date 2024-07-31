import { createReducer } from "@reduxjs/toolkit";

import { actions } from "..";

const initState: CountReducers = {
    count: 0
};

const CountReducers = createReducer(initState, (builder) =>
    builder
        .addCase(actions.CountActions.increment, (state, action) => {
            state.count += action.payload;
        })
        .addCase(actions.CountActions.decrement, (state, action) => {
            state.count -= action.payload;
        })
        .addDefaultCase((state) => state)
);

export default CountReducers;
