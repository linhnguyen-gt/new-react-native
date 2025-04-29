#!/usr/bin/env node

const fs = require("fs");
const { execSync } = require("child_process");
const { program } = require("commander");
const path = require("path");

let chalk;
(async () => {
    chalk = (await import("chalk")).default;

    function replaceInFile(filePath, searchValue, replaceValue) {
        if (fs.existsSync(filePath)) {
            try {
                let content = fs.readFileSync(filePath, "utf8");
                content = content.replace(searchValue, replaceValue);
                fs.writeFileSync(filePath, content);
                return true;
            } catch (error) {
                console.log(chalk.red(`Error replacing in file ${filePath}: ${error.message}`));
                return false;
            }
        }
        return false;
    }

    function findAndReplaceInDirectory(directory, searchValue, replaceValue, fileExtensions = []) {
        try {
            if (!fs.existsSync(directory)) return;

            const items = fs.readdirSync(directory, { withFileTypes: true });

            for (const item of items) {
                const fullPath = path.join(directory, item.name);

                if (item.isDirectory()) {
                    if (item.name !== "node_modules" && item.name !== ".git") {
                        findAndReplaceInDirectory(fullPath, searchValue, replaceValue, fileExtensions);
                    }
                } else if (item.isFile()) {
                    if (fileExtensions.length === 0 || fileExtensions.some((ext) => item.name.endsWith(ext))) {
                        replaceInFile(fullPath, searchValue, replaceValue);
                    }
                }
            }
        } catch (error) {
            console.log(chalk.red(`Error searching directory ${directory}: ${error.message}`));
        }
    }

    function updateIOSSchemes(projectDir, oldName, newName) {
        console.log(chalk.yellow("\n🔄 Updating iOS schemes..."));

        const oldSchemesDir = path.join(projectDir, "ios", `${oldName}.xcodeproj/xcshareddata/xcschemes`);
        const newSchemesDir = path.join(projectDir, "ios", `${newName}.xcodeproj/xcshareddata/xcschemes`);

        if (fs.existsSync(oldSchemesDir)) {
            console.log(chalk.blue(`Found old schemes directory: ${oldSchemesDir}`));
            const schemeFiles = fs.readdirSync(oldSchemesDir).filter((file) => file.endsWith(".xcscheme"));

            if (schemeFiles.length === 0) {
                console.log(chalk.yellow(`⚠️ No scheme files found in old directory: ${oldSchemesDir}`));
            } else {
                console.log(chalk.blue(`Found ${schemeFiles.length} scheme files to process`));
            }

            schemeFiles.forEach((schemeFile) => {
                const schemeFilePath = path.join(oldSchemesDir, schemeFile);
                const newSchemeFileName = schemeFile.replace(oldName, newName);

                if (!fs.existsSync(newSchemesDir)) {
                    fs.mkdirSync(newSchemesDir, { recursive: true });
                    console.log(chalk.green(`✅ Created new schemes directory: ${newSchemesDir}`));
                }

                const newSchemeFilePath = path.join(newSchemesDir, newSchemeFileName);

                let content = fs.readFileSync(schemeFilePath, "utf8");
                content = content.replace(new RegExp(oldName, "g"), newName);

                fs.writeFileSync(newSchemeFilePath, content);
                console.log(chalk.green(`✅ Created updated scheme: ${newSchemeFileName}`));

                fs.unlinkSync(schemeFilePath);
                console.log(chalk.green(`✅ Removed old scheme: ${schemeFile}`));
            });
        } else if (fs.existsSync(newSchemesDir)) {
            console.log(chalk.yellow(`⚠️ Old schemes directory not found, checking new directory: ${newSchemesDir}`));

            const schemeFiles = fs.readdirSync(newSchemesDir).filter((file) => file.endsWith(".xcscheme"));

            if (schemeFiles.length === 0) {
                console.log(chalk.yellow(`⚠️ No scheme files found in new directory: ${newSchemesDir}`));
                console.log(chalk.blue(`Creating default scheme for ${newName}...`));
                createNewIOSScheme(projectDir, newName);
                return;
            } else {
                console.log(chalk.blue(`Found ${schemeFiles.length} scheme files to process in new directory`));
            }

            schemeFiles.forEach((schemeFile) => {
                const schemeFilePath = path.join(newSchemesDir, schemeFile);

                let content = fs.readFileSync(schemeFilePath, "utf8");
                let contentUpdated = false;

                if (content.includes(oldName)) {
                    content = content.replace(new RegExp(oldName, "g"), newName);
                    fs.writeFileSync(schemeFilePath, content);
                    console.log(chalk.green(`✅ Updated scheme content: ${schemeFile}`));
                    contentUpdated = true;
                }

                if (schemeFile.includes(oldName)) {
                    const newSchemeFileName = schemeFile.replace(oldName, newName);
                    const newSchemeFilePath = path.join(newSchemesDir, newSchemeFileName);

                    fs.renameSync(schemeFilePath, newSchemeFilePath);
                    console.log(chalk.green(`✅ Renamed scheme: ${schemeFile} -> ${newSchemeFileName}`));
                } else if (!contentUpdated) {
                    console.log(chalk.blue(`ℹ️ Scheme file ${schemeFile} already has correct name and content`));
                }
            });
        } else {
            console.log(chalk.yellow(`⚠️ Neither old nor new schemes directory found. Creating new directory...`));
            fs.mkdirSync(newSchemesDir, { recursive: true });
            console.log(chalk.green(`✅ Created schemes directory: ${newSchemesDir}`));
            console.log(chalk.blue(`Creating default scheme for ${newName}...`));
            createNewIOSScheme(projectDir, newName);
            return;
        }

        if (fs.existsSync(newSchemesDir)) {
            const remainingOldSchemes = fs
                .readdirSync(newSchemesDir)
                .filter((file) => file.includes(oldName) && file.endsWith(".xcscheme"));

            if (remainingOldSchemes.length > 0) {
                console.log(chalk.yellow(`Found ${remainingOldSchemes.length} remaining old scheme files to process`));

                remainingOldSchemes.forEach((oldScheme) => {
                    const oldSchemeFilePath = path.join(newSchemesDir, oldScheme);
                    const newSchemeFileName = oldScheme.replace(oldName, newName);
                    const newSchemeFilePath = path.join(newSchemesDir, newSchemeFileName);

                    let content = fs.readFileSync(oldSchemeFilePath, "utf8");
                    content = content.replace(new RegExp(oldName, "g"), newName);

                    fs.writeFileSync(newSchemeFilePath, content);
                    console.log(chalk.green(`✅ Created updated scheme: ${newSchemeFileName}`));

                    fs.unlinkSync(oldSchemeFilePath);
                    console.log(chalk.green(`✅ Removed leftover scheme: ${oldScheme}`));
                });
            } else {
                console.log(chalk.green(`✅ No remaining old scheme files found`));
            }

            const newSchemeFiles = fs
                .readdirSync(newSchemesDir)
                .filter((file) => file.includes(newName) && file.endsWith(".xcscheme"));

            if (newSchemeFiles.length === 0) {
                console.log(chalk.yellow(`⚠️ No scheme files with new name found. Creating default scheme...`));
                createNewIOSScheme(projectDir, newName);
            } else {
                console.log(chalk.green(`✅ Found ${newSchemeFiles.length} scheme files with new name`));
            }
        }
    }

    function updateIOSProjectFiles(projectDir, oldName, newName) {
        console.log(chalk.yellow("\n🔄 Updating iOS project files..."));

        const iosDir = path.join(projectDir, "ios");

        if (!fs.existsSync(iosDir)) {
            console.log(chalk.yellow(`⚠️ iOS directory not found: ${iosDir}`));
            return;
        }

        const oldProjectDir = path.join(iosDir, `${oldName}.xcodeproj`);
        const newProjectDir = path.join(iosDir, `${newName}.xcodeproj`);

        if (fs.existsSync(oldProjectDir) && oldName !== newName) {
            fs.renameSync(oldProjectDir, newProjectDir);
            console.log(chalk.green(`✅ Renamed project directory: ${oldName}.xcodeproj -> ${newName}.xcodeproj`));
        } else if (!fs.existsSync(newProjectDir)) {
            console.log(chalk.yellow(`⚠️ Neither old nor new project directory found.`));
            return;
        } else {
            console.log(chalk.blue(`ℹ️ Project directory already renamed to ${newName}.xcodeproj`));
        }

        const oldWorkspaceDir = path.join(iosDir, `${oldName}.xcworkspace`);
        const newWorkspaceDir = path.join(iosDir, `${newName}.xcworkspace`);

        if (fs.existsSync(oldWorkspaceDir) && oldName !== newName) {
            fs.renameSync(oldWorkspaceDir, newWorkspaceDir);
            console.log(
                chalk.green(`✅ Renamed workspace directory: ${oldName}.xcworkspace -> ${newName}.xcworkspace`)
            );
        } else if (fs.existsSync(newWorkspaceDir)) {
            console.log(chalk.blue(`ℹ️ Workspace directory already renamed to ${newName}.xcworkspace`));
        }

        const workspaceContentFile = path.join(newWorkspaceDir, "contents.xcworkspacedata");
        if (fs.existsSync(workspaceContentFile)) {
            let content = fs.readFileSync(workspaceContentFile, "utf8");
            if (content.includes(oldName)) {
                content = content.replace(new RegExp(oldName, "g"), newName);
                fs.writeFileSync(workspaceContentFile, content);
                console.log(chalk.green(`✅ Updated workspace contents file`));
            } else {
                console.log(chalk.blue(`ℹ️ Workspace contents file already updated`));
            }
        }

        updateIOSSchemes(projectDir, oldName, newName);
    }

    function createNewIOSScheme(projectDir, projectName) {
        console.log(chalk.yellow("\n🔄 Creating new iOS scheme..."));

        const schemesDir = path.join(projectDir, "ios", `${projectName}.xcodeproj/xcshareddata/xcschemes`);

        if (!fs.existsSync(schemesDir)) {
            fs.mkdirSync(schemesDir, { recursive: true });
        }

        const schemeContent = `<?xml version="1.0" encoding="UTF-8"?>
<Scheme
   LastUpgradeVersion = "1210"
   version = "1.3">
   <BuildAction
      parallelizeBuildables = "YES"
      buildImplicitDependencies = "YES">
      <BuildActionEntries>
         <BuildActionEntry
            buildForTesting = "YES"
            buildForRunning = "YES"
            buildForProfiling = "YES"
            buildForArchiving = "YES"
            buildForAnalyzing = "YES">
            <BuildableReference
               BuildableIdentifier = "primary"
               BlueprintIdentifier = "13B07F861A680F5B00A75B9A"
               BuildableName = "${projectName}.app"
               BlueprintName = "${projectName}"
               ReferencedContainer = "container:${projectName}.xcodeproj">
            </BuildableReference>
         </BuildActionEntry>
      </BuildActionEntries>
   </BuildAction>
   <TestAction
      buildConfiguration = "Debug"
      selectedDebuggerIdentifier = "Xcode.DebuggerFoundation.Debugger.LLDB"
      selectedLauncherIdentifier = "Xcode.DebuggerFoundation.Launcher.LLDB"
      shouldUseLaunchSchemeArgsEnv = "YES">
      <Testables>
      </Testables>
   </TestAction>
   <LaunchAction
      buildConfiguration = "Debug"
      selectedDebuggerIdentifier = "Xcode.DebuggerFoundation.Debugger.LLDB"
      selectedLauncherIdentifier = "Xcode.DebuggerFoundation.Launcher.LLDB"
      launchStyle = "0"
      useCustomWorkingDirectory = "NO"
      ignoresPersistentStateOnLaunch = "NO"
      debugDocumentVersioning = "YES"
      debugServiceExtension = "internal"
      allowLocationSimulation = "YES">
      <BuildableProductRunnable
         runnableDebuggingMode = "0">
         <BuildableReference
            BuildableIdentifier = "primary"
            BlueprintIdentifier = "13B07F861A680F5B00A75B9A"
            BuildableName = "${projectName}.app"
            BlueprintName = "${projectName}"
            ReferencedContainer = "container:${projectName}.xcodeproj">
         </BuildableReference>
      </BuildableProductRunnable>
   </LaunchAction>
   <ProfileAction
      buildConfiguration = "Release"
      shouldUseLaunchSchemeArgsEnv = "YES"
      savedToolIdentifier = ""
      useCustomWorkingDirectory = "NO"
      debugDocumentVersioning = "YES">
      <BuildableProductRunnable
         runnableDebuggingMode = "0">
         <BuildableReference
            BuildableIdentifier = "primary"
            BlueprintIdentifier = "13B07F861A680F5B00A75B9A"
            BuildableName = "${projectName}.app"
            BlueprintName = "${projectName}"
            ReferencedContainer = "container:${projectName}.xcodeproj">
         </BuildableReference>
      </BuildableProductRunnable>
   </ProfileAction>
   <AnalyzeAction
      buildConfiguration = "Debug">
   </AnalyzeAction>
   <ArchiveAction
      buildConfiguration = "Release"
      revealArchiveInOrganizer = "YES">
   </ArchiveAction>
</Scheme>`;

        const schemeFilePath = path.join(schemesDir, `${projectName}.xcscheme`);
        fs.writeFileSync(schemeFilePath, schemeContent);
        console.log(chalk.green(`✅ Created new scheme: ${projectName}.xcscheme`));
    }

    function updateReadmeFile(projectDir, projectName) {
        console.log(chalk.yellow("\n🔄 Updating README.md..."));

        const readmePath = path.join(projectDir, "README.md");
        if (fs.existsSync(readmePath)) {
            try {
                let content = fs.readFileSync(readmePath, "utf8");

                content = content.replace(
                    /<h1>🚀 New React Native Project<\/h1>/,
                    `<h1>🚀 ${projectName} Project</h1>`
                );

                content += `

## Created with [Linh Nguyen](https://github.com/linhnguyen-gt).
`;

                fs.writeFileSync(readmePath, content);
                console.log(chalk.grneen("✅ README.md updated successfully"));
            } catch (error) {
                console.log(chalk.red(`Error updating README.md: ${error.message}`));
            }
        } else {
            console.log(chalk.yellow("⚠️ README.md not found"));
        }
    }

    program
        .name("create-rn-with-redux-project")
        .description("Create a new React Native project from template")
        .argument("<project-name>", "Name of the project")
        .option("-b, --bundle-id <id>", "Bundle identifier", "com.example.app")
        .option("-r, --repo <url>", "GitHub repository URL")
        .option("--skip-install", "Skip installing dependencies")
        .option("--use-npm", "Use npm instead of yarn for installing dependencies")
        .option("--skip-env-setup", "Skip environment setup")
        .option("--skip-git", "Skip git initialization")
        .action(async (projectName, options) => {
            console.log(chalk.blue("🚀 Creating a new React Native project from template"));

            let dependencyInstallFailed = false;

            console.log(chalk.yellow(`\n📦 Creating project ${projectName}...`));
            try {
                execSync(`git clone https://github.com/linhnguyen-gt/new-react-native.git ${projectName}`, {
                    stdio: "inherit"
                });

                process.chdir(projectName);

                execSync("rm -rf .git", { stdio: "inherit" });
                if (fs.existsSync(".env.vault")) {
                    execSync("rm -rf .env.vault", { stdio: "inherit" });
                    console.log(chalk.yellow("Removed template .env.vault file"));
                }
                if (fs.existsSync("create-rn-with-redux-project")) {
                    execSync("rm -rf create-rn-with-redux-project", { stdio: "inherit" });
                }

                console.log(chalk.yellow("\n🔄 Configuring project..."));

                const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
                packageJson.name = projectName;
                fs.writeFileSync("package.json", JSON.stringify(packageJson, null, 2));

                const appJson = JSON.parse(fs.readFileSync("app.json", "utf8"));
                appJson.name = projectName;
                fs.writeFileSync("app.json", JSON.stringify(appJson, null, 2));

                console.log(chalk.yellow("\n🔄 Renaming project comprehensively..."));

                const fileExtensions = [
                    ".js",
                    ".jsx",
                    ".ts",
                    ".tsx",
                    ".java",
                    ".kt",
                    ".swift",
                    ".m",
                    ".h",
                    ".gradle",
                    ".pbxproj",
                    ".plist",
                    ".xml",
                    ".json",
                    ".yaml",
                    ".yml",
                    ".xcscheme",
                    ".xcworkspacedata",
                    ".storyboard",
                    ".xib",
                    ".podspec"
                ];

                findAndReplaceInDirectory(".", /NewReactNative/g, projectName, fileExtensions);
                findAndReplaceInDirectory(".", /newreactnative/g, projectName.toLowerCase(), fileExtensions);
                findAndReplaceInDirectory(".", /com\.newreactnative/g, options.bundleId, fileExtensions);

                console.log(chalk.yellow("\n🔄 Renaming Android directories..."));
                const androidSrcDir = "android/app/src/main/java/com";
                if (fs.existsSync(`${androidSrcDir}/newreactnative`)) {
                    const packageParts = options.bundleId.split(".");

                    let packagePath = "";
                    let fullPackagePath = androidSrcDir;

                    for (const part of packageParts) {
                        if (part !== "com") {
                            packagePath = packagePath ? `${packagePath}/${part}` : part;
                            fullPackagePath = `${androidSrcDir}/${packagePath}`;

                            if (!fs.existsSync(fullPackagePath)) {
                                fs.mkdirSync(fullPackagePath, { recursive: true });
                            }
                        }
                    }

                    const newPackagePath = `${androidSrcDir}/${packagePath}`;

                    try {
                        const files = fs.readdirSync(`${androidSrcDir}/newreactnative`);
                        for (const file of files) {
                            const srcFile = `${androidSrcDir}/newreactnative/${file}`;
                            const destFile = `${newPackagePath}/${file}`;

                            fs.copyFileSync(srcFile, destFile);

                            if (file.endsWith(".java") || file.endsWith(".kt")) {
                                replaceInFile(destFile, /package com\.newreactnative/g, `package ${options.bundleId}`);
                            }
                        }

                        execSync(`rm -rf ${androidSrcDir}/newreactnative`, { stdio: "inherit" });

                        console.log(chalk.green(`✅ Android package renamed to ${options.bundleId}`));
                    } catch (error) {
                        console.log(chalk.red(`Error copying Android files: ${error.message}`));
                    }
                }

                console.log(chalk.yellow("\n🔄 Renaming iOS directories..."));
                const iosDir = "ios";
                if (fs.existsSync(`${iosDir}/NewReactNative`)) {
                    execSync(`mv ${iosDir}/NewReactNative ${iosDir}/${projectName}`, { stdio: "inherit" });
                }
                if (fs.existsSync(`${iosDir}/NewReactNative-Staging`)) {
                    execSync(`mv ${iosDir}/NewReactNative-Staging ${iosDir}/${projectName}-Staging`, {
                        stdio: "inherit"
                    });
                }
                if (fs.existsSync(`${iosDir}/NewReactNative-Production`)) {
                    execSync(`mv ${iosDir}/NewReactNative-Production ${iosDir}/${projectName}-Production`, {
                        stdio: "inherit"
                    });
                }
                if (fs.existsSync(`${iosDir}/NewReactNative.xcodeproj`)) {
                    execSync(`mv ${iosDir}/NewReactNative.xcodeproj ${iosDir}/${projectName}.xcodeproj`, {
                        stdio: "inherit"
                    });
                }
                if (fs.existsSync(`${iosDir}/NewReactNative.xcworkspace`)) {
                    execSync(`mv ${iosDir}/NewReactNative.xcworkspace ${iosDir}/${projectName}.xcworkspace`, {
                        stdio: "inherit"
                    });
                }

                const appDelegatePath = `${iosDir}/${projectName}/AppDelegate.swift`;
                if (fs.existsSync(appDelegatePath)) {
                    replaceInFile(
                        appDelegatePath,
                        /self\.moduleName = "NewReactNative"/g,
                        `self.moduleName = "${projectName}"`
                    );
                }

                const xcschemeDir = `${iosDir}/${projectName}.xcodeproj/xcshareddata/xcschemes`;
                if (fs.existsSync(xcschemeDir)) {
                    findAndReplaceInDirectory(xcschemeDir, /NewReactNative/g, projectName, [".xcscheme"]);
                }

                const podsDir = `${iosDir}/Pods`;
                if (fs.existsSync(podsDir)) {
                    findAndReplaceInDirectory(podsDir, /NewReactNative/g, projectName, fileExtensions);
                }

                const podfilePath = `${iosDir}/Podfile`;
                if (fs.existsSync(podfilePath)) {
                    console.log(chalk.yellow("\n🔄 Updating Podfile..."));
                    replaceInFile(podfilePath, /project 'NewReactNative'/g, `project '${projectName}'`);
                    replaceInFile(podfilePath, /target 'NewReactNative'/g, `target '${projectName}'`);
                    replaceInFile(podfilePath, /target 'NewReactNative-Staging'/g, `target '${projectName}-Staging'`);
                    replaceInFile(
                        podfilePath,
                        /target 'NewReactNative-Production'/g,
                        `target '${projectName}-Production'`
                    );

                    replaceInFile(
                        podfilePath,
                        /if target\.name == 'NewReactNative'/g,
                        `if target.name == '${projectName}'`
                    );

                    console.log(chalk.green("✅ Podfile updated successfully"));
                }

                if (fs.existsSync(".expo")) {
                    console.log(chalk.yellow("\n🔄 Removing .expo directory..."));
                    try {
                        execSync("rm -rf .expo", { stdio: "inherit" });
                        console.log(chalk.green("✅ .expo directory removed successfully"));
                    } catch (error) {
                        console.log(chalk.red(`Error removing .expo directory: ${error.message}`));
                    }
                }

                if (!options.skipInstall) {
                    console.log(chalk.yellow("\n📥 Installing dependencies..."));
                    try {
                        const installTimeout = 600000;
                        const installOptions = {
                            stdio: "inherit",
                            timeout: installTimeout,
                            maxBuffer: 1024 * 1024 * 20
                        };

                        if (options.useNpm) {
                            console.log(chalk.blue("Using npm to install dependencies..."));
                            execSync("npm install", installOptions);
                        } else {
                            console.log(chalk.blue("Using yarn to install dependencies..."));

                            try {
                                execSync("yarn --version", { stdio: "ignore" });
                            } catch (yarnError) {
                                console.log(chalk.yellow("⚠️ Yarn not found. Installing yarn globally..."));
                                execSync("npm install -g yarn", { stdio: "inherit" });
                            }

                            try {
                                execSync("yarn install", installOptions);
                            } catch (yarnInstallError) {
                                console.log(chalk.yellow("⚠️ Yarn install failed, trying with --network-timeout..."));
                                execSync("yarn install --network-timeout 300000", installOptions);
                            }
                        }
                        console.log(chalk.green("✅ Dependencies installed successfully"));
                    } catch (error) {
                        dependencyInstallFailed = true;
                        console.log(chalk.red("\n⚠️ Failed to install dependencies. Error details:"));
                        console.log(chalk.red(error.message || "Unknown error"));
                        console.log(chalk.yellow("\nPossible solutions:"));
                        console.log(chalk.yellow("1. Check your internet connection"));
                        console.log(chalk.yellow("2. Try installing with npm: npm install"));
                        console.log(chalk.yellow("3. Try installing with yarn: yarn install --network-timeout 300000"));
                        console.log(chalk.yellow("4. Clear npm/yarn cache and try again:"));
                        console.log(chalk.yellow("   - npm: npm cache clean --force"));
                        console.log(chalk.yellow("   - yarn: yarn cache clean"));
                        console.log(chalk.yellow("\nYou can install dependencies manually later:"));
                        console.log(chalk.yellow(`cd ${projectName} && yarn install`));
                    }
                } else {
                    console.log(chalk.yellow("\n📥 Skipping dependency installation as requested."));
                }

                if (!options.skipEnvSetup) {
                    try {
                        console.log(chalk.yellow("\n🌐 Setting up environment..."));
                        execSync("yarn env:setup", { stdio: "inherit" });
                        console.log(chalk.green("✅ Environment setup completed successfully"));
                    } catch (error) {
                        console.log(chalk.red("\n⚠️ Failed to set up environment. You can set it up manually later."));
                        console.log(chalk.yellow("Run 'yarn env:setup' in the project directory."));
                    }
                } else {
                    console.log(chalk.yellow("\n🌐 Skipping environment setup as requested."));
                }

                if (!options.skipGit) {
                    try {
                        execSync("git init", { stdio: "inherit" });
                        execSync("git add .", { stdio: "inherit" });
                        execSync('git commit -m "Initial commit from template"', {
                            stdio: "inherit"
                        });
                        console.log(chalk.green("✅ Git repository initialized successfully"));
                    } catch (error) {
                        console.log(chalk.red("\n⚠️ Failed to initialize git repository."));
                    }

                    if (options.repo) {
                        try {
                            console.log(chalk.yellow(`\n🚀 Pushing to GitHub repository: ${options.repo}`));
                            execSync(`git remote add origin ${options.repo}`, { stdio: "inherit" });
                            execSync("git push -u origin main", { stdio: "inherit" });
                            console.log(chalk.green("✅ Code pushed to GitHub repository successfully"));
                        } catch (error) {
                            console.log(chalk.red("\n⚠️ Failed to push to GitHub repository."));
                            console.log(chalk.yellow("You can push manually later with:"));
                            console.log(chalk.yellow(`git remote add origin ${options.repo}`));
                            console.log(chalk.yellow("git push -u origin main"));
                        }
                    }
                } else {
                    console.log(chalk.yellow("\n🔄 Skipping git initialization as requested."));
                }

                console.log(chalk.yellow("\n🔄 Cleaning up temporary files and directories..."));
                const tempDirsToRemove = [
                    ".expo-shared",
                    ".expo",
                    "expo-debug.log",
                    "npm-debug.log",
                    "yarn-debug.log",
                    "yarn-error.log"
                ];

                for (const item of tempDirsToRemove) {
                    if (fs.existsSync(item)) {
                        try {
                            if (fs.lstatSync(item).isDirectory()) {
                                execSync(`rm -rf ${item}`, { stdio: "inherit" });
                            } else {
                                execSync(`rm ${item}`, { stdio: "inherit" });
                            }
                            console.log(chalk.green(`✅ Removed ${item}`));
                        } catch (error) {
                            console.log(chalk.red(`Error removing ${item}: ${error.message}`));
                        }
                    }
                }

                const oldSchemeFiles = [
                    `ios/${projectName}.xcodeproj/xcshareddata/xcschemes/NewReactNative.xcscheme`,
                    `ios/NewReactNative.xcodeproj/xcshareddata/xcschemes/${projectName}.xcscheme`,
                    `ios/NewReactNative.xcodeproj/xcshareddata/xcschemes/NewReactNative.xcscheme`
                ];

                oldSchemeFiles.forEach((schemeFile) => {
                    const fullPath = path.join(process.cwd(), schemeFile);
                    if (fs.existsSync(fullPath)) {
                        fs.unlinkSync(fullPath);
                        console.log(chalk.green(`✅ Removed leftover scheme file: ${schemeFile}`));
                    }
                });

                updateIOSProjectFiles(process.cwd(), "NewReactNative", projectName);
                updateReadmeFile(process.cwd(), projectName);

                console.log(chalk.green(`\n✅ Project ${projectName} created successfully!`));
                console.log(chalk.blue("\n📝 Next steps:"));
                console.log(`1. cd ${projectName}`);

                if (options.skipInstall) {
                    console.log("2. Install dependencies:");
                    console.log("   - With yarn: yarn install");
                    console.log("   - With npm: npm install");
                    console.log(
                        "   - If you encounter issues: yarn install --network-timeout 600000 or npm install --legacy-peer-deps"
                    );
                    console.log("3. Set up environment: yarn env:setup");
                    console.log("4. Run the app: yarn ios or yarn android");
                } else if (dependencyInstallFailed) {
                    console.log("2. Try installing dependencies again:");
                    console.log("   - With yarn: yarn install --network-timeout 600000");
                    console.log("   - With npm: npm install --legacy-peer-deps");
                    console.log("3. Run the app: yarn ios or yarn android");
                } else {
                    console.log("2. Run the app: yarn ios or yarn android");
                }

                console.log(chalk.blue("\n📚 Documentation:"));
                console.log("- React Native: https://reactnative.dev/docs/getting-started");
                console.log("- Redux Toolkit: https://redux-toolkit.js.org/introduction/getting-started");
                console.log("- React Navigation: https://reactnavigation.org/docs/getting-started");

                console.log(chalk.blue("\n🐞 Troubleshooting:"));
                console.log("- If you encounter issues with iOS, try: cd ios && pod install");
                console.log(
                    "- For Android issues, check your Android SDK setup and try: cd android && ./gradlew clean"
                );
                console.log("- For more help, visit: https://github.com/linhnguyen-gt/new-react-native/issues");
            } catch (error) {
                console.error(chalk.red("\n❌ Error creating project:"), error);
                process.exit(1);
            }
        });

    program.parse();
})();
