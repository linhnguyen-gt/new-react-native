/**
 * @format
 */

import { AppRegistry } from "react-native";
import { Provider } from "react-redux";

import { name as appName } from "./app.json";
import App from "./src/App";

import { ConfigStore } from "@/store";

const Root = () => (
    // eslint-disable-next-line react/jsx-filename-extension,react/react-in-jsx-scope
    <Provider store={ConfigStore.store}>
        {/* eslint-disable-next-line react/react-in-jsx-scope */}
        <App />
    </Provider>
);

AppRegistry.registerComponent(appName, () => Root);
