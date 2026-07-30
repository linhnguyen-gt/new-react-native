const { withAppBuildGradle } = require('expo/config-plugins');

/**
 * Wires react-native-config into the generated Android project.
 *
 * iOS needs no counterpart: react-native-config.podspec declares its own
 * `script_phase` at `execution_position: :before_compile`, so autolinking plus the
 * `pod install` that prebuild already runs is the whole integration there.
 *
 * dotenv.gradle picks the env file from the ENVFILE variable, falling back to `.env`.
 * Every run script must therefore export ENVFILE alongside APP_ENV — see the
 * cross-source guard in src/services/environment.ts for why a silent mismatch matters.
 */

const APPLY_LINE = 'apply from: project(\':react-native-config\').projectDir.getPath() + "/dotenv.gradle"';

/** Anchor: the last `apply plugin:` line Expo's template emits at the top of the file. */
const ANCHOR = 'apply plugin: "com.facebook.react"';

const withReactNativeConfig = (config) =>
    withAppBuildGradle(config, (gradleConfig) => {
        const { language } = gradleConfig.modResults;
        if (language !== 'groovy') {
            throw new Error(
                `with-react-native-config expects a Groovy app/build.gradle, received "${language}". ` +
                    'String matching cannot be trusted against a Kotlin DSL template.'
            );
        }

        // Idempotent: prebuild may run against an already-modified tree.
        if (gradleConfig.modResults.contents.includes('dotenv.gradle')) {
            return gradleConfig;
        }

        if (!gradleConfig.modResults.contents.includes(ANCHOR)) {
            throw new Error(
                'with-react-native-config could not find the react plugin anchor in ' +
                    'app/build.gradle. The Expo template changed; update the anchor rather than ' +
                    'shipping a build with no native env values.'
            );
        }

        gradleConfig.modResults.contents = gradleConfig.modResults.contents.replace(ANCHOR, `${ANCHOR}\n${APPLY_LINE}`);

        return gradleConfig;
    });

module.exports = withReactNativeConfig;
