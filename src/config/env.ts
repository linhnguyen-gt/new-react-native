import { environment } from "@/services";

export const ENV = {
    get API_BASE_URL() {
        return environment.apiBaseUrl;
    },
    get APP_FLAVOR() {
        return environment.appFlavor;
    },
    get VERSION_CODE() {
        return environment.versionCode;
    },
    get VERSION_NAME() {
        return environment.versionName;
    }
} as const;
