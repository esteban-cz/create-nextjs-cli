#!/usr/bin/env node
import { exec } from "child_process";
import inquirer from "inquirer";
import ora from "ora";
import chalk from "chalk";
import gradient from "gradient-string";
import fs from "fs";
import path from "path";

function runCommand(command, options = {}) {
  return new Promise((resolve, reject) => {
    exec(command, options, (error, stdout, stderr) => {
      if (error) {
        return reject(new Error(`${error.message}\n${stderr}`));
      }
      resolve(stdout);
    });
  });
}

process.on("SIGINT", () => {
  console.log(chalk.red("\n✖ Aborted by user."));
  process.exit(1);
});

const custom = gradient(["#5c00d6", "#671eac", "#d047d4", "#ff4b9a"]);

async function run() {
  const rawAscii = String.raw`
  ___  ____  ____   __  ____  ____    ____  ____  _  _  _  _  __      __   ____  ____ 
 / __)(  _ \(  __) / _\(_  _)(  __)  / ___)(_  _)( \/ )( \/ )/  \    / _\ (  _ \(  _ \
( (__  )   / ) _) /    \ )(   ) _)   \___ \  )(   )  /  )  ((  O )  /    \ ) __/ ) __/
 \___)(__\_)(____)\_/\_/(__) (____)  (____/ (__) (__/  (_/\_)\__\)  \_/\_/(__)  (__)  
`;

  console.log(chalk.bold(custom.multiline(rawAscii)));
  console.log(
    chalk.cyan.bold(
      "\n                   Build smart. Build fast. Build with StyxQ 🚀\n"
    )
  );

  let answers;
  try {
    answers = await inquirer.prompt([
      {
        type: "input",
        name: "projectName",
        message: "What would you like to name your app?",
        default: "styxq-nextjs-app",
        validate: (input) => {
          if (!input)
            return "⚠️  Project name cannot be empty. (type `.` for current directory)";
          if (input === ".") return true;
          if (fs.existsSync(path.resolve(process.cwd(), input))) {
            return `⚠️  Directory "${input}" already exists. Please choose a different name.`;
          }
          return true;
        },
      },
      {
        type: "confirm",
        name: "supabaseUsage",
        message: "Use supabase in your project?",
        default: true,
      },
      {
        type: "confirm",
        name: "languageSupport",
        message: "Add language support with translations?",
        default: false,
        when: (answers) => answers.supabaseUsage === false,
      },
      {
        type: "confirm",
        name: "installDependencies",
        message: "Install all dependencies now?",
        default: true,
      },
    ]);
  } catch (err) {
    console.log(chalk.red("\n✖ Aborted by user."));
    process.exit(1);
  }

  const branch = answers.supabaseUsage
    ? "supabase"
    : answers.languageSupport
    ? "locale"
    : "main";
  const target = answers.projectName === "." ? "" : answers.projectName;
  const scaffoldCommand =
    `npx degit esteban-cz/nextjs-starter#${branch} ${target}`.trim();
  const scaffoldSpinner = ora("Creating Next.js app...").start();

  try {
    await runCommand(scaffoldCommand);
    scaffoldSpinner.succeed(`${answers.projectName} scaffolded successfully!`);

    if (answers.installDependencies) {
      const installSpinner = ora("Installing all dependencies...").start();
      const cwdDir =
        answers.projectName === "." ? process.cwd() : answers.projectName;
      await runCommand("npm i", { cwd: cwdDir });
      installSpinner.succeed("Dependencies installed successfully!");
    }

    console.log(
      `${chalk.green("\n✔ ")}${chalk.cyan.bold(
        "Your StyxQ-powered Next.js app is ready!"
      )}`
    );
    console.log(chalk.cyan("\nNext steps:"));
    if (answers.projectName !== ".") {
      console.log(
        `${chalk.cyan("  cd ")}${chalk.cyan.bold(answers.projectName)}`
      );
    }
    if (!answers.installDependencies) {
      console.log(chalk.cyan("  npm i"));
    }
    console.log(chalk.cyan("  npm run dev\n"));
    console.log(chalk.bold("Happy coding with StyxQ! 🚀\n"));
  } catch (error) {
    scaffoldSpinner.fail(`Error: ${error.message}`);
    process.exit(1);
  }
}

run();
