import { colorScheme as colorSchemeNW } from 'nativewind';
import React from 'react';
import { useColorScheme, View } from 'react-native';

import { ToastProvider } from '../toast/toast-provider';

import { config } from './config';

import type { ColorSchemeName, ViewProps } from 'react-native';

type ModeType = 'light' | 'dark' | 'system';

const getColorSchemeName = (colorScheme: ColorSchemeName, mode: ModeType): 'light' | 'dark' => {
    if (mode === 'system') {
        // ColorSchemeName widens to 'unspecified'/null; collapse anything non-dark to light.
        return colorScheme === 'dark' ? 'dark' : 'light';
    }
    return mode;
};

export function UIProvider({
    mode = 'light',
    ...props
}: {
    mode?: ModeType;
    children?: React.ReactNode;
    style?: ViewProps['style'];
}) {
    const colorScheme = useColorScheme();

    const colorSchemeName = getColorSchemeName(colorScheme, mode);

    colorSchemeNW.set(mode);

    return (
        <View style={[config[colorSchemeName], { flex: 1, height: '100%', width: '100%' }, props.style]}>
            <ToastProvider>{props.children}</ToastProvider>
        </View>
    );
}
