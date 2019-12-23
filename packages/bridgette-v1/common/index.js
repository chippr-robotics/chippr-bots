// capture all common connections

var botUnits = require( './botUnits' );
var bot = require( './discord' );
var log = require( './logger' );
var web3 = require( "./etherNode" );
var forks = require( "./forks" );
var blkState = require("./blkState");
// var watson = require( './watson' );


module.exports = {
    botUnits : botUnits,
    bot  : bot,
    log  : log,
    web3 : web3,
    forks : forks,
    blkState: blkState,
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
