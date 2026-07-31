import React from 'react';
import { Animated, TextInput } from 'react-native';

import { Box, HStack, IconComponent, Text, VStack } from '..';
import { MyTouchable } from '../touchable';

import useShakeView from './use-input';

import type { TextInputProps } from 'react-native';

import { getColor } from '@/shared/lib/hooks/use-theme-color';

export type InputProps = TextInputProps & {
    prefixIcon?: React.ReactNode;
    suffixIcon?: React.ReactNode;
    onChangeFocus?: (name: string, isFocus: boolean) => void;
    isPassword?: boolean;
    enable?: boolean;
    title?: string;
    error?: string | boolean;
    isLoading?: boolean;
    height?: number;
    testID?: string;
};

const Input = ({
    ref,
    placeholder,
    prefixIcon,
    suffixIcon,
    isPassword,
    enable = true,
    height = 50,
    title,
    error,
    testID,
    ...rest
}: InputProps & { ref?: React.Ref<TextInput> }) => {
    const shake = useShakeView(error);

    const [isShowPassword, setIsShowPassword] = React.useState<boolean>(!!isPassword);

    // No useCallback/useMemo here. The `_renderInput` memo listed `rest` — a rest object
    // rebuilt on every render — so it recomputed every render regardless; the compiler does
    // the memoisation properly and without the twelve-entry dependency array.
    const handleSecure = () => {
        setIsShowPassword(!isShowPassword);
    };

    const renderShowPassword = (
        <MyTouchable onPress={handleSecure}>
            <IconComponent font="entypo" name={isShowPassword ? 'eye-with-line' : 'eye'} size={16} />
        </MyTouchable>
    );

    const renderInput = (
        <HStack
            style={{ height }}
            className={`w-full items-center rounded-2xl border ${!enable && 'bg-inputDisable'} border-2 px-5 ${error ? 'border-red' : 'border-gray-100'} `}>
            <HStack className="h-full flex-1 items-center" space="md">
                {prefixIcon}
                <TextInput
                    testID={testID}
                    ref={ref}
                    {...rest}
                    className="font-body mt-1 h-full w-full font-semibold"
                    style={{ textAlignVertical: 'top' }}
                    placeholder={placeholder}
                    secureTextEntry={isShowPassword}
                    editable={enable}
                    placeholderTextColor={getColor('typography-500')}
                />
            </HStack>
            <Box className="pl-3">{suffixIcon ?? (isPassword && renderShowPassword)}</Box>
        </HStack>
    );

    return (
        <VStack space="sm">
            {title && <Text className="text-blackLight/70 font-mono">{title}</Text>}
            <VStack space="xs">
                <Animated.View style={shake}>{renderInput}</Animated.View>
                {!!error && (
                    <Box>
                        <Text testID={`${testID}-error`} className="text-sm text-red">
                            {error}
                        </Text>
                    </Box>
                )}
            </VStack>
        </VStack>
    );
};

export default Input;

declare global {
    export type TypeInput = 'dropdown' | 'search' | 'phone' | 'date' | 'otp';
}
