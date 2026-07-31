import React from 'react';
import { Text as RNText } from 'react-native';

import { createStyleFromProps } from '../utils/style-props';

import { textStyle } from './styles';

import type { VariantProps } from '../utils/tva';
import type { TextStyle } from 'react-native';

type StyleProps = Omit<TextStyle, 'transform'>;

export type ITextProps = Omit<React.ComponentProps<typeof RNText>, keyof StyleProps> &
    StyleProps &
    VariantProps<typeof textStyle> & {
        className?: string;
    };

const Text = React.forwardRef<React.ComponentRef<typeof RNText>, ITextProps>(
    (
        {
            className,
            isTruncated,
            bold,
            underline,
            strikeThrough,
            size = 'md',
            sub,
            italic,
            highlight,
            style,
            ...props
        },
        ref
    ) => {
        const styleProps = createStyleFromProps(props as StyleProps);

        return (
            <RNText
                className={textStyle({
                    isTruncated,
                    bold,
                    underline,
                    strikeThrough,
                    size,
                    sub,
                    italic,
                    highlight,
                    class: className,
                })}
                style={[styleProps, style]}
                {...props}
                ref={ref}
            />
        );
    }
);

Text.displayName = 'Text';
export default Text;
