const { AndroidConfig, withStringsXml } = require('expo/config-plugins');

/**
 * Sets the Android launcher label per environment.
 *
 * Expo derives `app_name` from the top-level `name`, but `name` has to stay constant across
 * environments: prebuild also derives the Xcode project directory from it, so varying it would
 * rename ios/<name>.xcodeproj on every environment switch. iOS gets its per-environment label
 * from `ios.infoPlist.CFBundleDisplayName`; ExpoConfig has no Android equivalent, which is why
 * this mod exists.
 *
 * `AndroidConfig.Strings.setStringItem` replaces an existing entry of the same name, so this is
 * idempotent across repeated prebuilds.
 */
const withAndroidAppName = (config, { appName } = {}) => {
    if (!appName) {
        throw new Error('with-android-app-name requires an `appName` option.');
    }

    return withStringsXml(config, (stringsConfig) => {
        stringsConfig.modResults = AndroidConfig.Strings.setStringItem(
            [{ $: { name: 'app_name' }, _: appName }],
            stringsConfig.modResults
        );

        return stringsConfig;
    });
};

module.exports = withAndroidAppName;
