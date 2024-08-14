import { createReducer } from "@reduxjs/toolkit";

import { actions } from "..";

const initState: CountReducers = {
    count: 0
};

const CountReducers = createReducer(initState, (builder) =>
    builder
        .addCase(actions.CountActions.setIncrement, (state, action) => {
            state.count = action.payload;
        })
        .addCase(actions.CountActions.setDecrement, (state, action) => {
            state.count = action.payload;
        })
        .addDefaultCase((state) => state)
);

export default CountReducers;
