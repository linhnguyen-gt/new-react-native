import { delay, put, takeEvery } from 'redux-saga/effects';

import { CountActions } from '../actions';

import { handleApiCall } from './ApiSagaHelper';

/** The delay stands in for a request; it is what makes the lost-update race reachable at all. */
function* increment() {
    yield* handleApiCall(CountActions.increment.type, function* () {
        yield delay(1000);
        yield put(CountActions.setIncrement());
    });
}

function* decrement() {
    // `yield*` delegates; a plain `yield` here handed the middleware a generator object and the
    // helper's loading/error handling never ran.
    yield* handleApiCall(CountActions.decrement.type, function* () {
        yield delay(1000);
        yield put(CountActions.setDecrement());
    });
}

export default function* watchCount() {
    yield takeEvery(CountActions.increment, increment);
    yield takeEvery(CountActions.decrement, decrement);
}
