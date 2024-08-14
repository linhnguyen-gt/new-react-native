import React from "react";
import { useDispatch } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";

type ActionCreator<P = void | undefined, T extends string = string> = (payload?: P) => {
    type: T;
    payload?: P;
};

const useActions = <P, T extends string>(actions: ActionCreator<P, T>): ActionCreator<P, T> => {
    const dispatch = useDispatch<Dispatch>();
    return React.useMemo<ActionCreator<P, T>>(
        () => bindActionCreators(actions, dispatch),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );
};

export default useActions;
