import React from 'react';
import { ActivityIndicator, Pressable, StyleProp, Text, View, ViewStyle } from 'react-native';

import { useStyleContext, withStyleContext } from '../utils/style-context';
import { createStyleFromProps } from '../utils/style-props';
import { tva } from '../utils/tva';

import type { VariantProps } from '../utils/tva';

const SCOPE = 'BUTTON';

/** Variants the Button publishes to its Text/Icon children. */
type ButtonContext = {
    action?: 'primary' | 'secondary' | 'positive' | 'negative' | 'default';
    variant?: 'link' | 'outline' | 'solid';
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
};

const Root = withStyleContext(Pressable, SCOPE);

// Gluestack drove these off `data-[hover=true]` attributes set by its own Root.
// NativeWind supports hover/active/disabled pseudo-classes on Pressable directly.
const buttonStyle = tva({
    base: 'group/button flex-row items-center justify-center gap-2 rounded bg-primary-500 disabled:opacity-40',
    variants: {
        action: {
            primary: 'border-primary-300 bg-primary-500 hover:border-primary-400 hover:bg-primary-600',
            secondary: 'border-secondary-300 bg-secondary-500 hover:border-secondary-400 hover:bg-secondary-600',
            positive: 'border-success-300 bg-success-500 hover:border-success-400 hover:bg-success-600',
            negative: 'border-error-300 bg-error-500 hover:border-error-400 hover:bg-error-600',
            default: 'bg-transparent hover:bg-background-50',
        },
        variant: {
            link: 'px-0',
            outline: 'border bg-transparent hover:bg-background-50 active:bg-transparent',
            solid: '',
        },
        size: {
            xs: 'h-8 px-3.5',
            sm: 'h-9 px-4',
            md: 'h-10 px-5',
            lg: 'h-11 px-6',
            xl: 'h-12 px-7',
        },
    },
    compoundVariants: [
        { variant: 'link', class: 'bg-transparent px-0 hover:bg-transparent active:bg-transparent' },
        { variant: 'outline', class: 'bg-transparent hover:bg-background-50 active:bg-transparent' },
    ],
});

const buttonTextStyle = tva({
    base: 'font-semibold text-typography-0 web:select-none',
    variants: {
        action: {
            primary: 'text-primary-600',
            secondary: 'text-typography-500',
            positive: 'text-success-600',
            negative: 'text-error-600',
            default: '',
        },
        variant: {
            link: 'hover:underline active:underline',
            outline: '',
            solid: 'text-typography-0',
        },
        size: {
            xs: 'text-xs',
            sm: 'text-sm',
            md: 'text-base',
            lg: 'text-lg',
            xl: 'text-xl',
        },
    },
    // Solid fills paint the action colour as the background, so the label has to invert.
    // Outline and link need no entries: they keep the background transparent, so the label
    // colour from `action` above is already the correct one. The outline rows that used to
    // sit here forced `text-primary-500` onto every action, which made a destructive button
    // read as a neutral one — and on `negative` it lost to the base colour outright,
    // rendering white text on a white button.
    compoundVariants: [
        { variant: 'solid', action: 'primary', class: 'text-typography-0' },
        { variant: 'solid', action: 'secondary', class: 'text-typography-800' },
        { variant: 'solid', action: 'positive', class: 'text-typography-0' },
        { variant: 'solid', action: 'negative', class: 'text-typography-0' },
    ],
});

const buttonIconStyle = tva({
    base: 'fill-none',
    variants: {
        action: {
            primary: 'text-primary-600',
            secondary: 'text-typography-500',
            positive: 'text-success-600',
            negative: 'text-error-600',
            default: '',
        },
        variant: {
            link: 'hover:underline active:underline',
            outline: '',
            solid: 'text-typography-0',
        },
        size: {
            xs: 'h-3.5 w-3.5',
            sm: 'h-4 w-4',
            md: 'h-[18px] w-[18px]',
            lg: 'h-[18px] w-[18px]',
            xl: 'h-5 w-5',
        },
    },
    compoundVariants: [
        { variant: 'solid', action: 'primary', class: 'text-typography-0' },
        { variant: 'solid', action: 'secondary', class: 'text-typography-800' },
        { variant: 'solid', action: 'positive', class: 'text-typography-0' },
        { variant: 'solid', action: 'negative', class: 'text-typography-0' },
    ],
});

