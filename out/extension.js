'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const vscode = require("vscode");
const tree_1 = require("./tree");
function activate(context) {
    const nodeDependenciesProvider = new tree_1.NodeDependenciesProvider();
    vscode.window.registerTreeDataProvider('importTreeView', nodeDependenciesProvider);
    vscode.commands.registerCommand('import-tree-view.refresh', () => nodeDependenciesProvider.refresh());
    vscode.commands.registerCommand('import-tree-view.openFile', path => {
        vscode.commands.executeCommand('vscode.open', vscode.Uri.file(path));
    });
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map