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

		const element = await skyscannerScraperInstance.page.$("pre");
		const response = await (await element.getProperty('textContent')).jsonValue();
		const data = [];

		JSON.parse(response).PlacePrices.forEach((place) => {
			let price = place.IndirectPrice;

			if(place.DirectPrice && place.DirectPrice > price) {
				price = place.DirectPrice;
			}

			data.push({
				destination: place.Name,
				price
			})
		});
		console.log('Window close');
		console.log(data);
		await browser.close();
		return data;
	} catch(e) {
		console.error('Something went wrong');
		console.log(e);
	}
}

module.exports = callFlight;