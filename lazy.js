const searchFlight = require('./index');
const cache = require('./utils/memory');

const countryList = [
    'israel',
    'france',
    'russia',
    'spain',
    'iran',
    'finland',
    'south africa',
    'new zealand'
];

const budget = [
   30000,
   30000,
   25000,
   20000,
   30000,
   25000,
   30000
];

(async () => {
    const args = {
        origin: 'India',
        destination: 'Everywhere',
        wholeMonthEnd: true,
        wholeMonthStart: true,
        directOnly: false,
        dayStart: (new Date().getDay()+1),
        monthStart: (new Date().getMonth()+1),
        yearStart: (new Date().getFullYear()),
        dayEnd: (new Date().getDay()+1),
        monthEnd: (new Date().getMonth()+1),
        yearEnd: (new Date().getFullYear())
    };

    const data = await searchFlight(args);
    const getReady = [];

    data.forEach((list) => {
        let dreamDestination = countryList.indexOf(list.destination.toLowerCase());
        let price = parseInt(list.price);

        if(dreamDestination >=0 && budget[dreamDestination] >= price) {
            if(!cache.get(list.destination)) {
                cache.put(list.destination, price);
                getReady.push({
                    destination: list.destination,
                    price
                })
            }

            if(cache.get(list.destination)) {
                let inCache = cache.get(list.destination);
                if(inCache > price) {
                    getReady.push({
                       destination: list.destination,
                       price
                    });
                }
            }
            console.log(cache.get(list.destination));
        }
    });

    console.log(getReady);
})();