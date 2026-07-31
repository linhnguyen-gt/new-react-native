import { Platform } from 'react-native';

/** Replaces `@gluestack-ui/nativewind-utils/IsWeb`. */
export const isWeb = Platform.OS === 'web';
