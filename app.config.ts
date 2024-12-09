import * as dotenv from "dotenv";

const getEnvConfig = () => {
    try {
        const mode = process.env.APP_ENV || "development";
        const envPath = `.env.local.${mode.toLowerCase()}`;
        const localEnv = dotenv.config({ path: envPath }).parsed;

        if (localEnv) {
            return localEnv;
        }

        const defaultEnv = dotenv.config({ path: ".env.local" }).parsed;
        if (defaultEnv) {
            return defaultEnv;
        }

        throw new Error("No environment file found");
    } catch (error) {
        console.warn("Error loading environment:", error);
        return {};
    }
};

const envConfig = getEnvConfig();

export default {
    name: "NewReactNative",
    version: envConfig.VERSION_NAME || "1.0.0",
    extra: {
        ...envConfig
    },
    ios: {
        buildNumber: envConfig.VERSION_CODE || "1"
    },
    android: {
        versionCode: parseInt(envConfig.VERSION_CODE || "1", 10)
    }
};
