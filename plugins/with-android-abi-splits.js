const { withAppBuildGradle } = require('expo/config-plugins');

/**
 * Restores the per-ABI APK split that the bare project carried before CNG.
 *
 * expo-build-properties has no option for this, so the block has to be injected into the
 * generated app/build.gradle directly.
 */

const ABI_SPLITS_BLOCK = `
    splits {
        abi {
            reset()
            enable true
            universalApk true
            include 'armeabi-v7a', 'arm64-v8a', 'x86', 'x86_64'
        }
    }`;

/**
 * Anchor: the androidResources block Expo's template emits last inside `android { … }`.
 * Matching on its closing brace puts the splits block inside the android closure without
 * having to balance braces ourselves.
 */
const ANCHOR = `    androidResources {
        ignoreAssetsPattern '!.svn:!.git:!.ds_store:!*.scc:!CVS:!thumbs.db:!picasa.ini:!*~'
    }`;

const withAndroidAbiSplits = (config) =>
    withAppBuildGradle(config, (gradleConfig) => {
        const { language } = gradleConfig.modResults;
        if (language !== 'groovy') {
            throw new Error(
                `with-android-abi-splits expects a Groovy app/build.gradle, received "${language}". ` +
                    'String matching cannot be trusted against a Kotlin DSL template.'
            );
        }

        // Idempotent: prebuild may run against an already-modified tree.
        if (gradleConfig.modResults.contents.includes('splits {')) {
            return gradleConfig;
        }

        if (!gradleConfig.modResults.contents.includes(ANCHOR)) {
            throw new Error(
                'with-android-abi-splits could not find the androidResources anchor in ' +
                    'app/build.gradle. The Expo template changed; update the anchor rather than ' +
                    'letting the ABI split silently disappear.'
            );
        }

        gradleConfig.modResults.contents = gradleConfig.modResults.contents.replace(
            ANCHOR,
            `${ANCHOR}\n${ABI_SPLITS_BLOCK}`
        );

        return gradleConfig;
    });

module.exports = withAndroidAbiSplits;
