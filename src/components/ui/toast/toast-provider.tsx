import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp, FadeOutDown, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Replaces `@gluestack-ui/toast`. Keeps the same call shape used across the app:
 *
 *   const toast = useToast();
 *   toast.show({ placement: 'bottom', duration: 3000, render: ({ id }) => <Toast ... /> });
 */

export type ToastPlacement = 'top' | 'bottom' | 'center';

export type ShowToastOptions = {
    placement?: ToastPlacement;
    /** Milliseconds before auto-dismiss. Pass `null` to keep it until closed. */
    duration?: number | null;
    render: (props: { id: string }) => React.ReactNode;
};

type ActiveToast = {
    id: string;
    placement: ToastPlacement;
    node: React.ReactNode;
};

type ToastApi = {
    show: (options: ShowToastOptions) => string;
    close: (id: string) => void;
    closeAll: () => void;
    isActive: (id: string) => boolean;
};

const ToastContext = React.createContext<ToastApi | null>(null);

let toastCounter = 0;
const nextToastId = () => `toast-${++toastCounter}`;

const PLACEMENTS: ToastPlacement[] = ['top', 'center', 'bottom'];

const enteringFor = (placement: ToastPlacement) => (placement === 'top' ? FadeInUp : FadeInDown);
const exitingFor = (placement: ToastPlacement) => (placement === 'top' ? FadeOutUp : FadeOutDown);

export function ToastProvider({ children }: { children?: React.ReactNode }) {
    const [toasts, setToasts] = React.useState<ActiveToast[]>([]);
    const timers = React.useRef(new Map<string, ReturnType<typeof setTimeout>>());
    const insets = useSafeAreaInsets();

    const close = React.useCallback((id: string) => {
        const timer = timers.current.get(id);
        if (timer) {
            clearTimeout(timer);
            timers.current.delete(id);
        }
        setToasts((current) => current.filter((toast) => toast.id !== id));
    }, []);

    const closeAll = React.useCallback(() => {
        timers.current.forEach(clearTimeout);
        timers.current.clear();
        setToasts([]);
    }, []);

    const show = React.useCallback(
        ({ placement = 'bottom', duration = 3000, render }: ShowToastOptions) => {
            const id = nextToastId();
            setToasts((current) => [...current, { id, placement, node: render({ id }) }]);

            if (duration !== null) {
                timers.current.set(
                    id,
                    setTimeout(() => close(id), duration)
                );
            }

            return id;
        },
        [close]
    );

    const isActive = React.useCallback((id: string) => toasts.some((toast) => toast.id === id), [toasts]);

    // Clear any pending timers if the provider itself goes away.
    React.useEffect(() => {
        const pending = timers.current;
        return () => {
            pending.forEach(clearTimeout);
            pending.clear();
        };
    }, []);

    const api = React.useMemo<ToastApi>(() => ({ show, close, closeAll, isActive }), [show, close, closeAll, isActive]);

    return (
        <ToastContext.Provider value={api}>
            {children}
            <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
                {PLACEMENTS.map((placement) => {
                    const group = toasts.filter((toast) => toast.placement === placement);
                    if (group.length === 0) return null;

                    return (
                        <View
                            key={placement}
                            pointerEvents="box-none"
                            style={[
                                styles.group,
                                placement === 'top' && { top: insets.top + 8 },
                                placement === 'bottom' && { bottom: insets.bottom + 8 },
                                placement === 'center' && styles.center,
                            ]}>
                            {group.map((toast) => (
                                <Animated.View
                                    key={toast.id}
                                    pointerEvents="box-none"
                                    entering={enteringFor(placement)}
                                    exiting={exitingFor(placement)}>
                                    {toast.node}
                                </Animated.View>
                            ))}
                        </View>
                    );
                })}
            </View>
        </ToastContext.Provider>
    );
}

const styles = StyleSheet.create({
    group: {
        position: 'absolute',
        left: 0,
        right: 0,
    },
    center: {
        top: 0,
        bottom: 0,
        justifyContent: 'center',
    },
});

export function useToast(): ToastApi {
    const context = React.useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
