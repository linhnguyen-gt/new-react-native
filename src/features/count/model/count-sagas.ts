import { delay, put, takeEvery } from 'redux-saga/effects';

import * as CountActions from '@/features/count/model/count-actions';
import { handleApiCall } from '@/shared/store/api-saga-helper';

/**
 * Count is local state with a multi-step async flow, so it stays on redux-saga. Server state
 * belongs to RTK Query — see `features/response/api/response-api.ts` for the other half of that
 * boundary.
 *
 * The delay stands in for a request; it is what makes the lost-update race reachable at all.
 */
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
