// capture all common connections



var log = require( './logger' );
var T = require("./twitter");
var prime = require("./prime");
var qr = require("./qr-image");

module.exports = {
    log  : log,
    T : T,
    prime : prime,
    qr  : qr,
}

//copy paste version
/*
const { 
    bot, 
    botUnits, 
    log, 
    web3, 
    watson,
    blkState 
} = require('./common');
*/
