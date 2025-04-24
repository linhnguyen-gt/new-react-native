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
        const schemesDir = path.join(projectDir, "ios", `${oldName}.xcodeproj/xcshareddata/xcschemes`);

        if (fs.existsSync(schemesDir)) {
            const schemeFiles = fs.readdirSync(schemesDir).filter((file) => file.endsWith(".xcscheme"));

            schemeFiles.forEach((schemeFile) => {
                const schemeFilePath = path.join(schemesDir, schemeFile);
                const newSchemeFileName = schemeFile.replace(oldName, newName);
                const newSchemeFilePath = path.join(schemesDir, newSchemeFileName);

                let content = fs.readFileSync(schemeFilePath, "utf8");

                content = content.replace(new RegExp(oldName, "g"), newName);

                fs.writeFileSync(newSchemeFilePath, content);

                if (schemeFile !== newSchemeFileName) {
                    fs.unlinkSync(schemeFilePath);
                }

                console.log(chalk.green(`✅ Updated scheme: ${newSchemeFileName}`));
            });
        } else {
            console.log(chalk.yellow(`⚠️ Schemes directory not found: ${schemesDir}`));
        }
    }

    function updateIOSProjectFiles(projectDir, oldName, newName) {
        console.log(chalk.yellow("\n🔄 Updating iOS project files..."));

        const iosDir = path.join(projectDir, "ios");

        const oldProjectDir = path.join(iosDir, `${oldName}.xcodeproj`);
        const newProjectDir = path.join(iosDir, `${newName}.xcodeproj`);

        if (fs.existsSync(oldProjectDir) && oldName !== newName) {
            fs.renameSync(oldProjectDir, newProjectDir);
            console.log(chalk.green(`✅ Renamed project directory: ${oldName}.xcodeproj -> ${newName}.xcodeproj`));
        }

        const oldWorkspaceDir = path.join(iosDir, `${oldName}.xcworkspace`);
        const newWorkspaceDir = path.join(iosDir, `${newName}.xcworkspace`);

        if (fs.existsSync(oldWorkspaceDir) && oldName !== newName) {
            fs.renameSync(oldWorkspaceDir, newWorkspaceDir);
            console.log(
                chalk.green(`✅ Renamed workspace directory: ${oldName}.xcworkspace -> ${newName}.xcworkspace`)
            );
        }

        const workspaceContentFile = path.join(newWorkspaceDir, "contents.xcworkspacedata");
        if (fs.existsSync(workspaceContentFile)) {
            let content = fs.readFileSync(workspaceContentFile, "utf8");
            content = content.replace(new RegExp(oldName, "g"), newName);
            fs.writeFileSync(workspaceContentFile, content);
            console.log(chalk.green(`✅ Updated workspace contents file`));
        }

        updateIOSSchemes(projectDir, oldName, newName);

        createNewIOSScheme(projectDir, newName);
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
                console.log(chalk.green("✅ README.md updated successfully"));
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
        .action(async (projectName, options) => {
            console.log(chalk.blue("🚀 Creating a new React Native project from template"));

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

                console.log(chalk.yellow("\n🔄 Configuring project..."));

                const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
                packageJson.name = projectName;
                fs.writeFileSync("package.json", JSON.stringify(packageJson, null, 2));

                const appJson = JSON.parse(fs.readFileSync("app.json", "utf8"));
                appJson.name = projectName;
                appJson.displayName = projectName;
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
                        if (options.useNpm) {
                            execSync("npm install", { stdio: "inherit" });
                        } else {
                            execSync("yarn install", { stdio: "inherit" });
                        }
                    } catch (error) {
                        console.log(
                            chalk.red("\n⚠️ Failed to install dependencies. You can install them manually later.")
                        );
                        console.log(chalk.yellow("Run 'yarn install' or 'npm install' in the project directory."));
                    }
                } else {
                    console.log(chalk.yellow("\n📥 Skipping dependency installation as requested."));
                }

                try {
                    console.log(chalk.yellow("\n🌐 Setting up environment..."));
                    execSync("yarn env:setup", { stdio: "inherit" });
                } catch (error) {
                    console.log(chalk.red("\n⚠️ Failed to set up environment. You can set it up manually later."));
                    console.log(chalk.yellow("Run 'yarn env:setup' in the project directory."));
                }

                try {
                    execSync("git init", { stdio: "inherit" });
                    execSync("git add .", { stdio: "inherit" });
                    execSync('git commit -m "Initial commit from template"', {
                        stdio: "inherit"
                    });
                } catch (error) {
                    console.log(chalk.red("\n⚠️ Failed to initialize git repository."));
                }

                if (options.repo) {
                    try {
                        console.log(chalk.yellow(`\n🚀 Pushing to GitHub repository: ${options.repo}`));
                        execSync(`git remote add origin ${options.repo}`, { stdio: "inherit" });
                        execSync("git push -u origin main", { stdio: "inherit" });
                    } catch (error) {
                        console.log(chalk.red("\n⚠️ Failed to push to GitHub repository."));
                    }
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

                updateIOSProjectFiles(process.cwd(), "NewReactNative", projectName);
                updateReadmeFile(process.cwd(), projectName);

                console.log(chalk.green(`\n✅ Project ${projectName} created successfully!`));
                console.log(chalk.blue("\n📝 Next steps:"));
                console.log(`1. cd ${projectName}`);
                if (options.skipInstall) {
                    console.log("2. yarn install or npm install");
                    console.log("3. yarn env:setup");
                    console.log("4. yarn ios or yarn android to run the app");
                } else {
                    console.log("2. yarn ios or yarn android to run the app");
                }
            } catch (error) {
                console.error(chalk.red("\n❌ Error creating project:"), error);
                process.exit(1);
            }
        });

    program.parse();
})();
