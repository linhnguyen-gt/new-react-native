import { put } from 'redux-saga/effects';

import { startLoading, stopLoading } from '../reducers';

import type { Action } from '@reduxjs/toolkit';
import type { Effect } from 'redux-saga/effects';

import Logger from '@/helper/logger';

type EffectType = Effect | Promise<any>;
type SagaGenerator = Generator<EffectType, any, any>;
type SagaFunction = (...args: unknown[]) => SagaGenerator;

type LoadingOptions = {
    isLoading?: boolean;
    /**
     * Dispatched when the wrapped saga throws. Without it a thrown error is logged and
     * forgotten, which is how every failure in this app used to become invisible.
     */
    onFailure?: (message: string) => Action;
};

function isLoadingOptions(obj: unknown): obj is LoadingOptions {
    return typeof obj === 'object' && obj !== null && !('type' in obj);
}

export function* handleApiCall(
    optionsOrActionType: LoadingOptions | string,
    actionTypeOrSaga: string | SagaFunction,
    apiSaga?: SagaFunction,
    ...args: unknown[]
): Generator {
    const options = isLoadingOptions(optionsOrActionType) ? optionsOrActionType : {};
    const actionType = isLoadingOptions(optionsOrActionType)
        ? (actionTypeOrSaga as string)
        : (optionsOrActionType as string);
    const saga = isLoadingOptions(optionsOrActionType) ? apiSaga! : (actionTypeOrSaga as SagaFunction);

    const isLoading = options.isLoading ?? true;

    try {
        if (isLoading) {
            yield put(startLoading(actionType));
        }
        yield* saga(...args);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        Logger.error(actionType, message);
        if (options.onFailure) {
            yield put(options.onFailure(message));
        }
    } finally {
        if (isLoading) {
            yield put(stopLoading(actionType));
        }
    }
}
