// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as fs from "fs";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
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

// This method is called when your extension is deactivated
export async function deactivate() {
  vscode.window.showInformationMessage("Exit Hello");
}
