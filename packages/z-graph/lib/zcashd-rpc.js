var stdrpc = require('stdrpc');

module.exports = stdrpc({
    url: process.env.ZEC_NODE,
    username: process.env.ZEC_USER,
    password: process.env.ZEC_PASS,
});