import React from 'react';
import { View } from 'react-native';

import { createStyleFromProps } from '../utils/style-props';

import { vstackStyle } from './styles';

import type { VariantProps } from '../utils/tva';
import type { ViewStyle } from 'react-native';

type StyleProps = Omit<ViewStyle, 'transform'>;

export type IVStackProps = Omit<React.ComponentProps<typeof View>, keyof StyleProps> &
    StyleProps &
    VariantProps<typeof vstackStyle> & {
        className?: string;
    };

const VStack = React.forwardRef<React.ComponentRef<typeof View>, IVStackProps>(
    ({ className, space, reversed, style, ...props }, ref) => {
        const styleProps = createStyleFromProps(props as StyleProps);

        return (
            <View
                className={vstackStyle({ space, reversed, class: className })}
                style={[styleProps, style]}
                {...props}
                ref={ref}
            />
        );
    }
);

VStack.displayName = 'VStack';

export default VStack;
