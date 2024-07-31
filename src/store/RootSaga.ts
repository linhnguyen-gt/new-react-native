import { all } from "redux-saga/effects";

class RootSaga {
    static *saga() {
        yield all([]);
    }
}

export default RootSaga;
