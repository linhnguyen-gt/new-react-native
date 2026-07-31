import React from 'react';

import BootstrapErrorScreen from './bootstrap-error-screen';

import Logger from '@/shared/lib/logger';

type ErrorBoundaryProps = {
    children: React.ReactNode;
};

type ErrorBoundaryState = {
    error: Error | null;
};

/**
 * The app had no boundary at all, so any render-time throw unmounted the tree into a white
 * screen. Still a class component — `componentDidCatch` has no hook equivalent.
 */
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state: ErrorBoundaryState = { error: null };

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { error };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo): void {
        Logger.error('ErrorBoundary', error.message, info.componentStack);
    }

    render() {
        const { error } = this.state;
        if (error) return <BootstrapErrorScreen error={error} />;

        return this.props.children;
    }
}

export { BootstrapErrorScreen };
export default ErrorBoundary;
