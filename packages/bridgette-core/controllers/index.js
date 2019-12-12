// common functions
const { log } = require('../lib');

// basic functions
var getBlockNumber = require('./getBlockNumber');
var getBalance = require('./getBalance');
var getTransaction = require('./getTransaction');
var sendSignedTransaction = require('./sendSignedTransaction')
var getGasPrice = require('./getGasPrice');
var getBlock = require('./getBlock');


//dapps
var blockstreamSat = require('./blockstreamSat.js');
var getPrice = require('./getPrice');

// admin functions
var version = require('./version');

log.info('[dflow/controllers/index.js] controllers loaded');

module.exports = {
    getBlockNumber : getBlockNumber,
    getBalance : getBalance,
    getTransaction : getTransaction,
    sendSignedTransaction : sendSignedTransaction,
    getGasPrice : getGasPrice,
    getBlock : getBlock,
    blockstreamSat : blockstreamSat,
    getPrice : getPrice,
    version : version
}

// copy paste 
// const { getBlockNumber, getBalance, getTransaction, sendSignedTransaction, getGasPrice, getBlock, version, error } = require( "./funcs" );
