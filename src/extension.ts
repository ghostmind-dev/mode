// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
import { debugPort } from "process";

// Import the module using the constructed path

export async function activate(context: vscode.ExtensionContext) {
  const workspaceFolders = vscode.workspace.workspaceFolders;

  if (workspaceFolders) {
    const workspaceFolder = workspaceFolders[0];

    const uri: String = workspaceFolder.uri.fsPath;

    let treeProviderInstance = new modeContextProvider(uri);

    let treeView = vscode.window.createTreeView("modeContext", {
      treeDataProvider: treeProviderInstance,
    });

    // set a 4 seconds interval loop

    // let i = 0;

    let head = await fs.promises.readFile(uri + "/.git/HEAD", "utf8");

    let branch: String = head.split("/").pop()?.trim() || "";

    treeProviderInstance.branch = branch;

    setInterval(async () => {
      head = await fs.promises.readFile(uri + "/.git/HEAD", "utf8");

      branch = head.split("/").pop()?.trim() || "";

      treeProviderInstance.branch = branch;

      treeProviderInstance.refresh();

      // refs/heads/dev => dev

      treeView.badge = {
        tooltip: "This is a tooltip",
        value: treeProviderInstance.iNumberOfItems,
      };
    }, 5000);
  }
}

class EnvFile {
  constructor(public readonly name: string) {}
}

class modeContextProvider implements vscode.TreeDataProvider<EnvFile> {
  public branch: String = "";

  public iNumberOfItems: number = 0;

  constructor(public uri: String) {}

  private _onDidChangeTreeData: vscode.EventEmitter<
    EnvFile | undefined | void
  > = new vscode.EventEmitter<EnvFile | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<EnvFile | undefined | void> =
    this._onDidChangeTreeData.event;

  public refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  async getTreeItem(element: EnvFile): Promise<vscode.TreeItem> {
    return new vscode.TreeItem(
      element.name,
      vscode.TreeItemCollapsibleState.None
    );
  }
  async getChildren(element?: EnvFile): Promise<EnvFile[]> {
    if (element || this.branch === "") {
      return Promise.resolve([]);
    } else {
      let envFiles: EnvFile[] = [];

      let directories = await recursiveDirectoriesDiscovery(this.uri);

      for (let directory of directories) {
        if (await verifyIfEnvFile(directory)) {
          // read the .env with dotenv

          dotenv.config({ path: `${directory}/.env`, override: true });

          let environment = process.env.ENVIRONMENT;

          if (this.branch === "main") {
            if (environment !== "prod") {
              envFiles.push(new EnvFile(`${directory}/.env`));
            }
          } else if (this.branch === "preview") {
            if (environment !== "preview") {
              envFiles.push(new EnvFile(`${directory}/.env`));
            }
          } else if (environment !== "dev") {
            envFiles.push(new EnvFile(`${directory}/.env`));
          }
        }
      }

      this.iNumberOfItems = envFiles.length;

      return envFiles;
    }
  }
}

async function verifyIfEnvFile(path: String): Promise<Boolean> {
  try {
    await fs.promises.access(`${path}/.env`);
    return true;
  } catch (err) {
    return false;
  }
}

async function getDirectories(path: any) {
  const directoriesWithFiles = await fs.promises.readdir(`${path}`, {
    withFileTypes: true,
  });

  const directories = directoriesWithFiles
    .filter((dirent) => dirent.isDirectory())
    .filter((dirent) => dirent.name !== "node_modules")
    .filter((dirent) => dirent.name !== ".git")
    .filter((dirent) => dirent.name !== "migrations")
    .map((dirent) => dirent.name);

  return directories;
}

////////////////////////////////////////////////////////////////////////////////
// DISCOVER ALL THE DIRECTORIES PATH  IN THE PROJECT (RECURSIVE)
////////////////////////////////////////////////////////////////////////////////

async function recursiveDirectoriesDiscovery(path: any): Promise<any> {
  const directories = await getDirectories(path);

  let directoriesPath: String[] = [];

  for (let directory of directories) {
    directoriesPath.push(`${path}/${directory}`);
    directoriesPath = directoriesPath.concat(
      await recursiveDirectoriesDiscovery(`${path}/${directory}`)
    );
  }

  return directoriesPath;
}
