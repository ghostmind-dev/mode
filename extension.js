const vscode = require("vscode");
const fs = require("fs");

function activate(context) {
  let disposable = vscode.commands.registerCommand("mode.context", function () {
    vscode.window.showInformationMessage("Hello World!");

    // watch .git/HEAD file

    fs.watchFile(".git/HEAD", (curr, prev) => {
      // showINformationMessage about current branch

      const branch = fs
        .readFileSync(".git/HEAD", "utf8")
        .split("/")
        .pop()
        .trim();

      vscode.window.showInformationMessage(`Current branch: ${branch}`);
    });
  });

  context.subscriptions.push(disposable);
}

function deactivate() {
  console.log("deactivate");
}

module.exports = {
  activate,
  deactivate,
};
