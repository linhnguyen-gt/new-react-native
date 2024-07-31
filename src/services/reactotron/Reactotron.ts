import AsyncStorage from "@react-native-async-storage/async-storage";
import Tron from "reactotron-react-native";
import { reactotronRedux as reduxPlugin } from "reactotron-redux";
import sagaPlugin from "reactotron-redux-saga";

import { name } from "../../../package.json";

import { DEFAULT_REACTOTRON_CONFIG, ReactotronConfig } from "./ReactotronConfig";

// in dev, we attach Reactotron, in prod we attach a interface-compatible mock.
if (__DEV__) {
    // eslint-disable-next-line no-console
    console.tron = Tron; // attach reactotron to `console.tron`
}

/**
 * You'll probably never use the service like this since we hang the Reactotron
 * instance off of `console.tron`. This is only to be consistent with the other
 * services.
 */
export default class Reactotron {
    config: ReactotronConfig;

    tron!: typeof Tron;

    /**
     * Create the Reactotron service.
     *
     * @param config the configuration
     */
    constructor(config: ReactotronConfig = DEFAULT_REACTOTRON_CONFIG) {
        // merge the passed in config with some defaults
        this.config = { ...config };
    }

    /**
     * Configure reactotron based on the config settings passed in, then connect if we need to.
     */
    setup() {
        // configure reactotron
        this.tron = Tron.configure({
            name: this.config.name || name,
            host: this.config.host
        });

        // hookup middleware
        if (this.config.useAsyncStorage) {
            this.tron.setAsyncStorageHandler?.(AsyncStorage);
        }
        this.tron.useReactNative({
            asyncStorage: this.config.useAsyncStorage
                ? {
                      ignore: ["persist:root", "NAVIGATION_STATE"]
                  }
                : false,
            networking: {
                ignoreUrls: this.config.ignoreUrls
            }
        });

        // hookup redux
        this.tron.use(
            reduxPlugin({
                except: this.config.exceptActions
            })
        );
        // hookup redux-saga middleware
        this.tron.use(sagaPlugin({}) as any);

        // if we're running in DEV mode, then let's connect!
        if (__DEV__) {
            this.tron.connect();
            // clear if we should
            if (this.config.clearOnLoad) this.tron.clear?.();
        }
    }
}

// Teach TypeScript about the bad things we want to do.
declare global {
    interface Console {
        /**
         * Hey, it's Reactotron if we're in dev, and no-ops if we're in prod.
         */
        tron: typeof Tron;
    }
}
