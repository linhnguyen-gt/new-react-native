import React from 'react';
import { ScrollView, Text, View } from 'react-native';

type BootstrapErrorScreenProps = {
    error: Error;
};

/**
 * What the app shows when it cannot start.
 *
 * A bad `.env` used to throw while the module graph was still loading — before React mounted, so
 * there was no boundary to catch it and nothing in the logs. The result was a white screen. The
 * messages rendered here name configuration keys, never their values; see `environment.ts`.
 */
function BootstrapErrorScreen({ error }: BootstrapErrorScreenProps) {
    return (
        <View className="flex-1 justify-center bg-white px-6 py-12">
            <Text className="text-red-700 mb-3 text-xl font-bold">The app could not start</Text>
            <Text className="mb-4 text-base text-gray-700">
                This is a configuration or bootstrap failure, not a network problem. The details below come from the app
                config.
            </Text>
            <ScrollView className="max-h-64 rounded-md bg-gray-100 p-4">
                <Text className="font-mono text-sm text-gray-900">{error.message}</Text>
            </ScrollView>
        </View>
    );
}

export default BootstrapErrorScreen;
