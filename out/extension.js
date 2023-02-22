"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const fs = require("fs");
const dotenv = require("dotenv");
// Import the module using the constructed path
async function activate(context) {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders) {
        const workspaceFolder = workspaceFolders[0];
        const uri = workspaceFolder.uri.fsPath;
        let treeProviderInstance = new modeContextProvider(uri);
        let treeView = vscode.window.createTreeView("modeContext", {
            treeDataProvider: treeProviderInstance,
        });
        // set a 4 seconds interval loop
        // let i = 0;
        let head = await fs.promises.readFile(uri + "/.git/HEAD", "utf8");
        let branch = head.split("/").pop()?.trim() || "";
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
exports.activate = activate;
class EnvFile {
    constructor(name) {
        this.name = name;
    }
}
class modeContextProvider {
    constructor(uri) {
        this.uri = uri;
        this.branch = "";
        this.iNumberOfItems = 0;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    async getTreeItem(element) {
        return new vscode.TreeItem(element.name, vscode.TreeItemCollapsibleState.None);
    }
    async getChildren(element) {
        if (element || this.branch === "") {
            return Promise.resolve([]);
        }
        else {
            let envFiles = [];
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
                    }
                    else if (this.branch === "preview") {
                        if (environment !== "preview") {
                            envFiles.push(new EnvFile(`${directory}/.env`));
                        }
                    }
                    else if (environment !== "dev") {
                        envFiles.push(new EnvFile(`${directory}/.env`));
                    }
                }
            }
            this.iNumberOfItems = envFiles.length;
            return envFiles;
        }
    }
}
async function verifyIfEnvFile(path) {
    try {
        await fs.promises.access(`${path}/.env`);
        return true;
    }
    catch (err) {
        return false;
    }
}
async function getDirectories(path) {
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
async function recursiveDirectoriesDiscovery(path) {
    const directories = await getDirectories(path);
    let directoriesPath = [];
    for (let directory of directories) {
        directoriesPath.push(`${path}/${directory}`);
        directoriesPath = directoriesPath.concat(await recursiveDirectoriesDiscovery(`${path}/${directory}`));
    }
    return directoriesPath;
}
//# sourceMappingURL=extension.js.map