/**
 * @format
 */

import "react-native";
import { it } from "@jest/globals";
import React from "react";
import renderer from "react-test-renderer";

import App from "../src/App";

// Note: import explicitly to use the types shipped with jest.

// Note: test renderer must be required after react-native.

// eslint-disable-next-line jest/expect-expect
it("renders correctly", () => {
    renderer.create(<App />);
});
