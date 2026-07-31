import React from 'react';
import { Provider } from 'react-redux';

import { createAppStore } from '@/store';

import App from '@/App';
import ErrorBoundary, { BootstrapErrorScreen } from '@/components/error-boundary';

type Bootstrap = { store: ReturnType<typeof createAppStore>; error?: never } | { store?: never; error: Error };

/**
 * Memoised at module scope rather than only in the `useState` initialiser: StrictMode runs that
 * initialiser twice, and two stores would mean two saga roots.
 */
let bootstrapped: Bootstrap | null = null;

const bootstrap = (): Bootstrap => {
    if (bootstrapped) return bootstrapped;

    try {
        bootstrapped = { store: createAppStore() };
    } catch (error) {
        bootstrapped = { error: error instanceof Error ? error : new Error(String(error)) };
    }

    return bootstrapped;
};

const Root = () => {
    const [boot] = React.useState(bootstrap);

    if (boot.error) return <BootstrapErrorScreen error={boot.error} />;

    return (
        <ErrorBoundary>
            <Provider store={boot.store}>
                <App />
            </Provider>
        </ErrorBoundary>
    );
};

export default Root;
