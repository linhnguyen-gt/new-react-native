#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const { parseEnvFile } = require('./lib/parse-env-file.cjs');
const { DEFAULT_VARIANT, PUBLISHED_ENV_KEYS, VARIANTS } = require('./lib/variant-config.cjs');

console.log('🔍 Checking environment configuration...');

const envFile = VARIANTS[DEFAULT_VARIANT].envFile;
const envPath = path.join(process.cwd(), envFile);

if (!fs.existsSync(envPath)) {
    console.error(`❌ ${envFile} file not found!`);
    console.error('Please run "pnpm env:setup" to create environment configuration.');
    process.exit(1);
}

// Parsed rather than substring-matched. `contents.includes('API_URL=')` — what this used
// to do — is satisfied by a commented-out `# API_URL=`, so the check passed on a file
// app.config.ts then rejected, with an error naming the config instead of the comment.
const envVars = parseEnvFile(envPath);

if (Object.keys(envVars).length === 0) {
    console.error(`❌ ${envFile} defines no variables!`);
    console.error('Please run "pnpm env:setup" to configure environment variables.');
    process.exit(1);
}

// An empty value is as broken as an absent one: app.config.ts rejects both.
const missingVars = PUBLISHED_ENV_KEYS.filter((varName) => !envVars[varName]);

if (missingVars.length > 0) {
    console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
    console.error('Please run "pnpm env:setup" to configure all required variables.');
    process.exit(1);
}

console.log('✅ Environment configuration is valid!');
console.log('🚀 Proceeding with build...');
