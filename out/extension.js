"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const fs = require("fs");
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
async function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "context" is now active!');
    vscode.window.showInformationMessage("Hello World from context!");
    // print the current worekspace folder
    const workspaceFolders = vscode.workspace.workspaceFolders;
    console.log(workspaceFolders);
    if (workspaceFolders) {
        const workspaceFolder = workspaceFolders[0];
        const uri = workspaceFolder.uri.fsPath;
        fs.watch(uri + "/.git/HEAD", (event, filename) => {
            console.log("README.md file changed");
        });
    }
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand("mode.context", () => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        vscode.window.showInformationMessage("Hello Worlxssxm context!");
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
// This method is called when your extension is deactivated
async function deactivate() {
    vscode.window.showInformationMessage("Exit Hello");
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map