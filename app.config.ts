import * as dotenv from "dotenv";
import { ConfigContext, ExpoConfig } from "expo/config";

const getEnvPath = (env: string | undefined): string => {
    switch (env?.toLowerCase()) {
        case "production":
            return ".env.local.production";
        case "staging":
            return ".env.local.staging";
        case "development":
            return ".env.local.development";
        default:
            return ".env.local";
    }
};

const loadEnvFile = (path: string) => {
    try {
        const env = dotenv.config({ path }).parsed;
        if (!env) throw new Error(`Empty env file: ${path}`);
        return env;
    } catch (error) {
        console.warn(`Failed to load ${path}:`, error);
        return null;
    }
};

const validateEnvConfig = (env: Record<string, any>) => {
    const requiredVars = ["APP_FLAVOR", "VERSION_CODE", "VERSION_NAME", "API_BASE_URL"];

    const missingVars = requiredVars.filter((key) => !env[key]);
    if (missingVars.length > 0) {
        throw new Error(`Missing required env variables: ${missingVars.join(", ")}`);
    }

    return env;
};

export default ({ config }: ConfigContext): ExpoConfig => {
    const envPath = getEnvPath(process.env.APP_ENV);
    const envConfig = loadEnvFile(envPath);

    if (!envConfig) {
        throw new Error(`Failed to load environment config from ${envPath}`);
    }

    const validatedConfig = validateEnvConfig(envConfig);

    return {
        ...config,
        name: "NewReactNative",
        slug: "newreactnative",
        version: validatedConfig.VERSION_NAME,
        extra: {
            ...validatedConfig
        },
        ios: {
            buildNumber: validatedConfig.VERSION_CODE
        },
        android: {
            versionCode: parseInt(validatedConfig.VERSION_CODE, 10)
        }
    };
};
