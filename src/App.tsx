/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

import { RootNavigator } from "@/services";

import { screenOptions } from "@/helper";

import "../global.css";

import { KeyboardViewSpacer } from "./components/keyboardSpace";
import { GluestackUIProvider } from "./components/ui";
import { RouteName } from "./constants";
import { LoginPage, MainPage } from "./screens";

const Stack = createStackNavigator<RootStackParamList>();

const AppStack = () => {
    return (
        <KeyboardViewSpacer>
            <NavigationContainer ref={RootNavigator.navigationRef}>
                <Stack.Navigator screenOptions={screenOptions} initialRouteName={RouteName.Login}>
                    <Stack.Screen name={RouteName.Login} component={LoginPage} />
                    <Stack.Screen name={RouteName.Main} component={MainPage} />
                </Stack.Navigator>
            </NavigationContainer>
        </KeyboardViewSpacer>
    );
};

const App = () => {
    return (
        <GluestackUIProvider>
            <AppStack />
        </GluestackUIProvider>
    );
};

export default App;
