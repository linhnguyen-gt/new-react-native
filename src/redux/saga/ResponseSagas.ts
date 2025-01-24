import { put, takeEvery } from "redux-saga/effects";

import { ResponseActions } from "../actions";

import { handleApiCall } from "./ApiSagaHelper";

import { ResponseApi } from "@/apis";

function* getResponse() {
    yield* handleApiCall(ResponseActions.getResponse.type, function* () {
        const response: ThenArg<ReturnType<typeof ResponseApi.responseApi>> = yield ResponseApi.responseApi();
        if (response?.ok) {
            yield put(ResponseActions.setResponse(response.data));
        }
    });
}

export default function* watchResponse() {
    yield takeEvery(ResponseActions.getResponse, getResponse);
}
