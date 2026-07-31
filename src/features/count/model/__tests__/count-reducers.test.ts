import CountReducers from '../count-reducers';

import * as CountActions from '@/features/count/model/count-actions';

const initial = { count: 0 };

describe('CountReducers', () => {
    it('derives the next count from the current one', () => {
        // The regression lived in the saga: it selected the count, added one and dispatched the
        // result, so two taps inside its 1s delay both read 0 and the second write lost the first.
        // Only the reducer computes count from count now, and reducers do not interleave.
        const twice = [CountActions.setIncrement(), CountActions.setIncrement()].reduce(
            (state, action) => CountReducers(state, action),
            initial
        );

        expect(twice).toEqual({ count: 2 });
    });

    it('decrements', () => {
        expect(CountReducers({ count: 3 }, CountActions.setDecrement())).toEqual({ count: 2 });
    });

    it('cannot produce NaN from a reset state', () => {
        // `Count` used to include `undefined`, which made `undefined + 1` reachable after a reset.
        const afterReset = CountReducers(undefined, { type: 'unknown' });

        expect(CountReducers(afterReset, CountActions.setIncrement())).toEqual({ count: 1 });
    });
});
