var stdrpc = require('stdrpc');
console.log({
    url: process.env.ZEC_NODE,
    username: process.env.ZEC_USER,
    password: process.env.ZEC_PASS
})
module.exports = stdrpc({
    url: process.env.ZEC_NODE,
    username: process.env.ZEC_USER,
    password: process.env.ZEC_PASS,
});