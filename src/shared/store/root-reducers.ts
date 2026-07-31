import { combineReducers } from 'redux';

import type { Action } from 'redux';

import CountReducers from '@/features/count/model/count-reducers';
import { responseApi } from '@/features/response/api/response-api';
import ActionTypes from '@/shared/store/action-types';
import LoadingReducers from '@/shared/store/loading/loading-reducers';

const appReducer = combineReducers({
    count: CountReducers,
    loading: LoadingReducers,
    // The API cache is part of the same tree, so RESET_STATE clears it along with everything
    // else — no separate `resetApiState()` call on logout.
    [responseApi.reducerPath]: responseApi.reducer,
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
