const elements = require('../../elements')['destinationList'];

module.exports = class DestinationList {
    constructor() {
        this.config = {
            maxDestination: 20,
            maxDestinationLevel: 15
        };
    }

    async getData(scraperInstance) {
        const config = {
            maxDestination: 500,
            maxDestinationLevel: 15
        };

        await scraperInstance.page.$$(elements.dataContainer);
        console.log('Getting details from list...');

        const results = await scraperInstance.page.evaluate((selectors) => {
            const resultList = document.querySelectorAll(selectors.record);
            const data = [];

            if(resultList.length) {
                for(let i=1; i< resultList.length; i++) {
                    console.log(resultList[i]);
                    data.push({
                        destination: resultList[i].querySelector(selectors.title).innerText,
                        price: resultList[i].querySelector(selectors.price) &&
                            resultList[i].querySelector(selectors.price).innerText.replace(/[^0-9.-]+/g,"")
                    });
                }
            }

            return data;
        }, elements);

        await scraperInstance.page.waitFor(200);

        return results;
    }

}