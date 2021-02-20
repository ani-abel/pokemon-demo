const vscode = require('vscode');
const axios = require("axios");
const fastXmlParser = require("fast-xml-parser");
const puppeteer = require("puppeteer");
const { Uri } = require('vscode');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "pokemon-demo" is now active!');

	const res = await axios.default.get("http://blog.webdevsimplified.com/rss.xml");
	const xmlFeedToJson = fastXmlParser.parse(res.data);

	const blogArticles =  xmlFeedToJson.rss.channel.item.map((data) => {
		return {
			label: data.title,
			detail: data.description,
			link: data.link,
		}
	});

	let disposable = vscode.commands.registerCommand('pokemon-demo.searchWdsBlogExample', 
	async function () {
		// The code you place here will be executed every time your command is executed

		// Open a search window using vscode UI libraries
		const selectedArticle = await vscode.window.showQuickPick(blogArticles, {
			matchOnDetail: true
		});
		if(!selectedArticle) {
			return;
		}
		//vscode.env.openExternal(Uri.parse(`${selectedArticle.link}`));

		const htmlContent = await getWebviewContent(selectedArticle.link);
		console.log(htmlContent);
		setTimeout(() => {
			const panel = vscode.window.createWebviewPanel(
				'catCoding',
				`Wds blog | ${selectedArticle.label}`,
				{ preserveFocus: true, viewColumn: vscode.ViewColumn.Beside },
      			{ enableScripts: true },
				vscode.ViewColumn.One,
				{}
			  );
			  // And set its HTML content
			  panel.webview.html = htmlContent;
		}, 2000);

		// Display a message box to the user
		vscode.window.showInformationMessage('Welcome. Pls come and search this Blog!');
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
function deactivate() {}

async function getWebviewContent(link) {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	await page.goto(link);
	//await page.waitForNavigation(5);
	let html = await page.content();
	return html;
}

module.exports = {
	activate,
	deactivate
}
