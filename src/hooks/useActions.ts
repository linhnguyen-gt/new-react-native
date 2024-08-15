import { PayloadActionCreator } from "@reduxjs/toolkit";
import React from "react";
import { useDispatch } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";

const useActions = <P, T extends string>(actions: PayloadActionCreator<P, T>): PayloadActionCreator<P, T> => {
    const dispatch = useDispatch<Dispatch>();
    return React.useMemo<PayloadActionCreator<P, T>>(
        () => bindActionCreators(actions, dispatch),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );
};

export default useActions;
