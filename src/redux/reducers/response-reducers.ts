import { createSlice } from '@reduxjs/toolkit';

import { ResponseActions } from '../actions';

const initialState: ResponseReducers = {
    response: [],
};

const ResponseReducers = createSlice({
    name: 'response',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(ResponseActions.setResponse, (state, action) => {
            state.response = action.payload;
            // A successful load clears the previous failure, otherwise a stale error sits under
            // fresh data forever.
            state.error = undefined;
        });
        builder.addCase(ResponseActions.setResponseError, (state, action) => {
            state.error = action.payload;
        });
        builder.addDefaultCase((state) => state);
    },
});

export default ResponseReducers.reducer;
