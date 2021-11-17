// common functions
const { log } = require('@chippr-bots/common');

var statebot = require('./statebot');
var multi = require('./multi-sig');
//var donate = require('./donate');
var getkotti = require('./getkotti');
var etcmail = require('./etcmail');
//var eventLog = require('./eventLog');
//var tipper = require('./tipper');
var atlantis = require('./atlantis')

log.info('[Bridgett-bot/dapps/index.js] dapps loaded');

module.exports = {
    statebot : statebot,
    multi : multi,
//    donate : donate,
    getkotti : getkotti,
    etcmail : etcmail,
//    eventLog : eventLog,
//    tipper : tipper,
    atlantis : atlantis,
}

// copy paste 
// const { statebot, multi, donate, getetc, etcmail, eventLog, tipper } = require( "./dapps" );
