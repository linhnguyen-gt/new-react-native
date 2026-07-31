import type { HttpResponse } from '@/services';

import { ResponseActions } from '../../actions';
import { startLoading, stopLoading } from '../../reducers';
import { getResponse } from '../response-sagas';

jest.mock('@/apis', () => ({
    ResponseApi: { responseApi: jest.fn() },
}));

const ACTION_TYPE = ResponseActions.getResponse.type;

/**
 * Steps the generator by hand rather than pulling in redux-saga-test-plan. The saga yields:
 *   1. put(startLoading)
 *   2. the responseApi() promise   <- we feed the result back in
 *   3. put(setResponse) or put(setResponseError)
 *   4. put(stopLoading)
 */
const runWith = (result: HttpResponse<ResponseData[]>) => {
    const generator = getResponse();
    const yielded = [generator.next().value];

    generator.next(); // consumes the responseApi() call
    yielded.push(generator.next(result).value);
    yielded.push(generator.next().value);

    // A redux-saga `put` effect wraps the action at payload.action.
    return yielded.map((effect) => (effect as { payload: { action: unknown } }).payload.action);
};

describe('getResponse saga', () => {
    it('brackets the call with loading start/stop', () => {
        const yielded = runWith({ ok: true, data: [], status: 200 });

        expect(yielded[0]).toEqual(startLoading(ACTION_TYPE));
        expect(yielded[2]).toEqual(stopLoading(ACTION_TYPE));
    });

    it('stores the payload on success', () => {
        const data = [{ State: 'CA' }] as unknown as ResponseData[];

        const yielded = runWith({ ok: true, data, status: 200 });

        expect(yielded[1]).toEqual(ResponseActions.setResponse(data));
    });

    // The regression: a failed request used to dispatch nothing at all, so the screen could not
    // tell "empty" from "the server returned 500".
    it('stores an error message on failure', () => {
        const yielded = runWith({
            ok: false,
            status: 500,
            error: { kind: 'server', message: 'Something went wrong on our side. Try again shortly.', status: 500 },
        });

        expect(yielded[1]).toEqual(
            ResponseActions.setResponseError('Something went wrong on our side. Try again shortly.')
        );
    });
});
