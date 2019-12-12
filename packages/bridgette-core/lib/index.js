// capture all common connections

var botUnits = require( './botUnits' );
//var bot = require( './discord' );
var log = require( './logger' );
var web3 = require( "./etherNode" );
var qr = require("./qr-image");

// var watson = require( './watson' );
var btc = require("./btcNode");
var zec = require("./zecNode");
var etc = require("./etcNode");

module.exports = {
    botUnits : botUnits,
  //  bot  : bot,
    log  : log,
    web3 : web3,
    qr   : qr,
    btc  : btc,
    etc  : etc,
    zec  : zec,
}

//copy paste version
// const { bot, botUnits, log, web3, watson } = require('./common');
