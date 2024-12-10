import * as dotenv from "dotenv";

const loadEnvFile = (path: string) => {
    try {
        const env = dotenv.config({ path }).parsed;
        if (env) {
            return env;
        }
        return null;
    } catch (error) {
        console.warn(`Failed to load ${path}:`, error);
        return null;
    }
};

const getEnvConfig = () => {
    const mode = process.env.APP_ENV;
    if (mode) {
        const envPath = `.env.local.${mode.toLowerCase()}`;
        const modeEnv = loadEnvFile(envPath);
        if (modeEnv) return modeEnv;
    }

    const defaultEnv = loadEnvFile(".env.local");
    if (defaultEnv) return defaultEnv;

    console.warn("No environment file found");
    return {};
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
