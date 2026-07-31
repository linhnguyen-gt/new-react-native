import { runSaga, stdChannel } from 'redux-saga';
import { delay, put } from 'redux-saga/effects';

import { handleApiCall } from '../api-saga-helper';

import { startLoading } from '@/shared/store/loading/loading-reducers';
import { stopLoading } from '@/shared/store/loading/loading-reducers';

const runWith = (saga: () => Generator) => {
    const dispatched: { type: string; payload?: unknown }[] = [];

    const task = runSaga(
        {
            channel: stdChannel(),
            dispatch: (action: { type: string; payload?: unknown }) => dispatched.push(action),
            getState: () => ({}),
        },
        saga
    );

    return { dispatched, task };
};

describe('handleApiCall', () => {
    it('clears the loading key when the task is cancelled', async () => {
        // RESET_STATE cancels the root task mid-request. If the `finally` did not run, the type's
        // loading key would stay set and the spinner would never come down.
        const { dispatched, task } = runWith(function* () {
            yield* handleApiCall('FETCH', function* () {
                yield delay(10_000);
            });
        });

        expect(dispatched).toEqual([startLoading('FETCH')]);

        task.cancel();
        await task.toPromise();

        expect(dispatched).toEqual([startLoading('FETCH'), stopLoading('FETCH')]);
    });

    it('dispatches onFailure with the thrown message and still stops loading', async () => {
        const onFailure = (message: string) => ({ type: 'FETCH_FAILED', payload: message });

        const { dispatched, task } = runWith(function* () {
            yield* handleApiCall({ onFailure }, 'FETCH', function* () {
                yield delay(0);
                throw new Error('boom');
            });
        });

        await task.toPromise();

        expect(dispatched).toEqual([startLoading('FETCH'), onFailure('boom'), stopLoading('FETCH')]);
    });

    it('skips the loading actions when asked to', async () => {
        const { dispatched, task } = runWith(function* () {
            yield* handleApiCall({ isLoading: false }, 'FETCH', function* () {
                yield put({ type: 'INNER' });
            });
        });

        await task.toPromise();

        expect(dispatched).toEqual([{ type: 'INNER' }]);
    });
});
