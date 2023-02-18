const vscode = require("vscode");
const fs = require("fs");

function activate(context) {
  const watchedFilePath = ".git/HEAD";
  const fileWatcher = vscode.workspace.createFileSystemWatcher(watchedFilePath);

  const disposable = fileWatcher.onDidChange(() => {
    const branchName = getCurrentBranchName();
    updateStatusBar(branchName);
  });

  context.subscriptions.push(fileWatcher, disposable);

  const branchName = getCurrentBranchName();
  updateStatusBar(branchName);
}

function getCurrentBranchName() {
  const headFilePath = `${vscode.workspace.rootPath}/.git/HEAD`;
  const headFileContent = fs.readFileSync(headFilePath, "utf8");
  const branchName = headFileContent.replace("ref: refs/heads/", "").trim();
  return branchName;
}

function updateStatusBar(branchName) {
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left
  );
  statusBarItem.text = `$(git-branch) ${branchName}`;
  statusBarItem.show();
}

exports.activate = activate;
