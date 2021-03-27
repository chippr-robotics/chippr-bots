require('dotenv').config();
const { web3 } = require('@chippr-bots/common');

console.log(web3.eth.getBlock(0));