import { cssInterop } from 'nativewind';
import React from 'react';
import { ScrollView as RNScrollView } from 'react-native';

import { createStyleFromProps } from '../utils/style-props';

import { scrollViewStyle } from './styles';

import type { VariantProps } from '../utils/tva';
import type { ViewStyle } from 'react-native';

const UIScrollView = RNScrollView;
cssInterop(UIScrollView, {
    className: 'style',
    contentContainerClassName: 'contentContainerStyle',
});

type StyleProps = Omit<ViewStyle, 'transform'>;
type ContentContainerStyleProps = Omit<ViewStyle, 'transform'>;

export type IScrollViewProps = Omit<React.ComponentProps<typeof UIScrollView>, keyof StyleProps> &
    StyleProps & {
        contentContainerStyle?: ContentContainerStyleProps;
        className?: string;
        contentClassName?: string;
        space?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
    } & VariantProps<typeof scrollViewStyle>;

const ScrollView = ({
    ref,
    className,
    contentClassName,
    space,
    style,
    contentContainerStyle,
    showsVerticalScrollIndicator = false,
    ...props
}: IScrollViewProps & { ref?: React.Ref<React.ComponentRef<typeof UIScrollView>> }) => {
    const styleProps = createStyleFromProps(props as StyleProps);

    const contentClassNames = [
        contentClassName,
        space &&
            scrollViewStyle({ space })
                .split(' ')
                .find((cls: string) => cls.startsWith('gap-')),
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <UIScrollView
            ref={ref}
            {...props}
            className={scrollViewStyle({ class: className })}
            contentContainerClassName={contentClassNames}
            showsVerticalScrollIndicator={showsVerticalScrollIndicator}
            style={[styleProps, style]}
            contentContainerStyle={contentContainerStyle}
        />
    );
};

export default ScrollView;
