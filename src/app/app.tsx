/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import '../../global.css';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { UIProvider } from '../shared/ui';
import { KeyboardViewSpacer } from '../shared/ui/keyboard-space';

import type { RootStackParamList } from '@/app/navigation/types';

import RootNavigator from '@/app/navigation/root-navigator';
import RouteName from '@/app/navigation/route-name';
import { screenOptions } from '@/app/navigation/screen-options';
import LoginPage from '@/features/auth/ui/login-screen';
import MainPage from '@/features/home/ui/home-screen';

// The narrow path, not the `@/services` barrel: the barrel reaches the http client and the
// environment, neither of which this file needs.

const Stack = createStackNavigator<RootStackParamList>();

const AppStack = () => {
    return (
        <KeyboardViewSpacer>
            {/* Not a React ref read: navigationRef is React Navigation's own container ref
                object, created outside the tree so non-React callers can navigate. */}
            {/* eslint-disable-next-line react-hooks/refs */}
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
