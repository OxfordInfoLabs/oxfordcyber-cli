#!/usr/bin/env node

import program from "commander";
import chalk from "chalk";
import Push from "./Modules/Static/Push";
import Auth from "./Core/Auth";

let handled = false;


// Define version and description for the Site Atomic CLI
program
    .version('0.0.1')
    .description("Oxford Cyber CLI");


// Login mapping
program.command("login").description("Login to the Oxford Cyber system").action(function (env: any) {
    handled = true;

    new Auth().login();

});

program.command("logout").description("Logout from the Oxford Cyber system");


// Create the static module
let staticModule = program.command('static').description("Operations for static websites").action(function (cmd, env: any) {
    handled = true;

    // Manage sub commands
    if (env) {

        switch (cmd) {
            case "push":
                new Push();
        }
    } else
        console.log(chalk.yellow("Please supply a sub command to oc static.  See oc static --help for more details"));
});

// Add static module commands
staticModule.command('download').description("Download the latest source for this website");
staticModule.command('push').description("Push the latest source for this website to create a new version");


// @ts-ignore
program.parse(process.argv);

if (!handled) {
    // @ts-ignore
    console.log(chalk.red("Error: Unknown command %s supplied to oc."), process.argv[2]);
}


