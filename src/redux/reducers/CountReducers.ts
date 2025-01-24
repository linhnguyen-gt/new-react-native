import { createSlice } from "@reduxjs/toolkit";

import { CountActions } from "../actions";

const initialState: CountReducers = {
    count: 0
};

const CountReducers = createSlice({
    name: "count",
    initialState,
    reducers: {},
    extraReducers: (builder) =>
        builder
            .addCase(CountActions.setIncrement, (state, action) => {
                state.count = action.payload;
            })
            .addCase(CountActions.setDecrement, (state, action) => {
                state.count = action.payload;
            })
            .addDefaultCase((state) => state)
});

export default CountReducers.reducer;
