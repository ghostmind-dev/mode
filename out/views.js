"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyViewProvider = void 0;
const vscode = require("vscode");
class MyViewProvider {
    constructor(_extensionUri) {
        this._extensionUri = _extensionUri;
    }
    resolveWebviewView(webviewView) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri],
        };
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
        // Set the icon for the view
        webviewView.iconPath = {
            light: vscode.Uri.file(context.asAbsolutePath("resources/light/book.svg")),
            dark: vscode.Uri.file(context.asAbsolutePath("resources/dark/book.svg")),
        };
    }
    _getHtmlForWebview(webview) {
        return `<!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>My View</title>
        </head>
        <body>
          <h1>Welcome to My View</h1>
        </body>
      </html>`;
    }
}
exports.MyViewProvider = MyViewProvider;
MyViewProvider.viewType = "myView";
//# sourceMappingURL=views.js.map