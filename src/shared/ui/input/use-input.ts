import React from 'react';
import { Animated } from 'react-native';

function useShakeView(error?: string | boolean | undefined) {
    // Not a ref: the returned transform read `.current` during render, which makes the React
    // Compiler bail out of every component using this hook. A lazy useState initialiser gives
    // the same one-per-mount instance without a render-time ref read.
    const [anim] = React.useState(() => new Animated.Value(0));

    const shake = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(anim, {
                    toValue: -2,
                    duration: 10,
                    useNativeDriver: true,
                }),
                Animated.timing(anim, {
                    toValue: 2,
                    duration: 10,
                    useNativeDriver: true,
                }),
                Animated.timing(anim, {
                    toValue: 0,
                    duration: 10,
                    useNativeDriver: true,
                }),
            ]),
            { iterations: 2 }
        ).start();
    };

    React.useEffect(() => {
        if (error) {
            shake();
        }
        // The shake is a reaction to `error` changing, not to `shake` being recreated; the
        // compiler memoises the callback but the effect must still key on the error alone.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [error]);

    return { transform: [{ translateX: anim }] };
}

export default useShakeView;
