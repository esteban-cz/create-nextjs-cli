#!/usr/bin/env node
import { exec } from "child_process";
import inquirer from "inquirer";
import ora from "ora";
import chalk from "chalk";
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

async function run() {
  const asciiArt = String.raw`
 __ _  ____  _  _  ____      __  ____    ____  _  _    ____  ____  ____  _  _  _  _  __  
(  ( \(  __)( \/ )(_  _)   _(  )/ ___)  (  _ \( \/ )  (  __)/ ___)(_  _)( \/ )( \/ )/  \ 
/    / ) _)  )  (   )(  _ / \) \\___ \   ) _ ( )  /    ) _) \___ \  )(   )  /  )  ((  O )
\_)__)(____)(_/\_) (__)(_)\____/(____/  (____/(__/    (____)(____/ (__) (__/  (_/\_)\__\
`;
  console.log(chalk.bold(chalk.magenta(asciiArt)));

  let answers;
  try {
    answers = await inquirer.prompt([
      {
        type: "input",
        name: "projectName",
        message: "Project name:",
        default: "app-name",
        validate: (input) => {
          if (!input) return "Project name cannot be empty.";
          if (input === ".") return true;
          if (fs.existsSync(path.resolve(process.cwd(), input))) {
            return `Directory "${input}" already exists. Please choose a different project name.`;
          }
          return true;
        },
      },
      {
        type: "confirm",
        name: "languageSupport",
        message: "Do you want language support?",
        default: false,
      },
      {
        type: "confirm",
        name: "installDependencies",
        message: "Install dependencies?",
        default: true,
      },
    ]);
  } catch (err) {
    console.log(chalk.red("\n✖ Aborted by user."));
    process.exit(1);
  }

  const branch = answers.languageSupport ? "locale" : "main";
  const target = answers.projectName === "." ? "" : answers.projectName;
  const scaffoldCommand =
    `npx degit esteban-cz/nextjs-starter#${branch} ${target}`.trim();
  const scaffoldSpinner = ora("Creating Next.js app...").start();

  try {
    await runCommand(scaffoldCommand);
    scaffoldSpinner.succeed("Project created successfully!");

    if (answers.installDependencies) {
      const installSpinner = ora("Installing all dependencies...").start();
      const cwdDir =
        answers.projectName === "." ? process.cwd() : answers.projectName;
      await runCommand("npm i", { cwd: cwdDir });
      installSpinner.succeed("Dependencies installed successfully!");
    }

    console.log(chalk.green.bold("\nYour Next.js app is ready!"));
    console.log(chalk.green("\nNext steps:"));
    if (answers.projectName !== ".") {
      console.log(chalk.cyan(`\n   cd ${answers.projectName}`));
    }
    if (!answers.installDependencies) {
      console.log(chalk.cyan("\n   npm i"));
    }
    console.log(chalk.cyan("\n   npm run dev\n"));
    console.log(chalk.bold("Happy coding!\n"));
  } catch (error) {
    scaffoldSpinner.fail(`Error: ${error.message}`);
    process.exit(1);
  }
}

run();
