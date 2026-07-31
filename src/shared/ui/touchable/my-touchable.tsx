import React from 'react';

import Touchable from '../touch';

import type { TouchableComponentProps } from '../touch';
import type { GestureResponderEvent } from 'react-native';

type MyTouchableProps = TouchableComponentProps & {
    throttleTime?: number;
};

const MyTouchable = ({ throttleTime = 500, ...props }: MyTouchableProps) => {
    const isButtonDisabledRef = React.useRef(false);

    // The useCallback here memoised on `[props, throttleTime]` — `props` is a rest object
    // rebuilt every render, so the callback was recreated every render anyway.
    const handleOnPress = (event: GestureResponderEvent) => {
        if (isButtonDisabledRef.current) return;

        isButtonDisabledRef.current = true;
        props.onPress?.(event);

        setTimeout(() => {
            isButtonDisabledRef.current = false;
        }, throttleTime);
    };

    return <Touchable {...props} onPress={handleOnPress} />;
};

export default MyTouchable;
