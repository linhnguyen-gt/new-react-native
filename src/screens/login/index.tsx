import React, { useState } from "react";
import { Keyboard, Pressable, TextInput } from "react-native";

import { Box, Text, VStack } from "@/components";

import { RootNavigator } from "@/services";

import { RouteName } from "@/enums";

const RNLogo = () => (
    <Box className="w-20 h-20 bg-primary-600 rounded-2xl items-center justify-center">
        <Text className="text-white font-bold text-3xl">RN</Text>
    </Box>
);

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = () => {
        Keyboard.dismiss();
        RootNavigator.navigate(RouteName.Main);
    };

    return (
        <Box className="flex-1">
            <Box className="flex-1 bg-white px-6">
                <Box className="items-center justify-center mt-20 mb-12">
                    <RNLogo />
                    <Text size="2xl" className="font-bold mt-6 text-gray-800">
                        Welcome Back
                    </Text>
                    <Text className="text-gray-500 mt-2">Please sign in to your account</Text>
                </Box>

                <VStack space="lg" className="mt-6">
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

                    <Text className="text-right text-primary-600 font-medium">Forgot Password?</Text>

                    <Pressable
                        onPress={handleLogin}
                        className="bg-primary-600 rounded-xl py-4 items-center mt-4 shadow-sm">
                        <Text className="text-white font-bold text-lg">Sign In</Text>
                    </Pressable>
                </VStack>
            </Box>
        </Box>
    );
};

export default Login;
