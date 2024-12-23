const { execSync } = require("child_process");
const fs = require("fs");
const readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout
});

const runCommand = (command) => {
    try {
        execSync(command, { stdio: "inherit" });
        return true;
    } catch (error) {
        if (command.startsWith("yarn")) {
            const npmCommand = command.replace("yarn", "npx");
            try {
                execSync(npmCommand, { stdio: "inherit" });
                return true;
            } catch (npmError) {
                console.error(`Failed to execute ${npmCommand}`, npmError);
                return false;
            }
        }
        console.error(`Failed to execute ${command}`, error);
        return false;
    }
};

const question = (query) => new Promise((resolve) => readline.question(query, resolve));

const createEnvFile = async (existingVaultKey = null, envVarsFromVault = {}) => {
    let envVars = { ...envVarsFromVault }; // Start with values from vault

    console.log("\n📝 Setting up environment variables...");

    if (existingVaultKey) {
        envVars.DOTENV_VAULT = existingVaultKey;
    }

    console.log("\nCurrent values from vault:");
    Object.entries(envVarsFromVault).forEach(([key, value]) => {
        console.log(`${key}=${value}`);
    });

    if (!envVars.API_URL || envVars.API_URL.trim() === "") {
        const apiUrl = await question("\nEnter API_URL (e.g., https://api.example.com): ");
        envVars.API_URL = apiUrl;
    }

    if (!envVars.VERSION_CODE) {
        envVars.VERSION_CODE = "1";
    }
    if (!envVars.VERSION_NAME) {
        envVars.VERSION_NAME = "1.0.0";
    }

    let addMore = true;
    while (addMore) {
        const answer = await question("\nWould you like to add another environment variable? (y/n): ");
        if (answer.toLowerCase() === "y") {
            const newVar = await question("Enter variable name (e.g., GOOGLE_API_KEY): ");
            if (newVar && !(newVar in envVars)) {
                const value = await question(`Enter value for ${newVar}: `);
                envVars[newVar] = value;
                console.log(`✅ Added ${newVar}=${value} to environment variables`);
            }
        } else {
            addMore = false;
        }
    }

    const envContent = Object.entries(envVars)
        .filter(([key]) => key !== "DOTENV_VAULT") // Exclude DOTENV_VAULT from .env files
        .map(([key, value]) => `${key}=${value}`)
        .join("\n");

    try {
        fs.writeFileSync(".env", envContent);
        console.log("\n✅ Updated .env file");

        const envExample = Object.keys(envVars)
            .filter((key) => key !== "DOTENV_VAULT")
            .map((key) => `${key}=${key === "VERSION_CODE" ? "1" : key === "VERSION_NAME" ? "1.0.0" : ""}`)
            .join("\n");

        if (!fs.existsSync(".env.example")) {
            fs.writeFileSync(".env.example", envExample);
            console.log("✅ Created .env.example file");
        }

        console.log("\n⚠️ Environment files updated with the following variables:");
        Object.entries(envVars)
            .filter(([key]) => key !== "DOTENV_VAULT")
            .forEach(([key, value]) => {
                console.log(`${key}=${value}`);
            });

        readline.close();
        return true;
    } catch (error) {
        console.error("Failed to create env files:", error);
        readline.close();
        return false;
    }
};

const updateGitignore = () => {
    const gitignoreContent = `
# env files
.env*
!.env.vault
!.env.example
`;

    try {
        let currentContent = "";
        if (fs.existsSync(".gitignore")) {
            currentContent = fs.readFileSync(".gitignore", "utf8");
        }

        if (!currentContent.includes(".env.vault")) {
            fs.appendFileSync(".gitignore", gitignoreContent);
            console.log("✅ Updated .gitignore");
        }

        return true;
    } catch (error) {
        console.error("Failed to update .gitignore:", error);
        return false;
    }
};

