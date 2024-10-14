declare module "react-native-config" {
    export interface NativeConfig {
        APP_FLAVOR?: string;
    }

    export const Config: NativeConfig;
    export default Config;
}
