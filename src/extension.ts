// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as fs from "fs";

export async function activate(context: vscode.ExtensionContext) {
  const workspaceFolders = vscode.workspace.workspaceFolders;

  if (workspaceFolders) {
    const workspaceFolder = workspaceFolders[0];

    const uri = workspaceFolder.uri.fsPath;

    fs.watch(uri + "/.git/HEAD", (event, filename) => {
      // print new branch name

      console.log("new branch name");
    });
  }
}
