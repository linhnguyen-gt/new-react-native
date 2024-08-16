import { createComponents, createConfig } from "@gluestack-style/react";
import { config as defaultConfig } from "@gluestack-ui/config";

import * as componentsTheme from "./theme";

export const gluestackUIConfig = createConfig({
    ...defaultConfig
});

type Config = typeof gluestackUIConfig; // Assuming `config` is defined elsewhere

type Components = typeof componentsConfig;

export const componentsConfig = createComponents(componentsTheme);

export type { UIComponents, UIConfig } from "@gluestack-ui/themed";

export interface IConfig {}

export interface IComponents {}

declare module "@gluestack-ui/themed" {
    interface UIConfig extends Omit<Config, keyof IConfig>, IConfig {}

    interface UIComponents extends Omit<Components, keyof IComponents>, IComponents {}
}

export const config = {
    ...gluestackUIConfig,
    components: componentsConfig
};
