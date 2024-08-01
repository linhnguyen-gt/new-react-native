import AsyncStorage from "@react-native-async-storage/async-storage";
import Tron from "reactotron-react-native";
import { reactotronRedux as reduxPlugin } from "reactotron-redux";
import sagaPlugin from "reactotron-redux-saga";

import { name } from "../../../package.json";

import { DEFAULT_REACTOTRON_CONFIG, ReactotronConfig } from "./ReactotronConfig";

// in dev, we attach Reactotron, in prod we attach an interface-compatible mock.
if (__DEV__) {
    // eslint-disable-next-line no-console
    console.tron = Tron; // attach reactotron to `console.tron`
}

export default class Reactotron {
    config: ReactotronConfig;
    tron!: typeof Tron & {
        createEnhancer?: (skipSettingStore?: boolean) => (createStore: any) => (reducer: any, ...args: any[]) => any;
    };

    constructor(config: ReactotronConfig = DEFAULT_REACTOTRON_CONFIG) {
        this.config = { ...config };
    }

    setup() {
        this.tron = Tron.configure({
            name: this.config.name || name,
            host: this.config.host
        });

        if (this.config.useAsyncStorage) {
            this.tron.setAsyncStorageHandler?.(AsyncStorage);
        }

        this.tron.useReactNative({
            asyncStorage: this.config.useAsyncStorage ? { ignore: ["persist:root", "NAVIGATION_STATE"] } : false,
            networking: { ignoreUrls: this.config.ignoreUrls }
        });

        this.tron.use(
            reduxPlugin({
                except: this.config.exceptActions
            })
        );

        this.tron.use(sagaPlugin({}) as any);

        if (__DEV__) {
            this.tron.connect();
            if (this.config.clearOnLoad) this.tron.clear?.();
        }
    }

    createEnhancer() {
        return this.tron.createEnhancer?.();
    }
}

declare global {
    interface Console {
        tron: typeof Tron & {
            createEnhancer?: (
                skipSettingStore?: boolean
            ) => (createStore: any) => (reducer: any, ...args: any[]) => any;
        };
    }
}
