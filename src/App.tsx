/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import '../global.css';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { screenOptions } from '@/helper';

import { KeyboardViewSpacer } from './components/keyboardSpace';
import { UIProvider } from './components/ui';
import { RouteName } from './constants';
import { LoginPage, MainPage } from './screens';

// The narrow path, not the `@/services` barrel: the barrel reaches the http client and the
// environment, neither of which this file needs.
import type { RootStackParamList } from '@/services/navigation';

import { RootNavigator } from '@/services/navigation';

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
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <UIProvider>
                    <AppStack />
                </UIProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
};

export default App;
