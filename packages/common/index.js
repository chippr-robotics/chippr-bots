// capture all common connections

var botUnits = require( './botUnits' );
var bot = require( './discord' );
var log = require( './logger' );
var web3 = require( "./etherNode" );
var forks = require( "./forks" );
var blkState = require("./blkState");
var canRes = require("./canRes");
var T = require("./twitter");
var prime = require("./prime");
// var watson = require( './watson' );


module.exports = {
    botUnits : botUnits,
    bot  : bot,
    log  : log,
    web3 : web3,
    forks : forks,
    blkState: blkState,
    canRes:canRes,
    T : T,
    prime : prime
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
