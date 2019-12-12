var stdrpc = require('stdrpc');

module.exports = stdrpc({
    url: process.env.ETC_NODE,
});