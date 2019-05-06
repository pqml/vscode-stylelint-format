const fs = require('fs');
const path = require('path');
const vscode = require('vscode');

const supportedDocuments = [
	{ language: 'css', scheme: 'file' },
	{ language: 'postcss', scheme: 'file' },
	{ language: 'less', scheme: 'file' },
	{ language: 'scss', scheme: 'file' }
];

function output(channel, message, autoShowOutput = false) {
	if (!channel) channel = vscode.window.createOutputChannel('stylelint-format');
	channel.clear();
	channel.appendLine('[stylelint-format]');
	channel.append(message.toString());
	if (autoShowOutput) channel.show();
}

function activate(context) {
	const basepath = vscode.workspace.rootPath;
	const outputChannel = vscode.OutputChannel;
	const stylelint = require(path.join(basepath + '/node_modules/stylelint'));

	if (!basepath) {
		vscode.window.showWarningMessage('stylelint-format only works with vscode opened on a workspace folder');
		return;
	}

	if (!stylelint) {
		vscode.window.showWarningMessage('stylelint-format: no stylelint package found');
		return;
	}

	const format = vscode.languages.registerDocumentRangeFormattingEditProvider(
		supportedDocuments,
		{
			provideDocumentRangeFormattingEdits(document, range) {
				let stylelintrc
				try {
					stylelintrc = fs.readFileSync(path.join(basepath, '.stylelintrc'), { encoding: 'utf8' })
					stylelintrc = JSON.parse(stylelintrc)
				} catch (err) {
					vscode.window.showWarningMessage('stylelint-format: error reading .stylelintrc');
					return;
				}

				const code = document.getText()
				return Promise.resolve()
					.then(() => stylelint.lint({
						code,
						config: stylelintrc,
						configBasedir: basepath,
						formatter: 'string',
						fix: true
					}))
					.then(result => {
						if (result.errored) return Promise.reject(result.output)
						return [vscode.TextEdit.replace(range, result.output)]
					})
					.catch(err => output(outputChannel, err))

			}
		}
	);

	context.subscriptions.push(format);

}

module.exports = {
	activate
}
