declare module "react-native-config" {
    export interface NativeConfig {
        APP_FLAVOR?: string;
        API_BASE_URL?: string;
    }

    export const Config: NativeConfig;
    export default Config;
}
