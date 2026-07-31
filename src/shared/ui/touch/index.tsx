import React from 'react';
import { TouchableOpacity } from 'react-native';

import { createStyleFromProps } from '../utils/style-props';
import { tva } from '../utils/tva';

import type { VariantProps } from '../utils/tva';
import type { TouchableOpacityProps, ViewStyle } from 'react-native';

export const touchableStyle = tva({});

type StyleProps = Omit<ViewStyle, 'transform'>;

export type TouchableComponentProps = Omit<TouchableOpacityProps, keyof StyleProps> &
    StyleProps &
    VariantProps<typeof touchableStyle> & {
        className?: string;
    };

/**
 * The implementation lives here now.
 *
 * It used to sit in `components/touchable/TouchableComponent`, and this file was a 13-line
 * passthrough to it — so the design system depended on the folder it was meant to replace.
 * The arrow points the other way round now: `components/touchable/MyTouchable` imports this.
 */
const Touchable = ({
    ref,
    className,
    style,
    ...props
}: TouchableComponentProps & { ref?: React.Ref<React.ComponentRef<typeof TouchableOpacity>> }) => {
    const styleProps = createStyleFromProps(props as StyleProps);

    return (
        <TouchableOpacity
            activeOpacity={0.5}
            disabled={props.disabled || !props.onPress}
            className={touchableStyle({ class: className })}
            style={[styleProps, style]}
            {...props}
            ref={ref}
        />
    );
};

export default Touchable;
