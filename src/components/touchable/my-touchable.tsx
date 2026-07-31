import React from 'react';

import Touchable from '../ui/touch';

import type { TouchableComponentProps } from '../ui/touch';
import type { GestureResponderEvent } from 'react-native';

type MyTouchableProps = TouchableComponentProps & {
    throttleTime?: number;
};

const MyTouchable: React.FC<MyTouchableProps> = ({ throttleTime = 500, ...props }) => {
    const isButtonDisabledRef = React.useRef(false);

    const handleOnPress = React.useCallback(
        (event: GestureResponderEvent) => {
            if (isButtonDisabledRef.current) return;

            isButtonDisabledRef.current = true;
            props.onPress?.(event);

            setTimeout(() => {
                isButtonDisabledRef.current = false;
            }, throttleTime);
        },
        [props, throttleTime]
    );

    return <Touchable {...props} onPress={handleOnPress} />;
};

export default React.memo(MyTouchable);