const main = async () => {
    console.log("🚀 Starting environment setup...");

    let vaultKey = null;
    let useVault = false;
    let isNewVault = false;
    let envVarsFromVault = {};

    if (fs.existsSync(".env.vault")) {
        try {
            const vaultContent = fs.readFileSync(".env.vault", "utf8");
            const match = vaultContent.match(/DOTENV_VAULT=(.*)/);
            if (match && match[1]) {
                vaultKey = match[1].trim();
                useVault = true;
                console.log("✅ Found existing .env.vault file");

                console.log("\n📥 Pulling from vault...");
                if (!runCommand("npx dotenv-vault@latest pull")) {
                    process.exit(1);
                }

                if (fs.existsSync(".env")) {
                    try {
                        const envContent = fs.readFileSync(".env", "utf8");
                        envContent.split("\n").forEach((line) => {
                            const [key, value] = line.split("=");
                            if (key && value) {
                                envVarsFromVault[key.trim()] = value.trim();
                            }
                        });
                        console.log("\nLoaded environment variables from .env:");
                        Object.entries(envVarsFromVault).forEach(([key, value]) => {
                            console.log(`${key}=${value}`);
                        });
                    } catch (error) {
                        console.error("Failed to read .env file:", error);
                    }
                }
            }
        } catch (error) {
            console.error("Failed to read .env.vault file:", error);
        }
    }

    if (!useVault) {
        const wantVault = await question("\nWould you like to use DOTENV_VAULT? (y/n): ");
        useVault = wantVault.toLowerCase() === "y";

        if (useVault) {
            const vaultKey = await question("\nEnter your DOTENV_VAULT key: ");
            if (vaultKey) {
                try {
                    fs.writeFileSync(".env.vault", `DOTENV_VAULT=${vaultKey}`);
                    console.log("✅ Created .env.vault file");

                    console.log("\n📥 Pulling existing environment variables...");
                    if (!runCommand("npx dotenv-vault@latest pull")) {
                        process.exit(1);
                    }

                    if (fs.existsSync(".env")) {
                        try {
                            const envContent = fs.readFileSync(".env", "utf8");
                            envContent.split("\n").forEach((line) => {
                                const [key, value] = line.split("=");
                                if (key && value) {
                                    envVarsFromVault[key.trim()] = value.trim();
                                }
                            });
                            console.log("\nLoaded environment variables from .env:");
                            Object.entries(envVarsFromVault).forEach(([key, value]) => {
                                console.log(`${key}=${value}`);
                            });
                        } catch (error) {
                            console.error("Failed to read .env file:", error);
                        }
                    }
                } catch (error) {
                    console.error("Failed to create .env.vault file:", error);
                    process.exit(1);
                }
            }
        }

        if (!useVault) {
            try {
                console.log("\n📦 Creating new dotenv-vault...");
                if (!runCommand("npx dotenv-vault@latest new")) {
                    process.exit(1);
                }
                isNewVault = true;
            } catch (error) {
                console.error("Failed to check existing project:", error);
            }
        }
    }

    console.log("\n📝 Creating environment files...");
    if (!(await createEnvFile(vaultKey, envVarsFromVault))) {
        process.exit(1);
    }

    if (isNewVault) {
        console.log("\n🔑 Logging in to dotenv-vault...");
        if (!runCommand("npx dotenv-vault@latest login")) {
            process.exit(1);
        }

        console.log("\n⬆️ Pushing initial environment...");
        if (!runCommand("npx dotenv-vault@latest push")) {
            process.exit(1);
        }
    }

    if (!updateGitignore()) {
        process.exit(1);
    }

    console.log("\n✨ Environment setup completed successfully!");
    console.log("\n📝 Next steps:");
    console.log("1. Review your .env files");
    if (useVault) {
        console.log("2. Commit the .env.vault file");
        console.log("3. Share the .env.vault credentials with your team");
    }
};

main().catch(console.error);
