"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dependency = exports.NodeDependenciesProvider = void 0;
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
class NodeDependenciesProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.fileroot = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.document.uri.fsPath : undefined;
    }
    refresh() {
        this.fileroot = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.document.uri.fsPath : undefined;
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (!this.fileroot) {
            return Promise.resolve([]);
        }
        if (element) {
            return Promise.resolve(this.getDepsInPackageJson(element.filepath));
        }
        else {
            const packageJsonPath = this.fileroot;
            if (this.pathExists(packageJsonPath)) {
                return Promise.resolve(this.getDepsInPackageJson(packageJsonPath));
            }
            else {
                return Promise.resolve([]);
            }
        }
    }
    getDepsInPackageJson(packageJsonPath) {
        const fileroot = packageJsonPath;
        if (fileroot) {
            const baseroot = fileroot.slice(0, fileroot.lastIndexOf('\\') + 1);
            var packageJson = Object();
            const data = fs.readFileSync(packageJsonPath, 'utf-8');
            const datalines = data.split("\n");
            const toDep = (moduleName) => {
                return new Dependency(moduleName, vscode.TreeItemCollapsibleState.Collapsed, packageJson[moduleName], {
                    command: 'import-tree-view.openFile',
                    title: 'open file',
                    arguments: [packageJson[moduleName]]
                });
            };
            for (var i in datalines) {
                if (/import(?:["'\s]*([\w*{}\n, ]+)from\s*)?["'\s].*([@\w/_-]+)["'\s].*/g.test(datalines[i])) {
                    const z = datalines[i].slice(datalines[i].indexOf('/') + 1, datalines[i].lastIndexOf('\'')) + '.ts';
                    z.replace('/', '\\');
                    if (this.pathExists(baseroot + z)) {
                        packageJson[z] = baseroot + z;
                    }
                }
            }
            const deps = packageJson ? Object.keys(packageJson).map(dep => toDep(dep)) : [];
            return deps;
        }
        else {
            return [];
        }
    }
    pathExists(p) {
        try {
            fs.accessSync(p);
        }
        catch (err) {
            return false;
        }
        return true;
    }
}
exports.NodeDependenciesProvider = NodeDependenciesProvider;
class Dependency extends vscode.TreeItem {
    constructor(label, collapsibleState, filepath, command) {
        super(label, collapsibleState);
        this.label = label;
        this.collapsibleState = collapsibleState;
        this.filepath = filepath;
        this.command = command;
        this.iconPath = {
            light: path.join(__filename, '..', '..', 'resources', 'light', 'dependency.svg'),
            dark: path.join(__filename, '..', '..', 'resources', 'dark', 'dependency.svg')
        };
        this.contextValue = 'dependency';
        this.tooltip = `open ${this.label}`;
        this.description = this.label;
    }
}
exports.Dependency = Dependency;
//# sourceMappingURL=tree.js.map