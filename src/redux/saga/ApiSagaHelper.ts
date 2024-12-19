import { ActionPattern, CallEffect, put, PutEffect, SelectEffect } from "redux-saga/effects";

import { startLoading, stopLoading } from "../reducers";

type Saga = (
    ...args: any[]
) => Generator<
    CallEffect | PutEffect | SelectEffect | Promise<BaseResponse<Record<string, any>>> | Promise<void>,
    void,
    any
>;

type LoadingOptions = {
    isLoading?: boolean;
};

function isLoadingOptions(obj: any): obj is LoadingOptions {
    return typeof obj === "object" && !("type" in obj);
}

export function* handleApiCall(
    optionsOrActionType: LoadingOptions | ActionPattern,
    actionTypeOrSaga: ActionPattern | Saga,
    apiSaga?: Saga,
    ...args: any[]
): Generator {
    const options = isLoadingOptions(optionsOrActionType) ? optionsOrActionType : { isLoading: true };
    const actionType = isLoadingOptions(optionsOrActionType)
        ? (actionTypeOrSaga as ActionPattern)
        : (optionsOrActionType as ActionPattern);
    const saga = isLoadingOptions(optionsOrActionType) ? apiSaga! : (actionTypeOrSaga as Saga);

    const isLoading = options.isLoading ?? true;

    try {
        if (isLoading) {
            yield put(startLoading(actionType));
        }
        yield* saga(...args);
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        if (isLoading) {
            yield put(stopLoading(actionType));
        }
    }
}
