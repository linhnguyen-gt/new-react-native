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

import { actions, selectors } from "@/redux";

import { useActions } from "@/hooks";

import { Loading } from "@/component";
import { config } from "@/config/gluestack-ui.config";

function App(): React.JSX.Element {
    const increment = useActions(actions.CountActions.increment);
    const decrement = useActions(actions.CountActions.decrement);

    const count = useSelector(selectors.CountSelectors.count);
    const isLoading = useSelector(selectors.LoadingSelectors.isLoading);

    const isDarkMode = useColorScheme() === "dark";

    const backgroundStyle = {
        backgroundColor: isDarkMode ? Colors.darker : Colors.lighter
    };

    const isLoadingPage = React.useMemo(
        () => isLoading[actions.CountActions.increment.type] || isLoading[actions.CountActions.decrement.type],
        [isLoading]
    );

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
                        <Text style={{ fontSize: 24, marginBottom: 20 }}>Counter: {count}</Text>
                        <View style={{ flexDirection: "row", width: 200, justifyContent: "space-around" }}>
                            <Button title="Increment" onPress={() => increment()} />
                            <Button title="Decrement" onPress={() => decrement()} />
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
            <Loading isLoading={isLoadingPage} />
        </GluestackUIProvider>
    );
}

export default App;
