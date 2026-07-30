/**
 * Manual mock for react-native-reanimated.
 *
 * The library's own `react-native-reanimated/mock` re-imports the real entry
 * point, which boots the worklets runtime and throws because there is no native
 * module under Jest. This mock renders plain RN components and drops the
 * animation-only props.
 */
const React = require('react');
const { View, Text, ScrollView, Image, FlatList } = require('react-native');

const ANIMATION_PROPS = ['entering', 'exiting', 'layout', 'sharedTransitionTag', 'animatedProps'];

const stripAnimationProps = (props) => {
    const next = { ...props };
    ANIMATION_PROPS.forEach((key) => delete next[key]);
    return next;
};

const createAnimatedComponent = (Component) => {
    const Animated = React.forwardRef((props, ref) =>
        React.createElement(Component, { ...stripAnimationProps(props), ref })
    );
    Animated.displayName = `Animated(${Component.displayName || Component.name || 'Component'})`;
    return Animated;
};

/** Entering/exiting animation builders are chainable no-ops. */
const createAnimationBuilder = () => {
    const builder = {};
    const chain = () => builder;
    ['duration', 'delay', 'springify', 'damping', 'stiffness', 'easing', 'withInitialValues', 'build'].forEach(
        (method) => {
            builder[method] = chain;
        }
    );
    return builder;
};

module.exports = new Proxy(
    {
        __esModule: true,
        default: {
            View: createAnimatedComponent(View),
            Text: createAnimatedComponent(Text),
            ScrollView: createAnimatedComponent(ScrollView),
            Image: createAnimatedComponent(Image),
            FlatList: createAnimatedComponent(FlatList),
            createAnimatedComponent,
        },
        createAnimatedComponent,
        useSharedValue: (initial) => ({ value: initial }),
        useAnimatedStyle: (factory) => factory(),
        withTiming: (toValue) => toValue,
        withSpring: (toValue) => toValue,
        withDelay: (_delay, value) => value,
        runOnJS: (fn) => fn,
        runOnUI: (fn) => fn,
        Easing: new Proxy({}, { get: () => () => undefined }),
    },
    {
        // FadeInDown, FadeOutUp, SlideInLeft, ... are all chainable no-op builders.
        get: (target, prop) => {
            if (prop in target) return target[prop];
            if (typeof prop === 'string' && /^[A-Z]/.test(prop)) return createAnimationBuilder();
            return undefined;
        },
    }
);
