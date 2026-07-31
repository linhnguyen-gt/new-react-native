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

const BaseBox = React.forwardRef<React.ComponentRef<typeof View>, BaseBoxProps>(
    ({ className, style, safeArea, ...props }, ref) => {
        const styleProps = createStyleFromProps(props as StyleProps);

        return (
            <View
                className={boxStyle({ class: `${className} ${safeArea ? 'pt-safe pb-safe' : ''}` })}
                style={[styleProps, style]}
                {...props}
                ref={ref}
            />
        );
    }
);

BaseBox.displayName = 'BaseBox';
export default BaseBox;
