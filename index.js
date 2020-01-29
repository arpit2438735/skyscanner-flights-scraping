const chalk = require('chalk');

const utils = require('./utils/utils');
const Browser = require('./browser/browser');
const SkyscannerScraper = require('./skyscanner/skyscanner');

async function callback(skyscannerScraperInstance) {
	await skyscannerScraperInstance.submitSearch();	

		/*
		// in case of G recaptcha
		await utils.clickOnRecaptcha(page);
		*/

	if(await skyscannerScraperInstance.loadResultPage()) {
		console.log(await skyscannerScraperInstance.page.url());
		//await skyscannerScraperInstance.page.screenshot({ path: 'screen/submitted.png' });

		console.log('Wait for the results..');

		var pageParser = await skyscannerScraperInstance.createPageParser();

		if(!pageParser || !pageParser.getData) {
			await skyscannerScraperInstance.page.evaluate(() => {
					location.reload(true);
			});
			await callback(skyscannerScraperInstance);
		}

	}
	
	return await pageParser.getData(skyscannerScraperInstance);
}

async function callFlight(arguments) {
	try{
		const args = utils.getInputParameters(arguments);

		if (Object.keys(args).indexOf('h') !== -1) {
			utils.showHelp();
			return false;
		}

		utils.validateInputArguments(args);

		const browser = new Browser(args);
		await browser.init();

		const skyscannerScraperInstance = new SkyscannerScraper();
		skyscannerScraperInstance.attachBrowser(browser);
		await skyscannerScraperInstance.init({
			fakingUserInteraction: true,
			ua: args['ua'], 
			'intercept-request': true
		});
		
		console.log(chalk.bgCyan('Faking user interaction..'));
		await utils.fakingUserInteraction(skyscannerScraperInstance.page);

		if (args['username'] !== undefined && args['password'] !== undefined) {
			await skyscannerScraperInstance.signIn(args['username'], args['password']);
		}

		// await skyscannerScraperInstance.page.click('#fsc-trip-type-selector-return'); // enabled by default

		console.log(chalk.yellow("Is oneWay: " + chalk.underline.bold(args['oneWay'])));
		if (args['oneWay'] === true)
			await skyscannerScraperInstance.setOneWay();

		console.log(chalk.yellow("Is directOnly: " + chalk.underline.bold(args['directOnly'])));
		if (args['directOnly'] === true)
			await skyscannerScraperInstance.setDirectOnly();

		await skyscannerScraperInstance.setOriginAirport(args['origin']);

		if (args['destination'] != 'Everywhere') {
			await skyscannerScraperInstance.setDestinationAirport(args['destination']);
		}

		await skyscannerScraperInstance.setDepartureDate(
			args['wholeMonthStart'],
			args['dayStart'],
			args['monthStart'],
			args['yearStart']
		);

		if (args['oneWay'] !== true) {
			await skyscannerScraperInstance.setReturnDate(
				args['wholeMonthEnd'],
				args['dayEnd'],
				args['monthEnd'],
				args['yearEnd']
			);
		}

		if(args['adults'] !== undefined || args['children'] !== undefined)
			await skyscannerScraperInstance.setPassengersData(args['adults'], args['children']);

		await skyscannerScraperInstance.submitSearch();	

		/*
		// in case of G recaptcha
		await utils.clickOnRecaptcha(page);
		*/

		return callback(skyscannerScraperInstance);

		console.log('Window close');
		await browser.close();
	} catch(e) {
		console.error('Something went wrong');
		console.log(e);
	}
}

module.exports = callFlight;