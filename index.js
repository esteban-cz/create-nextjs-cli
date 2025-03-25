#!/usr/bin/env node
import { exec } from "child_process";
import inquirer from "inquirer";
import ora from "ora";
import chalk from "chalk";

function runCommand(command, options = {}) {
  return new Promise((resolve, reject) => {
    exec(command, options, (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }
      resolve(stdout);
    });
  });
}

async function run() {
  // Print ASCII art at the top
  const asciiArt = String.raw`
 __ _  ____  _  _  ____      __  ____    ____  _  _    ____  ____  ____  _  _  _  _  __  
(  ( \(  __)( \/ )(_  _)   _(  )/ ___)  (  _ \( \/ )  (  __)/ ___)(_  _)( \/ )( \/ )/  \ 
/    / ) _)  )  (   )(  _ / \) \\___ \   ) _ ( )  /    ) _) \___ \  )(   )  /  )  ((  O )
\_)__)(____)(_/\_) (__)(_)\____/(____/  (____/(__/    (____)(____/ (__) (__/  (_/\_)\__\
`;
  console.log(chalk.bold(chalk.magenta(asciiArt)));

  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "projectName",
      message: "Project name:",
      default: "app-name",
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

  const branch = answers.languageSupport ? "lang" : "main";
  const scaffoldCommand = `npx degit esteban-cz/nextjs-starter#${branch} ${answers.projectName}`;

  const scaffoldSpinner = ora("Creating Next.js app...").start();

  try {
    await runCommand(scaffoldCommand);
    scaffoldSpinner.succeed("Project created successfully!");

    if (answers.installDependencies) {
      const installSpinner = ora("Installing all dependencies...").start();
      await runCommand("npm i --force", { cwd: answers.projectName });
      installSpinner.succeed("Dependencies installed successfully!");
    }
    console.log("\n");
  } catch (error) {
    scaffoldSpinner.fail(`Error: ${error.message}`);
  }
}

run();
