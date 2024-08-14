import { put, select, takeEvery } from "redux-saga/effects";

import { actions, selectors } from "@/redux";

function* increment() {
    const data: number = yield select(selectors.CountSelectors.count);
    const count = data + 1;
    yield put(actions.CountActions.setIncrement(count));
}

function* decrement() {
    const data: number = yield select(selectors.CountSelectors.count);
    const count = data - 1;
    yield put(actions.CountActions.setDecrement(count));
}

export default function* watchCount() {
    yield takeEvery(actions.CountActions.increment, increment);
    yield takeEvery(actions.CountActions.decrement, decrement);
}
