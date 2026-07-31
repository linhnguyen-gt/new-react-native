import { put, takeEvery } from 'redux-saga/effects';

import * as ResponseApi from '@/features/response/api/response-api';
import * as ResponseActions from '@/features/response/model/response-actions';
import { handleApiCall } from '@/shared/store/api-saga-helper';

/** Exported for the unit test, which steps the generator directly rather than adding a dep. */
export function* getResponse() {
    yield* handleApiCall(
        { onFailure: ResponseActions.setResponseError },
        ResponseActions.getResponse.type,
        function* () {
            const response: ThenArg<ReturnType<typeof ResponseApi.responseApi>> = yield ResponseApi.responseApi();

            if (response.ok) {
                yield put(ResponseActions.setResponse(response.data));
                return;
            }

            // Previously the failure branch did not exist: a 500 left the list empty and the
            // screen silent.
            yield put(ResponseActions.setResponseError(response.error.message));
        }
    );
}

export default function* watchResponse() {
    yield takeEvery(ResponseActions.getResponse, getResponse);
}
