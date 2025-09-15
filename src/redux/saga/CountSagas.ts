import { delay, put, select, takeEvery } from 'redux-saga/effects';

import { CountActions } from '../actions';
import { CountSelectors } from '../selectors';

import { handleApiCall } from './ApiSagaHelper';

function* increment() {
    yield* handleApiCall(CountActions.increment.type, function* () {
        yield delay(1000);
        const data: number = yield select(CountSelectors.count);
        const count = data + 1;
        yield put(CountActions.setIncrement(count));
    });
}

function* decrement() {
    yield handleApiCall(CountActions.decrement.type, function* () {
        yield delay(1000);
        const data: number = yield select(CountSelectors.count);
        const count = data - 1;
        yield put(CountActions.setDecrement(count));
    });
}

export default function* watchCount() {
    yield takeEvery(CountActions.increment, increment);
    yield takeEvery(CountActions.decrement, decrement);
}
