import { CallEffect, put, PutEffect, SelectEffect } from "redux-saga/effects";

import { ActionTypes } from "@/constants";

import { startLoading, stopLoading } from "../reducers";

type Saga = (...args: any[]) => Generator<CallEffect | PutEffect | SelectEffect, void, any>;

export function* handleApiCall(actionType: ActionTypes, apiSaga: Saga, ...args: any[]): Generator {
    try {
        yield put(startLoading(actionType));
        yield* apiSaga(...args);
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        yield put(stopLoading(actionType));
    }
}
