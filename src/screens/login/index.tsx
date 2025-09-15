import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';
import { Keyboard } from 'react-native';
import { z } from 'zod';

import { Errors, RouteName } from '@/constants';

import { environment, RootNavigator } from '@/services';

import { getColor } from '@/hooks';

import { ControlledInput } from '@/components/input';
import { MyTouchable } from '@/components/touchable';
import { Box, ScrollView, Text, VStack } from '@/components/ui';

const RNLogo = () => (
    <Box width={80} height={80} backgroundColor="black" borderRadius={16} alignItems="center" justifyContent="center">
        <Text color="white" fontWeight="bold" fontSize={24}>
            RN
        </Text>
    </Box>
);

const loginSchema = z.object({
    email: z
        .string()
        .min(1, Errors.REQUIRED_EMAIL_INPUT)
        .pipe(z.email(Errors.EMAIL_INVALID))
        .refine((value) => value.endsWith('.com'), {
            message: Errors.IS_NOT_EMAIL,
        }),
    password: z.string().min(1, Errors.REQUIRED_PASSWORD_INPUT),
});

const Login = () => {
    const { control, handleSubmit } = useForm({
        defaultValues: {
            email: 'test@test.com',
            password: '123456',
        },
        resolver: zodResolver(loginSchema),
    });

    const handleLogin = React.useCallback(() => {
        Keyboard.dismiss();
        handleSubmit((_values) => {
            RootNavigator.replaceName(RouteName.Main);
        })();
    }, [handleSubmit]);

    return (
        <Box flex={1} safeArea>
            <ScrollView>
                <Box flex={1} backgroundColor="white" paddingHorizontal={16}>
                    <VStack alignItems="center" justifyContent="center" marginTop={20} marginBottom={12} space="sm">
                        <RNLogo />
                        <Text size="2xl" fontWeight="bold" marginTop={6}>
                            Welcome Back {environment.appFlavor}
                        </Text>
                        <Text fontSize={14} marginTop={2} color="gray">
                            Please sign in to your account
                        </Text>
                    </VStack>

                    <VStack space="lg" marginTop={6}>
                        <ControlledInput
                            control={control}
                            name="email"
                            placeholder="Email"
                            shouldUseFieldError={true}
                            testID="email-input"
                        />

                        <ControlledInput
                            control={control}
                            name="password"
                            placeholder="Password"
                            isPassword
                            shouldUseFieldError={true}
                            testID="password-input"
                        />

                        <Text fontSize={14} color={getColor('primary.600')} fontWeight="medium" textAlign="right">
                            Forgot Password?
                        </Text>

                        <MyTouchable
                            onPress={handleLogin}
                            className="mt-4 items-center rounded-xl bg-primary-600 py-4 shadow-sm"
                            testID="login-button">
                            <Text fontWeight="bold" size="lg" color="white">
                                Sign In
                            </Text>
                        </MyTouchable>
                    </VStack>
                </Box>
            </ScrollView>
        </Box>
    );
};

export default Login;
