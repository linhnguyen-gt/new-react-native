import React from "react";
import { Provider } from "react-redux";

import App from "@/App";
import { ConfigStore } from "@/store";

const Root = () => (
    <Provider store={ConfigStore.store}>
        <App />
    </Provider>
);

export default Root;
