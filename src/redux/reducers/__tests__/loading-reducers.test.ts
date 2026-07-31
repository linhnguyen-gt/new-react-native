import LoadingReducers, { startLoading, stopLoading } from '../LoadingReducers';

type LoadingAction = ReturnType<typeof startLoading> | ReturnType<typeof stopLoading>;

const reduce = (state: Record<string, number>, ...actions: LoadingAction[]) =>
    actions.reduce((acc, action) => LoadingReducers(acc, action), state);

describe('LoadingReducers', () => {
    it('stays loading until the last task of that type finishes', () => {
        // The regression: with a boolean, the first stopLoading hid the spinner while a second
        // task of the same type — routine under takeEvery — was still running.
        const twoInFlight = reduce({}, startLoading('FETCH'), startLoading('FETCH'));
        expect(twoInFlight).toEqual({ FETCH: 2 });

        const oneDone = reduce(twoInFlight, stopLoading('FETCH'));
        expect(oneDone).toEqual({ FETCH: 1 });
    });

    it('deletes the key rather than leaving a false behind', () => {
        // Keys were only ever set to false, so the map grew for the life of the app.
        const state = reduce({}, startLoading('FETCH'), stopLoading('FETCH'));

        expect(state).toEqual({});
    });

    it('never counts below zero on an unbalanced stop', () => {
        expect(reduce({}, stopLoading('FETCH'))).toEqual({});
    });

    it('tracks each action type independently', () => {
        const state = reduce({}, startLoading('FETCH'), startLoading('SAVE'), stopLoading('FETCH'));

        expect(state).toEqual({ SAVE: 1 });
    });
});
