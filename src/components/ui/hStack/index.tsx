import React from 'react';
import { View } from 'react-native';

import Touchable from '../touch';
import { createStyleFromProps } from '../utils/style-props';

import { hstackStyle } from './styles';

import type { VariantProps } from '../utils/tva';
import type { ViewStyle } from 'react-native';

type StyleProps = Omit<ViewStyle, 'transform'>;

type IHStackProps = Omit<React.ComponentProps<typeof View>, keyof StyleProps> &
    StyleProps &
    VariantProps<typeof hstackStyle> & {
        className?: string;
        onPress?: () => void;
    };

/**
 * Renders a plain View unless it is actually pressable — VStack always has.
 *
 * It used to render a TouchableOpacity in every case, and TouchableComponent marks itself
 * `disabled` when there is no `onPress`. TouchableOpacity defaults to `accessible` with a button
 * role, so a pure layout row was announced to VoiceOver/TalkBack as "dimmed, button", and each
 * row cost an Animated.View plus a gesture responder.
 */
const HStack = React.forwardRef<React.ComponentRef<typeof View>, IHStackProps>(
    ({ className, space, reversed, style, onPress, onBlur, onFocus, ...props }, ref) => {
        const styleProps = createStyleFromProps(props as StyleProps);
        const resolvedClassName = hstackStyle({ space, reversed, class: className });
        const resolvedStyle = [styleProps, style];

        if (!onPress) {
            return <View ref={ref} className={resolvedClassName} style={resolvedStyle} {...props} />;
        }

        // onBlur/onFocus accept null on View but not on TouchableOpacity.
        const touchableProps = {
            ...props,
            ...(onBlur !== null && onBlur !== undefined && { onBlur }),
            ...(onFocus !== null && onFocus !== undefined && { onFocus }),
        };

        return (
            <Touchable
                onPress={onPress}
                className={resolvedClassName}
                style={resolvedStyle}
                {...touchableProps}
                ref={ref}
            />
        );
    }
);

HStack.displayName = 'HStack';

export default HStack;
