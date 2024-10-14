/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from "react";
import { Button, SafeAreaView, ScrollView, StatusBar, useColorScheme } from "react-native";
import { Colors, Header } from "react-native/Libraries/NewAppScreen";
import { useSelector } from "react-redux";

import { GluestackUIProvider, HStack, Loading, Text, VStack } from "@/components";

import { actions, selectors } from "@/redux";
import Config from "react-native-config";

import { useActions, useLoading } from "@/hooks";

import "../global.css";

function App(): React.JSX.Element {
    const isLoading = useLoading([
        actions.CountActions.increment.type,
        actions.CountActions.decrement.type,
        actions.ResponseActions.getResponse.type
    ]);

    const increment = useActions(actions.CountActions.increment);
    const decrement = useActions(actions.CountActions.decrement);
    const getResponse = useActions(actions.ResponseActions.getResponse);

    const count = useSelector(selectors.CountSelectors.count);
    const response = useSelector(selectors.ResponseSelectors.response);

    const isDarkMode = useColorScheme() === "dark";

    const backgroundStyle = {
        backgroundColor: isDarkMode ? Colors.darker : Colors.lighter
    };

    React.useEffect(() => {
        getResponse();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <GluestackUIProvider>
            <SafeAreaView style={backgroundStyle}>
                <StatusBar
                    barStyle={isDarkMode ? "light-content" : "dark-content"}
                    backgroundColor={backgroundStyle.backgroundColor}
                />
                <ScrollView contentInsetAdjustmentBehavior="automatic" style={backgroundStyle}>
                    <Header />

                    <VStack space="sm" className="items-center">
                        <Text className="text-2xl font-bold">Environment: {Config.APP_FLAVOR}</Text>
                        <Text className="text-2xl font-bold">Response: {response.length}</Text>
                        <Text className="text-2xl">Counter: {count}</Text>
                        <HStack space="lg">
                            <Button title="Increment" onPress={() => increment()} />
                            <Button title="Decrement" onPress={() => decrement()} />
                        </HStack>
                    </VStack>
                </ScrollView>
            </SafeAreaView>
            <Loading isLoading={isLoading} />
        </GluestackUIProvider>
    );
}

export default App;
