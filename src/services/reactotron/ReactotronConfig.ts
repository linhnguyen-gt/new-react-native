import { TurboModuleRegistry } from 'react-native';

export interface ReactotronConfig {
    /** The name of the app. */
    name?: string;
    /** The host to connect to: default 'localhost'. */
    host?: string;
    /** Should we use async storage */
    useAsyncStorage?: boolean;
    ignoreUrls?: RegExp;
    clearOnLoad?: boolean;
    /** Root state logging. */
    state?: {
        /** log the initial data that we put into the state on startup? */
        initial?: boolean;
        /** log snapshot changes. */
        snapshots?: boolean;
    };
    exceptActions?: string[];
}

/**
 * The default Reactotron configuration.
 */
/** The Metro host, which is where Reactotron listens. Resolved on read, not at import. */
const resolveHost = (): string =>
    (TurboModuleRegistry.getEnforcing('SourceCode')?.getConstants?.() as { scriptURL?: string })?.scriptURL
        ?.split('://')[1]
        ?.split(':')[0] ?? 'localhost';

export const DEFAULT_REACTOTRON_CONFIG: ReactotronConfig = {
    clearOnLoad: true,
    // A getter: `getEnforcing` is a native-module lookup and this module is imported through the
    // services barrel, so as a plain value it ran during module loading on every app start.
    get host() {
        return resolveHost();
    },
    useAsyncStorage: true,
    ignoreUrls: /(logs|symbolicate)$/,
    state: {
        initial: true,
        snapshots: false,
    },
    exceptActions: ['persist/PERSIST', 'persist/REHYDRATE'],
};
