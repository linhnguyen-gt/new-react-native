import React from "react";
import { Keyboard, Pressable, TextInput } from "react-native";

import { Box, ScrollView, Text, VStack } from "@/components";

import { RootNavigator } from "@/services";

import { getColor } from "@/hooks";

import { RouteName } from "@/enums";

const RNLogo = () => (
    <Box width={80} height={80} backgroundColor="black" borderRadius={16} alignItems="center" justifyContent="center">
        <Text color="white" fontWeight="bold" fontSize={24}>
            RN
        </Text>
    </Box>
);

const Login = () => {
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");

    const handleLogin = React.useCallback(() => {
        Keyboard.dismiss();
        RootNavigator.navigate(RouteName.Main);
    }, []);

    return (
        <Box flex={1} safeArea>
            <ScrollView>
                <Box flex={1} backgroundColor="white" paddingHorizontal={16}>
                    <VStack alignItems="center" justifyContent="center" marginTop={20} marginBottom={12} space="sm">
                        <RNLogo />
                        <Text size="2xl" fontWeight="bold" marginTop={6}>
                            Welcome Back
                        </Text>
                        <Text fontSize={14} marginTop={2} color="gray">
                            Please sign in to your account
                        </Text>
                    </VStack>

                    <VStack space="lg" marginTop={6}>
                        <Box className="bg-gray-50 rounded-xl px-4 py-4 border border-gray-100">
                            <TextInput
                                placeholder="Email"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                className="text-gray-800 text-base"
                                placeholderTextColor="#9CA3AF"
                            />
                        </Box>

                        <Box className="bg-gray-50 rounded-xl px-4 py-4 border border-gray-100">
                            <TextInput
                                placeholder="Password"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                className="text-gray-800 text-base"
                                placeholderTextColor="#9CA3AF"
                            />
                        </Box>

                        <Text fontSize={14} color={getColor("primary.600")} fontWeight="medium" textAlign="right">
                            Forgot Password?
                        </Text>

                        <Pressable
                            onPress={handleLogin}
                            className="bg-primary-600 rounded-xl py-4 items-center mt-4 shadow-sm">
                            <Text fontWeight="bold" size="lg" color="white">
                                Sign In
                            </Text>
                        </Pressable>
                    </VStack>
                </Box>
            </ScrollView>
        </Box>
    );
};

export default Login;
