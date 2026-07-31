import { cancel, take } from 'redux-saga/effects';

import { ActionTypes } from '@/constants';

import RootSaga from '../RootSaga';

describe('RootSaga', () => {
    it('cancels the running watchers on RESET_STATE and forks them again', () => {
        const saga = RootSaga.saga();

        const firstFork = saga.next().value;
        expect(firstFork).toMatchObject({ type: 'FORK', payload: { fn: expect.any(Function) } });

        // Nothing used to cancel in-flight tasks on reset, so a request issued under the previous
        // session finished afterwards and wrote into the freshly reset store.
        expect(saga.next({ id: 1 } as never).value).toEqual(take(ActionTypes.RESET_STATE));
        expect(saga.next().value).toEqual(cancel({ id: 1 } as never));

        expect(saga.next().value).toMatchObject({ type: 'FORK', payload: { fn: expect.any(Function) } });
    });
});
