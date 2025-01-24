import { createSlice } from "@reduxjs/toolkit";

import { ResponseActions } from "../actions";

const initialState: ResponseReducers = {
    response: []
};

const ResponseReducers = createSlice({
    name: "response",
    initialState,
    reducers: {},
    extraReducers: (builder) =>
        builder
            .addCase(ResponseActions.setResponse, (state, action) => {
                state.response = action.payload;
            })
            .addDefaultCase((state) => state)
});

export default ResponseReducers.reducer;
