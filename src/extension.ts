// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
import { debugPort } from "process";
import * as EventEmitter from "events";

const globalEmitter = new EventEmitter();


process.env.ENV  =  "prod"



// Import the module using the constructed path

// sleep function
async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function activate(context: vscode.ExtensionContext) {
  await initActivation(context);

  context.subscriptions.push(
    vscode.commands.registerCommand("mode:refresh", async () => {
      await initActivation(context);
    })
  );
}

async function initActivation(context: vscode.ExtensionContext) {
  const workspaceFolders = vscode.workspace.workspaceFolders;

  // register command to show the tree view

  if (workspaceFolders) {
    const workspaceFolder = workspaceFolders[0];

    const uri: String = workspaceFolder.uri.fsPath;

    let treeProviderInstance = new modeContextProvider(uri);

    let treeView = vscode.window.createTreeView("modeContext", {
      treeDataProvider: treeProviderInstance,
    });

    globalEmitter.on("refresh", (data) => {
      treeView.badge = {
        tooltip: "This is a tooltip",
        value: data,
      };
    });

    let head = await fs.promises.readFile(uri + "/.git/HEAD", "utf8");

    let branch: String = head.split("/").pop()?.trim() || "";

    if (branch === "main") {
      await fs.promises.writeFile(
        `${process.env.HOME}/.zshenv`,
        "export ENV=prod",
        { flag: "w" }
      );
    } else if (branch === "preview") {
      await fs.promises.writeFile(
        `${process.env.HOME}/.zshenv`,
        "export ENV=preview",
        { flag: "w" }
      );
    } else {
      await fs.promises.writeFile(
        `${process.env.HOME}/.zshenv`,
        "export ENV=dev",
        { flag: "w" }
      );
    }

    await vscode.commands.executeCommand("workbench.action.terminal.killAll");

    // Open a new terminal instance
    await vscode.commands.executeCommand("workbench.action.terminal.new");

    treeProviderInstance.branch = branch;

    head = await fs.promises.readFile(uri + "/.git/HEAD", "utf8");

    branch = head.split("/").pop()?.trim() || "";

    treeProviderInstance.branch = branch;

    treeProviderInstance.refresh();
  }
}

class EnvFile {
  constructor(public readonly name: string) { }
}

class modeContextProvider implements vscode.TreeDataProvider<EnvFile> {
  public branch: String = "";

  public iNumberOfItems: number = 0;

  constructor(public uri: String) { }

  private _onDidChangeTreeData: vscode.EventEmitter<
    EnvFile | undefined | void
  > = new vscode.EventEmitter<EnvFile | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<EnvFile | undefined | void> =
    this._onDidChangeTreeData.event;

  public refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getNumberOfItems(): number {
    return this.iNumberOfItems;
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

          let environment = process.env.ENVIRONMENT
  

          if (this.branch === "main") {
            if (environment !== "prod") {
              if (await verifyEnvironmentFromFile(directory, "prod")) {
                envFiles.push(new EnvFile(`${directory}/.env`));
              }
            }
          } else if (this.branch === "preview") {
            if (environment !== "preview") {
              if (await verifyEnvironmentFromFile(directory, "preview")) {
                envFiles.push(new EnvFile(`${directory}/.env`));
              }
            }
          } else if (environment !== "dev") {
            if (await verifyEnvironmentFromFile(directory, "dev")) {
              envFiles.push(new EnvFile(`${directory}/.env`));
            }
          }
        }
      }

      this.iNumberOfItems = envFiles.length;

      globalEmitter.emit("refresh", this.iNumberOfItems);

      return envFiles;
    }
  }
}

async function verifyEnvironmentFromFile(
  filePath: any,
  environmentToMatch: String
) {
  try {
    const fileContent = await fs.promises.readFile(
      `${filePath}/meta.json`,
      "utf8"
    );
    const jsonContent = JSON.parse(fileContent);
    const environment = jsonContent.environment;


    if (environment === undefined) {
      return true;
    }

    if Array.isArray(environment) && environment.length === 0 {
      return true;
    }

    if (
      Array.isArray(environment) &&
      environment.includes(environmentToMatch)
    ) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error(error);
    return false;
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
