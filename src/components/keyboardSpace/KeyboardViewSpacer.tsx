import * as React from 'react';
import { Animated, Keyboard, KeyboardEvent, Platform } from 'react-native';

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
    const keyboardHeight = React.useRef(new Animated.Value(0)).current;

    const animateTo = React.useCallback(
        (toValue: number, duration: number) => {
            Animated.timing(keyboardHeight, {
                duration,
                toValue,
                // paddingBottom is not native-drivable. This used to be a public prop, so a
                // caller passing `true` broke the animation outright.
                useNativeDriver: false,
            }).start();
        },
        [keyboardHeight]
    );

    const onKeyboardShow = React.useCallback(
        (event: KeyboardEvent) => {
            const height = event.endCoordinates.height - (Platform.OS === 'ios' ? IOS_HEIGHT_OFFSET : 0);
            animateTo(height, event.duration ?? FALLBACK_DURATION);
        },
        [animateTo]
    );

    const onKeyboardHide = React.useCallback(
        (event: KeyboardEvent) => {
            animateTo(0, event.duration ?? FALLBACK_DURATION);
        },
        [animateTo]
    );

    React.useEffect(() => {
        const [showEvent, hideEvent] = keyboardEvents();
        const showListener = Keyboard.addListener(showEvent, onKeyboardShow);
        const hideListener = Keyboard.addListener(hideEvent, onKeyboardHide);

        return () => {
            showListener.remove();
            hideListener.remove();
        };
    }, [onKeyboardHide, onKeyboardShow]);

    return <Animated.View style={{ paddingBottom: keyboardHeight, flex: 1 }}>{children}</Animated.View>;
}

export default React.memo(KeyboardViewSpacer);
