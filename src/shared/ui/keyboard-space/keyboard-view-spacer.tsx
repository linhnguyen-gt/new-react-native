import * as React from 'react';
import { Animated, Keyboard, Platform } from 'react-native';

import type { KeyboardEvent } from 'react-native';

type KeyboardViewSpacerProps = {
    children: Array<React.ReactNode> | React.ReactNode;
};

/**
 * `keyboardWillShow` / `keyboardWillHide` are iOS-only. This component subscribed to them
 * unconditionally while wrapping the whole navigation tree, so every Android input in the app
 * had zero keyboard avoidance — invisible in CI because the file had no tests.
 */
const keyboardEvents = () =>
    Platform.OS === 'ios'
        ? (['keyboardWillShow', 'keyboardWillHide'] as const)
        : (['keyboardDidShow', 'keyboardDidHide'] as const);

/** Android's `did*` events carry no duration; 250ms matches the platform's own transition. */
const FALLBACK_DURATION = 250;

/** iOS reports a height that includes an area the layout already accounts for. */
const IOS_HEIGHT_OFFSET = 25;

function KeyboardViewSpacer({ children }: KeyboardViewSpacerProps) {
    // Not a ref: reading `.current` during render makes the React Compiler bail out of the
    // whole component. A lazy useState initialiser gives the same one-per-mount instance.
    const [keyboardHeight] = React.useState(() => new Animated.Value(0));

    // Everything the subscription needs lives inside the effect. Defined outside, each
    // function would be a new value on every render and the listeners would be torn down and
    // re-added continuously — the React Compiler memoises renders, not effect dependencies.
    React.useEffect(() => {
        const animateTo = (toValue: number, duration: number) => {
            Animated.timing(keyboardHeight, {
                duration,
                toValue,
                // paddingBottom is not native-drivable. This used to be a public prop, so a
                // caller passing `true` broke the animation outright.
                useNativeDriver: false,
            }).start();
        };

        const onKeyboardShow = (event: KeyboardEvent) => {
            const height = event.endCoordinates.height - (Platform.OS === 'ios' ? IOS_HEIGHT_OFFSET : 0);
            animateTo(height, event.duration ?? FALLBACK_DURATION);
        };

        const onKeyboardHide = (event: KeyboardEvent) => {
            animateTo(0, event.duration ?? FALLBACK_DURATION);
        };

        const [showEvent, hideEvent] = keyboardEvents();
        const showListener = Keyboard.addListener(showEvent, onKeyboardShow);
        const hideListener = Keyboard.addListener(hideEvent, onKeyboardHide);

        return () => {
            showListener.remove();
            hideListener.remove();
        };
    }, [keyboardHeight]);

    return <Animated.View style={{ paddingBottom: keyboardHeight, flex: 1 }}>{children}</Animated.View>;
}

export default KeyboardViewSpacer;
