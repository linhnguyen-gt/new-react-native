import React from 'react';
import { View } from 'react-native';

import { createStyleFromProps } from '../utils/style-props';

import { boxStyle } from './styles';

import type { VariantProps } from '../utils/tva';
import type { ViewStyle } from 'react-native';

type StyleProps = Omit<ViewStyle, 'transform'>;

export type BaseBoxProps = Omit<React.ComponentProps<typeof View>, keyof StyleProps> &
    StyleProps &
    VariantProps<typeof boxStyle> & {
        className?: string;
        safeArea?: boolean;
    };

const BaseBox = ({
    ref,
    className,
    style,
    safeArea,
    ...props
}: BaseBoxProps & { ref?: React.Ref<React.ComponentRef<typeof View>> }) => {
    const styleProps = createStyleFromProps(props as StyleProps);

    return (
        <View
            className={boxStyle({ class: `${className} ${safeArea ? 'pt-safe pb-safe' : ''}` })}
            style={[styleProps, style]}
            {...props}
            ref={ref}
        />
    );
};

export default BaseBox;
