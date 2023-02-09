'use strict';

import * as vscode from 'vscode';
import { NodeDependenciesProvider } from './tree';

export function activate(context: vscode.ExtensionContext) {
	const nodeDependenciesProvider = new NodeDependenciesProvider();
	vscode.window.registerTreeDataProvider('importTreeView', nodeDependenciesProvider);
	vscode.commands.registerCommand('import-tree-view.refresh', () => nodeDependenciesProvider.refresh());
	vscode.commands.registerCommand('import-tree-view.openFile', path => {
		vscode.commands.executeCommand('vscode.open', vscode.Uri.file(path));
	});
}