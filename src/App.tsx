/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { GluestackUIProvider } from "@gluestack-ui/themed";
import React from "react";
import { Button, SafeAreaView, ScrollView, StatusBar, Text, useColorScheme, View } from "react-native";
import { Colors, Header } from "react-native/Libraries/NewAppScreen";
import { useSelector } from "react-redux";

import { Loading } from "@/components";

import { actions, selectors } from "@/redux";

import { useActions, useLoading } from "@/hooks";

import { config } from "@/config/gluestack-ui.config";

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
        <GluestackUIProvider config={config}>
            <SafeAreaView style={backgroundStyle}>
                <StatusBar
                    barStyle={isDarkMode ? "light-content" : "dark-content"}
                    backgroundColor={backgroundStyle.backgroundColor}
                />
                <ScrollView contentInsetAdjustmentBehavior="automatic" style={backgroundStyle}>
                    <Header />
                    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                        <Text style={{ fontSize: 24, marginBottom: 20 }}>Response: {response.length}</Text>
                        <Text style={{ fontSize: 24, marginBottom: 20 }}>Counter: {count}</Text>
                        <View style={{ flexDirection: "row", width: 200, justifyContent: "space-around" }}>
                            <Button title="Increment" onPress={() => increment()} />
                            <Button title="Decrement" onPress={() => decrement()} />
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
            <Loading isLoading={isLoading} />
        </GluestackUIProvider>
    );
}

export default App;
