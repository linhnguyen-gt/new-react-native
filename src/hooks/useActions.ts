import { ActionCreatorWithPayload, PayloadAction } from '@reduxjs/toolkit';
import React from 'react';
import { useDispatch } from 'react-redux';
import { Dispatch } from 'redux';

type BoundActionCreator<TPayload> = {
    (payload: TPayload): PayloadAction<TPayload>;
    (): PayloadAction<undefined>;
};

type ActionCreatorMap<TActionMap> = {
    [K in keyof TActionMap]: TActionMap[K] extends ActionCreatorWithPayload<infer TPayload, any>
        ? BoundActionCreator<TPayload>
        : never;
};

/**
 * Custom hook to bind action creators with dispatch
 * @param actions Single action creator, object containing multiple action creators, or array of action creators
 * @returns Bound action creator(s)
 */
function useActions<TPayload>(actionCreator: ActionCreatorWithPayload<TPayload, string>): BoundActionCreator<TPayload>;
function useActions<TActionMap extends Record<string, ActionCreatorWithPayload<any, string>>>(
    actionCreators: TActionMap
): ActionCreatorMap<TActionMap>;
function useActions<TPayload>(
    actionCreators: Array<ActionCreatorWithPayload<TPayload, string>>
): Array<BoundActionCreator<TPayload>>;
function useActions<TPayload, TActionMap extends Record<string, ActionCreatorWithPayload<any, string>>>(
    actionCreator:
        | ActionCreatorWithPayload<TPayload, string>
        | TActionMap
        | Array<ActionCreatorWithPayload<TPayload, string>>
): BoundActionCreator<TPayload> | ActionCreatorMap<TActionMap> | Array<BoundActionCreator<TPayload>> {
    const dispatch = useDispatch<Dispatch>();

    return React.useMemo(() => {
        // Case 1: Single action creator
        if (typeof actionCreator === 'function') {
            const boundActionCreator = function (this: void, payload?: TPayload) {
                return dispatch(actionCreator(payload as TPayload));
            } as BoundActionCreator<TPayload>;
            return boundActionCreator;
        }

        // Case 2: Array of action creators
        if (Array.isArray(actionCreator)) {
            return actionCreator.map((action) => {
                return function (this: void, payload?: TPayload) {
                    return dispatch(action(payload as TPayload));
                } as BoundActionCreator<TPayload>;
            });
        }

        // Case 3: Object map of action creators
        type ActionMap = {
            [K in keyof TActionMap]: TActionMap[K] extends ActionCreatorWithPayload<infer ActionPayload, any>
                ? BoundActionCreator<ActionPayload>
                : never;
        };

        const boundActionCreators = {} as ActionMap;

        for (const key in actionCreator) {
            const action = actionCreator[key];
            boundActionCreators[key] = function (this: void, payload?: TPayload) {
                return dispatch(action(payload));
            } as TActionMap[typeof key] extends ActionCreatorWithPayload<infer ActionPayload, any>
                ? BoundActionCreator<ActionPayload>
                : never;
        }

        return boundActionCreators;
    }, [actionCreator, dispatch]);
}

export default useActions;
