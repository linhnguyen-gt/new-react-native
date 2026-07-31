import React from 'react';
import { Button, StatusBar, useColorScheme } from 'react-native';
import { useSelector } from 'react-redux';

import * as CountActions from '@/features/count/model/count-actions';
import * as CountSelectors from '@/features/count/model/count-selectors';
import * as ResponseActions from '@/features/response/model/response-actions';
import * as ResponseSelectors from '@/features/response/model/response-selectors';
import { environment } from '@/shared/config/environment';
import useActions from '@/shared/lib/hooks/use-actions';
import useLoading from '@/shared/lib/hooks/use-loading';
import { Box, HStack, ScrollView, Text, VStack } from '@/shared/ui';
import { Loading } from '@/shared/ui/loading';

// Module scope so the arguments are reference-stable: an array literal in the render body is a
// new value every pass, which defeats the memoisation in `useActions` and in `useSelector`.
const LOADING_TYPES = [CountActions.increment.type, CountActions.decrement.type, ResponseActions.getResponse.type];

// The object form rather than the array form: destructuring an array of bound creators types
// each element as possibly undefined, and there is nothing to check at runtime.
const COUNT_ACTIONS = { increment: CountActions.increment, decrement: CountActions.decrement };

const MainPage = () => {
    const isLoading = useLoading(LOADING_TYPES);

    const { increment, decrement } = useActions(COUNT_ACTIONS);

    const getResponse = useActions(ResponseActions.getResponse);

    const count = useSelector(CountSelectors.count);
    const response = useSelector(ResponseSelectors.response);
    const responseError = useSelector(ResponseSelectors.responseError);
    const isDarkMode = useColorScheme() === 'dark';

    const backgroundStyle = {
        backgroundColor: isDarkMode ? '#0c0c0c' : '#f2f2f2',
    };

    React.useEffect(() => {
        getResponse();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Box flex={1}>
            <StatusBar
                barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                backgroundColor={backgroundStyle.backgroundColor}
            />
            <ScrollView contentInsetAdjustmentBehavior="automatic" backgroundColor={backgroundStyle.backgroundColor}>
                <VStack space="sm" alignItems="center">
                    <Text size="2xl" fontWeight="bold">
                        App Name: {environment.appName}
                    </Text>
                    <Text size="2xl" fontWeight="bold">
                        Environment: {environment.appFlavor}
                    </Text>
                    <Text size="2xl" fontWeight="bold">
                        Response: {response?.length}
                    </Text>
                    {responseError ? (
                        <Text size="sm" color="red" textAlign="center" testID="response-error">
                            {responseError}
                        </Text>
                    ) : null}
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
