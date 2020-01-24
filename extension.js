const vscode = require('vscode');

function activate(context) {

	vscode.window.showWarningMessage('Extension deprecated. Please use stylelint.vscode-stylelint');

}

module.exports = {
	activate
}
