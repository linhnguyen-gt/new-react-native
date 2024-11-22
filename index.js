/**
 * @format
 */

import { AppRegistry } from "react-native";

import { name as appName } from "./app.json";
import "./gesture-handler";
import Root from "./src/Root";

AppRegistry.registerComponent(appName, () => Root);
