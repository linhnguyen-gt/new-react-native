/**
 * First-run environment setup.
 *
 * EAS is the source of truth for environment variables; the `.env` files this script
 * writes are local copies, for working offline and for the tools that read files
 * (`check-env.js`, and react-native-config, which compiles `.env` into the native build).
 * Nothing here encrypts or stores anything — pulling from EAS is one option, filling the
 * files in by hand is the other, and both end at the same three files.
 *
 * This replaced a dotenv-vault wizard. That flow shelled out to `npx dotenv-vault@latest`
 * for a service the project no longer uses, wrote a `DOTENV_VAULT` key into every env
 * file, and re-appended a `!.env.vault` whitelist to `.gitignore` on every run — which is
 * how that file ended up with the same block twice.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});

const { spawnSync } = require('child_process');

const { parseEnvFile } = require('./lib/parse-env-file.cjs');
const { PUBLISHED_ENV_KEYS, VARIANTS } = require('./lib/variant-config.cjs');

const SCRIPTS_DIR = __dirname;

const DEFAULT_API_URLS = {
    development: 'http://localhost:3000',
    staging: 'https://api-staging.example.com',
    production: 'https://api.example.com',
};

const ENVIRONMENTS = Object.entries(VARIANTS).map(([key, variant]) => ({ key, ...variant }));

const getPackageName = () => {
    try {
        const packageJsonPath = path.join(process.cwd(), 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            return JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')).name || 'MyApp';
        }
    } catch (error) {
        console.warn('Failed to read package.json:', error);
    }
    return 'MyApp';
};

const question = (query) => new Promise((resolve) => readline.question(query, resolve));

const runEnvSync = (direction) => {
    const result = spawnSync('node', [path.join(SCRIPTS_DIR, 'env-sync.cjs'), direction], { stdio: 'inherit' });
    return !result.error && result.status === 0;
};

const createEnvFile = async (environment) => {
    const { key: envKey, envFile } = environment;

    if (fs.existsSync(envFile)) {
        const content = fs.readFileSync(envFile, 'utf8');
        if (content.trim().length > 0) {
            console.log(`\n📝 ${envFile} already exists and has content.`);
            const overwrite = await question(`Do you want to overwrite ${envFile}? (y/n): `);
            if (overwrite.toLowerCase() !== 'y') {
                console.log(`✅ Keeping existing ${envFile}`);
                return parseEnvFile(envFile);
            }
        }
    }

    console.log(`\n📝 Setting up ${envKey} environment in ${envFile}...`);

    const envVars = {};

    // APP_FLAVOR must equal the variant that selected this file: app.config.ts refuses to
    // resolve when they disagree, because environment.isStaging() would otherwise answer
    // for the wrong environment.
    envVars.APP_FLAVOR = envKey;

    const defaultUrl = DEFAULT_API_URLS[envKey];
    const apiUrl = await question(`Enter API_URL for ${envKey} (default: ${defaultUrl}): `);
    envVars.API_URL = apiUrl || defaultUrl;

    envVars.VERSION_CODE = '1';
    envVars.VERSION_NAME = '1.0.0';

    const defaultAppName = `${getPackageName()} ${envKey}`;
    const appName = await question(`Enter APP_NAME for ${envKey} (default: ${defaultAppName}): `);
    envVars.APP_NAME = appName || defaultAppName;

    // Key names only. Printing values leaks them into whatever captures stdout — CI logs,
    // tmux scrollback, a screen share.
    console.log('\nCurrent environment variables:');
    Object.keys(envVars).forEach((key) => console.log(`  ${key}`));

    let addMore = true;
    while (addMore) {
        const answer = await question(`\nWould you like to add another environment variable for ${envKey}? (y/n): `);
        if (answer.toLowerCase() === 'y') {
            const newVar = await question('Enter variable name: ');
            if (newVar && !(newVar in envVars)) {
                const value = await question(`Enter value for ${newVar}: `);
                envVars[newVar] = value;
                console.log(`✅ Added ${newVar}`);
            }
        } else {
            addMore = false;
        }
    }

    const envContent = `# ${envKey}\n${Object.entries(envVars)
        .map(([key, value]) => `${key}=${value}`)
        .join('\n')}\n`;

    try {
        fs.writeFileSync(envFile, envContent);
        console.log(`\n✅ Created ${envFile}`);
        return envVars;
    } catch (error) {
        console.error(`Failed to create ${envFile}:`, error);
        return null;
    }
};

const createEnvExample = (envVars) => {
    // `.env.example` is committed and hand-maintained: it carries the two dotenv parsing
    // rules, the "everything here ships inside the binary" warning and the EAS commands.
    // Regenerating it from one local run would drop all of that, so this only fills in a
    // missing file.
    if (fs.existsSync('.env.example')) {
        console.log('✅ Keeping existing .env.example');
        return true;
    }

    const exampleContent = `# Template only — copy to .env, .env.staging or .env.production and fill in.
#
# NOT A PLACE FOR SECRETS. Every variable here is compiled into the native binary by
# react-native-config and into the app manifest by app.config.ts, so treat all of it as
# publicly readable by anyone who installs the app.
#
# The shared values live in EAS (expo.dev). Pull them with:
#   pnpm env:pull            # all variants
#   pnpm env:pull staging    # one variant

# Environment: development | staging | production
APP_FLAVOR=development

# App Configuration
APP_NAME=MyApp

# Version
VERSION_CODE=1
VERSION_NAME=1.0.0

# API Configuration
API_URL=http://localhost:3000
${Object.keys(envVars)
    .filter((key) => !PUBLISHED_ENV_KEYS.includes(key))
    .map((key) => `${key}=`)
    .join('\n')}
`;

    try {
        fs.writeFileSync('.env.example', exampleContent);
        console.log('✅ Created .env.example file');
        return true;
    } catch (error) {
        console.error('Failed to create .env.example:', error);
        return false;
    }
};

const main = async () => {
    console.log('🚀 Starting environment setup...');

    console.log('\n📋 How this project handles environment variables:');
    console.log('- EAS (expo.dev) holds the shared values, one set per environment');
    console.log(`- ${ENVIRONMENTS.map((env) => `${env.key} → EAS "${env.easEnvironment}"`).join(', ')}`);
    console.log('- The local .env files are copies, for working offline and for the build scripts');
    console.log('- Docs: https://docs.expo.dev/eas/environment-variables/');

    const pullAnswer = await question(
        '\nPull the values from EAS now? Requires an EAS project (`eas init`) and `eas login`.\n' +
            "Enter 'y' to pull, or 'n' to fill the files in by hand: "
    );

    let pulled = false;
    if (pullAnswer.trim().toLowerCase() === 'y') {
        pulled = runEnvSync('pull');
        if (!pulled) {
            console.log('\n⚠️ Pull failed. Continuing with manual setup — nothing was overwritten.');
        }
    }

    console.log('\n📝 Creating environment files...');
    const envVarsResults = {};
    for (const environment of ENVIRONMENTS) {
        const envVars = await createEnvFile(environment);
        if (!envVars) {
            process.exit(1);
        }
        envVarsResults[environment.key] = envVars;
    }

    if (!createEnvExample(envVarsResults.development || {})) {
        process.exit(1);
    }

    // Only offered when the files were filled in locally. After a successful pull the
    // files already match EAS, and pushing them straight back would overwrite whatever a
    // teammate changed in between with values this run never looked at.
    if (!pulled) {
        const pushAnswer = await question('\nPush these values up to EAS so the team shares them? (y/n): ');
        if (pushAnswer.trim().toLowerCase() === 'y' && !runEnvSync('push')) {
            console.log('⚠️ Push failed. The local files are fine; run `pnpm env:push` again once `eas login` works.');
        }
    }

    console.log('\n✨ Environment setup completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Review your environment files:');
    ENVIRONMENTS.forEach((env) => console.log(`   - ${env.envFile} (${env.key})`));
    console.log('2. Keep them out of git — only .env.example is committed');
    console.log('3. Run a JS command against EAS values without any file:');
    console.log('   pnpm env:exec staging -- pnpm exec expo export');
    console.log('   (native builds read the file, so run "pnpm env:pull <variant>" before those)');

    readline.close();
};

main().catch((error) => {
    console.error(error);
    readline.close();
    process.exit(1);
});
