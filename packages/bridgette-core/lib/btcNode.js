var stdrpc = require('stdrpc');

module.exports = stdrpc({
    url: process.env.BTC_NODE,
    username: process.env.BTC_USER,
    password: process.env.BTC_PASS,
});