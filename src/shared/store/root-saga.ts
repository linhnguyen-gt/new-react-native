import { all, cancel, fork, take } from 'redux-saga/effects';

import type { Task } from 'redux-saga';
import type { Effect } from 'redux-saga/effects';

import watchCount from '@/features/count/model/count-sagas';
import watchResponse from '@/features/response/model/response-sagas';
import ActionTypes from '@/shared/store/action-types';

function* watchers() {
    yield all([fork(watchCount), fork(watchResponse)]);
}

class RootSaga {
    /**
     * Restarts every watcher on `RESET_STATE` instead of leaving them running.
     *
     * `RootReducers` wipes the tree on reset, but nothing cancelled the tasks in flight, so a
     * request started under the previous session finished afterwards and wrote its data into the
     * freshly reset store — a cross-session leak on logout.
     */
    static *saga(): Generator<Effect, void, Task> {
        while (true) {
            const task = yield fork(watchers);
            yield take(ActionTypes.RESET_STATE);
            yield cancel(task);
        }
    }
}

export default RootSaga;
