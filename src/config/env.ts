import Constants from "expo-constants";

export const getEnvVar = (name: string): string => {
    const value = Constants.expoConfig?.extra?.[name];

    if (!value) {
        throw new Error(`Missing environment variable: ${name}`);
    }
    return value as string;
};
export const ENV = {
    APP_FLAVOR: getEnvVar("APP_FLAVOR"),
    VERSION_CODE: getEnvVar("VERSION_CODE"),
    VERSION_NAME: getEnvVar("VERSION_NAME"),
    API_BASE_URL: getEnvVar("API_BASE_URL")
};
