import { createSlice } from '@reduxjs/toolkit';

import * as CountActions from '@/features/count/model/count-actions';

const initialState: CountReducers = {
    count: 0,
};

const CountReducers = createSlice({
    name: 'count',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(CountActions.setIncrement, (state) => {
            state.count += 1;
        });
        builder.addCase(CountActions.setDecrement, (state) => {
            state.count -= 1;
        });
        builder.addDefaultCase((state) => state);
    },
});

export default CountReducers.reducer;
