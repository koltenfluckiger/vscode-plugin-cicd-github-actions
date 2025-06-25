import * as vscode from 'vscode';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "kubernetesapply" is now active!');

	function runResourceCommand(command: string, uri: vscode.Uri | undefined) {
		let resourcePath = '';

		// If URI is provided (from context menu), use it
		if (uri) {
			resourcePath = uri.fsPath;
		} else if (vscode.window.activeTextEditor !== undefined) {
			// If no URI but there's an active text editor, use the current file
			const currentlyOpenTabfilePath = vscode.window.activeTextEditor.document.fileName;
			resourcePath = currentlyOpenTabfilePath;
		} else {
			// If neither URI nor active editor, show error
			vscode.window.showErrorMessage('No file selected. Please select a YAML file in the explorer or open a YAML file in the editor.');
			return;
		}

		// Check if the file is a YAML file
		if (!resourcePath.endsWith('.yaml') && !resourcePath.endsWith('.yml')) {
			vscode.window.showErrorMessage('Selected file is not a YAML file. Please select a .yaml or .yml file.');
			return;
		}
	 
		if (!ensureTerminalExists()) {
			return;
		}

		const terminal = selectTerminal();
		terminal.sendText(`kubectl ${command} -f ${resourcePath}`);
		vscode.window.showInformationMessage(`kubectl ${command} executed for: ${path.basename(resourcePath)}`);
	}

	let disposableApply = vscode.commands.registerCommand('kubernetesapply.apply', (uri?: vscode.Uri) => {
		runResourceCommand('apply', uri);
	});

	let disposableDelete = vscode.commands.registerCommand('kubernetesapply.delete', (uri?: vscode.Uri) => {
		runResourceCommand('delete', uri);
	});

	context.subscriptions.push(disposableApply);
	context.subscriptions.push(disposableDelete);
}

export function deactivate() {}

function ensureTerminalExists(): boolean {
	if ((<any>vscode.window).terminals.length === 0) {
		vscode.window.showErrorMessage('No active terminals');
		return false;
	}
	return true;
}

function selectTerminal(): vscode.Terminal {
	return <vscode.Terminal>(<any>vscode.window.activeTerminal);
}