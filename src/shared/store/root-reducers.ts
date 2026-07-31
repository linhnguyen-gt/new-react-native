import { combineReducers } from 'redux';

import type { Action } from 'redux';

import CountReducers from '@/features/count/model/count-reducers';
import ResponseReducers from '@/features/response/model/response-reducers';
import ActionTypes from '@/shared/store/action-types';
import LoadingReducers from '@/shared/store/loading/loading-reducers';

const appReducer = combineReducers({
    count: CountReducers,
    response: ResponseReducers,
    loading: LoadingReducers,
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
