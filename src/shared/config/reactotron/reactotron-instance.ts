import Reactotron from './reactotron';

/** Construction only copies the config object; nothing connects until `initReactotron`. */
export const reactotron = new Reactotron();

let isInitialised = false;

/**
 * Wires the plugins and, in dev, opens the socket to the Reactotron desktop app.
 *
 * This used to run at import time, so pulling anything out of `@/services` connected a socket
 * as a side effect of loading a module. `createAppStore` calls it explicitly instead, before it
 * asks for the enhancer and the saga monitor.
 */
export const initReactotron = (): void => {
    if (isInitialised) return;
    isInitialised = true;
    reactotron.setup();
};

export default reactotron;