const buttonGroupStyle = tva({
    base: '',
    variants: {
        space: {
            xs: 'gap-1',
            sm: 'gap-2',
            md: 'gap-3',
            lg: 'gap-4',
            xl: 'gap-5',
            '2xl': 'gap-6',
            '3xl': 'gap-7',
            '4xl': 'gap-8',
        },
        isAttached: { true: 'gap-0' },
        flexDirection: {
            row: 'flex-row',
            column: 'flex-col',
            'row-reverse': 'flex-row-reverse',
            'column-reverse': 'flex-col-reverse',
        },
    },
});

type StyleProps = Omit<ViewStyle, 'transform'>;

// `style` is re-declared: Pressable also allows a (state) => style callback,
// which cannot be composed into the style array below.
type IButtonProps = Omit<React.ComponentPropsWithoutRef<typeof Pressable>, keyof StyleProps | 'style'> &
    StyleProps &
    VariantProps<typeof buttonStyle> & { className?: string; style?: StyleProp<ViewStyle> };

const Button = React.forwardRef<React.ComponentRef<typeof Pressable>, IButtonProps>(function ButtonRoot(
    { className, variant = 'solid', size = 'md', action = 'primary', style, ...props },
    ref
) {
    const styleProps = createStyleFromProps(props as StyleProps);

    return (
        <Root
            ref={ref}
            {...props}
            style={[styleProps, { opacity: props.disabled ? 0.5 : 1 }, style]}
            className={buttonStyle({ variant, size, action, class: className })}
            context={{ variant, size, action } satisfies ButtonContext}
        />
    );
});

type IButtonTextProps = React.ComponentPropsWithoutRef<typeof Text> &
    VariantProps<typeof buttonTextStyle> & { className?: string };

const ButtonText = React.forwardRef<React.ComponentRef<typeof Text>, IButtonTextProps>(function ButtonTextInner(
    { className, variant, size, action, ...props },
    ref
) {
    const parent = useStyleContext<ButtonContext>(SCOPE);

    return (
        <Text
            ref={ref}
            {...props}
            className={buttonTextStyle({
                variant: variant ?? parent.variant,
                size: size ?? parent.size,
                action: action ?? parent.action,
                class: className,
            })}
        />
    );
});

type IButtonIconProps = VariantProps<typeof buttonIconStyle> & {
    className?: string;
    /** Icon component to render, e.g. a vector-icons glyph. */
    as?: React.ElementType;
    height?: number;
    width?: number;
};

const ButtonIcon = React.forwardRef<unknown, IButtonIconProps>(function ButtonIconInner(
    { className, variant, size, action, as: asComponent, ...props },
    ref
) {
    const parent = useStyleContext<ButtonContext>(SCOPE);

    const As = asComponent;
    if (!As) return null;

    return (
        <As
            ref={ref}
            {...props}
            className={buttonIconStyle({
                variant: variant ?? parent.variant,
                size: size ?? parent.size,
                action: action ?? parent.action,
                class: className,
            })}
        />
    );
});

const ButtonSpinner = ActivityIndicator;

type IButtonGroupProps = React.ComponentPropsWithoutRef<typeof View> & VariantProps<typeof buttonGroupStyle>;

const ButtonGroup = React.forwardRef<React.ComponentRef<typeof View>, IButtonGroupProps>(function ButtonGroupInner(
    { className, space = 'md', isAttached = false, flexDirection = 'column', ...props },
    ref
) {
    return (
        <View ref={ref} {...props} className={buttonGroupStyle({ class: className, space, isAttached, flexDirection })}>
            {props.children}
        </View>
    );
});

export { Button, ButtonGroup, ButtonIcon, ButtonSpinner, ButtonText };
