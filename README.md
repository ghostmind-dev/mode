# mode

vscode extension to monitor the environment mode in devcontainer

## notes

- activationEvents in package.json

## development

- `f5 to build and launch into another window`
- `select a workspace folder` in the new window
- `cmd+r to reload` in the new window

## sequence

- user change the branch
- system will read .git/HEAD and store branch name
- system will update .zshenv
- system will read all .env and veify environment matches branch
- if not, extension will display mismatched branches in treeview
- if not, extension will display mismatched branches in badge icon

## post-checkout to integrate to this extension

```mjs
#!/usr/bin/env zx

const SRC = process.env.SRC;

const { envDevcontainer } = await import(`${SRC}/dev/src/main.mjs`);

await envDevcontainer();

const previousHead = process.argv[3];
const currentHead = process.argv[4];
```
