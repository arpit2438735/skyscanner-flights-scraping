const cache = require('memory-cache');


const put = (key, value) => {
    cache.put(key, value);
};

const get = (key) => cache.get(key);

module.exports = {
    put,
    get
};