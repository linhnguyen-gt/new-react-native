import React from 'react';

/**
 * Replaces `@gluestack-ui/nativewind-utils/withStyleContext`.
 *
 * Lets a compound component (Button, Toast) publish its chosen variants so
 * descendants can style themselves to match without prop drilling.
 */

type StyleContextValue = Record<string, unknown>;

const contexts = new Map<string, React.Context<StyleContextValue>>();

const getContext = (scope: string): React.Context<StyleContextValue> => {
    let context = contexts.get(scope);
    if (!context) {
        context = React.createContext<StyleContextValue>({});
        context.displayName = `StyleContext(${scope})`;
        contexts.set(scope, context);
    }
    return context;
};

type WithContextProps = { context?: StyleContextValue };

/** Wraps a component so it provides `context` to descendants in `scope`. */
export function withStyleContext<TProps extends object>(component: React.ComponentType<TProps>, scope: string) {
    const Context = getContext(scope);
    const Component = component;

    const Wrapped = ({ ref, context, ...props }: TProps & WithContextProps & { ref?: React.Ref<unknown> }) => (
        <Context.Provider value={context ?? {}}>
            <Component {...(props as TProps)} ref={ref} />
        </Context.Provider>
    );

    Wrapped.displayName = `withStyleContext(${Component.displayName ?? Component.name ?? scope})`;
    return Wrapped;
}

/** Reads the variants published by the nearest `withStyleContext` ancestor. */
export function useStyleContext<TValue extends StyleContextValue = StyleContextValue>(scope: string): TValue {
    return React.useContext(getContext(scope)) as TValue;
}
