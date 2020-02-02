const searchFlight = require('./index');
const cache = require('./utils/memory');
const sgMail = require('@sendgrid/mail');
const cron = require('node-cron');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const countryList = [
    'israel',
    'france',
    'russia',
    'spain',
    'iran',
    'finland',
    'south africa',
    'new zealand',
    'poland',
    'iceland',
    'united kingdom',
    'germany',
    'norway'
];

const budget = [
   30000,
   30000,
   25000,
   20000,
   30000,
   25000,
   30000,
   30000,
   30000,
   30000,
   30000,
   30000
];

(async () => {
    const task = cron.schedule('0 0 */5 * * *', async () => {
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
                    if(price && inCache > price) {
                        getReady.push({
                            destination: list.destination,
                            price
                        });
                    }
                }
            }
        });

        console.log('list', getReady);

        if(getReady.length) {
            let html = '<table><thead><tr><th>Destination</th><th>Price</th></tr></thead><tbody>';

            getReady.forEach(result => {
                html = `${html} <tr><td>${result.destination}</td><td>${result.price}</td></tr>`

            });

            html = html + '</tbody></table>';

            const msg = {
                to: 'arpit2438735@gmail.com',
                from: 'trip@arpit.com',
                subject: 'Wohooo price are less!!!',
                html,
            };

            console.log('Sending Mail...');

            await sgMail.send(msg);

            console.log('Mail sent!');
        }
    });

    task.start();
})();