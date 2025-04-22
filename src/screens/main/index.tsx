import React from "react";
import { Button, StatusBar, useColorScheme } from "react-native";
import { Colors, Header } from "react-native/Libraries/NewAppScreen";
import { useSelector } from "react-redux";

import { environment } from "@/services";

import { useActions, useLoading } from "@/hooks";

import { Loading } from "@/components/loading";
import { Box, HStack, ScrollView, Text, VStack } from "@/components/ui";
import { CountActions, ResponseActions } from "@/redux/actions";
import { CountSelectors, ResponseSelectors } from "@/redux/selectors";

const MainPage = () => {
    const isLoading = useLoading([
        CountActions.increment.type,
        CountActions.decrement.type,
        ResponseActions.getResponse.type
    ]);

    const { increment, decrement } = useActions({
        increment: CountActions.increment,
        decrement: CountActions.decrement
    });

    const getResponse = useActions(ResponseActions.getResponse);

    const count = useSelector(CountSelectors.count);
    const response = useSelector(ResponseSelectors.response);
    const isDarkMode = useColorScheme() === "dark";

    const backgroundStyle = {
        backgroundColor: isDarkMode ? Colors.darker : Colors.lighter
    };

    React.useEffect(() => {
        getResponse();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Box flex={1}>
            <StatusBar
                barStyle={isDarkMode ? "light-content" : "dark-content"}
                backgroundColor={backgroundStyle.backgroundColor}
            />
            <ScrollView
                contentInsetAdjustmentBehavior="automatic"
                backgroundColor={isDarkMode ? Colors.darker : Colors.lighter}>
                <Header />

                <VStack space="sm" alignItems="center">
                    <Text size="2xl" fontWeight="bold">
                        Environment: {environment.appFlavor}
                    </Text>
                    <Text size="2xl" fontWeight="bold">
                        Response: {response?.length}
                    </Text>
                    <Text size="lg" color="gray" fontWeight="bold">
                        Counter: {count}
                    </Text>
                    <HStack space="lg">
                        <Button title="Increment" onPress={() => increment()} />
                        <Button title="Decrement" onPress={() => decrement()} />
                    </HStack>
                </VStack>
            </ScrollView>
            <Loading isLoading={isLoading} />
        </Box>
    );
};

export default MainPage;
