var stdrpc = require('stdrpc');

module.exports = stdrpc({
    url: process.env.KOTTI_NODE,
});