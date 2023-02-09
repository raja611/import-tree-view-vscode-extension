import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
export class NodeDependenciesProvider implements vscode.TreeDataProvider<Dependency> {

	private _onDidChangeTreeData: vscode.EventEmitter<Dependency | undefined | void> = new vscode.EventEmitter<Dependency | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<Dependency | undefined | void> = this._onDidChangeTreeData.event;
	private fileroot;
	constructor() {
		this.fileroot = vscode.window.activeTextEditor
		? vscode.window.activeTextEditor.document.uri.fsPath : undefined;
	}

	refresh(): void {
		this.fileroot = vscode.window.activeTextEditor
		? vscode.window.activeTextEditor.document.uri.fsPath : undefined;
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: Dependency): vscode.TreeItem {
		return element;
	}

	getChildren(element?: Dependency): Thenable<Dependency[]> {
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

	private getDepsInPackageJson(packageJsonPath: string): Dependency[] {
		const fileroot = packageJsonPath;
		if ( fileroot) {
			const baseroot=fileroot.slice(0,fileroot.lastIndexOf('\\')+1);
			var packageJson = Object();
			const data = fs.readFileSync(packageJsonPath, 'utf-8');
			const datalines=data.split("\n");
			const toDep = (moduleName: string ): Dependency => {
					return new Dependency(moduleName,  vscode.TreeItemCollapsibleState.Collapsed , packageJson[moduleName],{
						command: 'import-tree-view.openFile',
						title: 'open file',
						arguments: [packageJson[moduleName]]
					});
			};
			for (var i in datalines) {
				if(/import(?:["'\s]*([\w*{}\n, ]+)from\s*)?["'\s].*([@\w/_-]+)["'\s].*/g.test(datalines[i])){
					const z=datalines[i].slice(datalines[i].indexOf('/')+1,datalines[i].lastIndexOf('\''))+'.ts';
					z.replace('/','\\');
					if(this.pathExists(baseroot+z)){
						packageJson[z]=baseroot+z;
					}
				}
			}
			const deps = packageJson ? Object.keys(packageJson).map(dep => toDep(dep)) : [];
			return deps;
		} else {
			return [];
		}
	}

	private pathExists(p: string): boolean {
		try {
			fs.accessSync(p);
		} catch (err) {
			return false;
		}

		return true;
	}
}

export class Dependency extends vscode.TreeItem {

	constructor(
		public readonly label: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly filepath:string,
		public readonly command?: vscode.Command
	) {
		super(label, collapsibleState);

		this.tooltip = `open ${this.label}`;
		this.description = this.label;
	}

	iconPath = {
		light: path.join(__filename, '..', '..', 'resources', 'light', 'dependency.svg'),
		dark: path.join(__filename, '..', '..', 'resources', 'dark', 'dependency.svg')
	};

	contextValue = 'dependency';
}