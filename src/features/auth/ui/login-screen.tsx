import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { useForm } from 'react-hook-form';
import { Keyboard } from 'react-native';
import { z } from 'zod';

import RouteName from '@/app/navigation/route-name';
import { environment } from '@/shared/config/environment';
import Errors from '@/shared/constants/errors';
import { getColor } from '@/shared/lib/hooks/use-theme-color';
import Logger from '@/shared/lib/logger';
import { Box, ScrollView, Text, VStack } from '@/shared/ui';
import { ControlledInput } from '@/shared/ui/input';
import { MyTouchable } from '@/shared/ui/touchable';

const RNLogo = () => (
    <Box width={80} height={80} backgroundColor="black" borderRadius={16} alignItems="center" justifyContent="center">
        <Text color="white" fontWeight="bold" fontSize={24}>
            RN
        </Text>
    </Box>
);

const loginSchema = z.object({
    // No TLD restriction: the previous `.endsWith('.com')` refine rejected every .org, .vn
    // and .co.uk address, which z.email() already accepts as valid.
    email: z.string().min(1, Errors.REQUIRED_EMAIL_INPUT).pipe(z.email(Errors.EMAIL_INVALID)),
    password: z.string().min(1, Errors.REQUIRED_PASSWORD_INPUT),
});

/** Dev-only: shipping these in a release put a working credential inside the bundle. */
const DEV_DEFAULTS = { email: 'test@test.com', password: '123456' };

const EMPTY_DEFAULTS = { email: '', password: '' };

const Login = () => {
    // The hook, not RootNavigator: this screen is inside the tree, so it does not need the
    // module singleton — that exists for callers React cannot reach.
    const navigation = useNavigation();

    const { control, handleSubmit } = useForm({
        defaultValues: __DEV__ ? DEV_DEFAULTS : EMPTY_DEFAULTS,
        resolver: zodResolver(loginSchema),
    });

    const handleLogin = () => {
        Keyboard.dismiss();
        handleSubmit((values) => {
            // TODO: call the login endpoint with `values` and set the session through
            // TokenService.setSession before navigating.
            Logger.info('Login', `submitting for ${values.email}`);
            // reset, not navigate: the login screen must not stay on the back stack.
            navigation.reset({ index: 0, routes: [{ name: RouteName.Main }] });
        })();
    };

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
