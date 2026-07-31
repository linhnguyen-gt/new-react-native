import { cssInterop } from 'nativewind';
import React from 'react';
import { Platform, Image as RNImage } from 'react-native';

import { createStyleFromProps } from '../utils/style-props';
import { tva } from '../utils/tva';

import type { VariantProps } from '../utils/tva';
import type { ImageStyle } from 'react-native';

type StyleProps = Omit<ImageStyle, 'transform'>;

const imageStyle = tva({
    base: 'max-w-full',
    variants: {
        size: {
            '2xs': 'h-6 w-6',
            xs: 'h-10 w-10',
            sm: 'h-16 w-16',
            md: 'h-20 w-20',
            lg: 'h-24 w-24',
            xl: 'h-32 w-32',
            '2xl': 'h-64 w-64',
            full: 'h-full w-full',
        },
    },
});

cssInterop(RNImage, { className: 'style' });

export type ImageProps = Omit<React.ComponentProps<typeof RNImage>, keyof StyleProps> &
    StyleProps &
    VariantProps<typeof imageStyle> & {
        className?: string;
    };

const Image = ({
    ref,
    size = 'md',
    className,
    style,
    ...props
}: ImageProps & { ref?: React.Ref<React.ComponentRef<typeof RNImage>> }) => {
    const styleProps = createStyleFromProps(props as StyleProps);

    return (
        <RNImage
            className={imageStyle({ size, class: className })}
            style={[
                styleProps,
                // @ts-expect-error : web-only sizing reset
                Platform.OS === 'web' ? { height: 'revert-layer', width: 'revert-layer' } : undefined,
                style,
            ]}
            {...props}
            ref={ref}
        />
    );
};

export default Image;
