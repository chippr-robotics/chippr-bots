
require('dotenv').config();
const fs = require('fs');
var initialize = require('/tmp/data.json');
const { bot, log, web3, forks, blkState, T, prime } = require('@chippr-bots/common');

// Initialize Discord Bot

bot.on('ready', function (evt) {
    log.info('[Bridgette-bot/index.js] Connected');
    log.info('[Bridgette-bot/index.js] Logged in as: ');
    log.info('[Bridgette-bot/index.js]' + bot.username + ' - (' + bot.id + ')');
});

//* Get functions from library *//

const { getBlockNumber, getBalance, getTransaction, getTXR, sendSignedTransaction, getGasPrice, getBlock, version, error, forkName, forkit } = require( "./funcs" );

// dapps

const { statebot, multi, etcmail, atlantis, getkotti } = require( "./dapps" );

// help files

const { bridgette, donatehelp, etcmailhelp, tipperError } = require( "./help" );


// twitter files

const { quadPrime, twinPrime } = require("./twitter");

T.post('statuses/update', {
        status: "etc!" },
        function(err, data, response) {
            log.debug('[index.js] returned data: ' + data);
    });



//* end functoin set*//

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function addReaction(channelID, evt,emoji){
   bot.addReaction({
    channelID : channelID,
    messageID : evt.d.id,
    reaction : emoji
  })
}

// set initial state
const blockSTATE = new blkState(
  initialize.blkStack,
  initialize.blockNumber,
  initialize.averageBlockTime,
  initialize.blkDiv
);
console.log(blockSTATE);

//console.log(blockSTATE);
//update state periodically
setInterval( async function(){
  //get the latest block number
  let pastBlock = blockSTATE.blockNumber;
  blockSTATE.blockNumber = await web3.eth.getBlockNumber();
//  log.debug(blockSTATE.blockNumber);
  //find the average block time
  let curBlock = await web3.eth.getBlock(blockSTATE.blockNumber);
  let lastBlock = await web3.eth.getBlock(blockSTATE.blockNumber - 1);
  let oldBlock = await web3.eth.getBlock(blockSTATE.blockNumber - 50000);
  try {
 	 blockSTATE.averageBlockTime = (curBlock.timestamp - oldBlock.timestamp) / 50000;
       //  console.log(blockSTATE.averageBlockTime);
  }
  catch(err){
	log.error("block average:" + err);
  }
  //log.debug(blockSTATE.averageBlockTime);
  //get stddiv
  //if we have a vew block push it to the stack and tweet if it is a quad prime
  if(blockSTATE.blockNumber > pastBlock){
   await sleep(2000); 
   if(prime.nextPrimeQuad(blockSTATE.blockNumber-1) % blockSTATE.blockNumber == 0) quadPrime(T, blockSTATE.blockNumber);
   try{
      blockSTATE.blkStack.unshift(Math.abs((curBlock.timestamp - lastBlock.timestamp) - blockSTATE.averageBlockTime));
    }
    catch(err){
      log.error("[bridgette-v1/index.js] tried to unshift: "+ err);
    }
  }
//  if(prime.nextPrimeTwin(blockSTATE.blockNumber-1) % blockSTATE.blockNumber == 0) twinPrime(T, blockSTATE.blockNumber);
  if(blockSTATE.blkStack.length > 50000) blockSTATE.blkStack.pop();
  //sum all the variance and average it
  blockSTATE.blkDiv = ( blockSTATE.blkStack.reduce((a,b) => a + b, 0) / blockSTATE.blkStack.length);
  //log.debug(blockSTATE.blkStack);
  //log.debug(blockSTATE.blkDiv);
  fs.writeFileSync('/tmp/data.json', JSON.stringify(blockSTATE, null, 2) , 'utf-8'); 

},5000);




bot.on('message', async function (user, userID, channelID, message, evt) {
// Our bot needs to know if it will execute a command
// It will listen for messages that will start with `!`
  if (message.substring(0, 1) == '!') {
    var args = message.substring(1).split(' ');
    var cmd = args[0].toLowerCase();
    var payload = args[1];
    if (args[2] != null){
      var dLoad = [args[1].toLowerCase(), args[2], args[3]];
      var time =  [args[1], args[2], args[3]];
    }
    args = args.splice(1);

    switch(cmd) {
      case 'web3':
        addReaction(channelID, evt, "\u{1F916}");
        bot.sendMessage(bridgette(channelID));
        break;
          
      case 'depi':
        addReaction(channelID, evt, "🍕");
        break;
        
      // getBlockNumber
      case 'getblocknumber':
        addReaction(channelID, evt, "\u{1F916}");
        try {
          bot.sendMessage(getBlockNumber(channelID, blockSTATE.blockNumber));
        }
        catch(err) {
          bot.sendMessage(error(channelID, err))
        };
        break;

      // version
      case 'version':
        addReaction(channelID, evt, "\u{1F916}");
        bot.sendMessage(version(channelID));
        break;
            
      // forkname     
      case 'fork':
        addReaction(channelID, evt, "\u{1F916}");
        bot.sendMessage(forkName(channelID, payload));
        break;
      
      //forkit
      case 'forkit':
        addReaction(channelID, evt, "\u{1F916}");
        try{
          bot.sendMessage(forkit(channelID, time[0], time[1], time[2], blockSTATE.blockNumber,  blockSTATE.averageBlockTime, blockSTATE.blkDiv))
        }   
        catch(err){
          bot.sendMessage(error(channelID, err))
        };
        break;

      // getBalance
      case 'getbalance':
        addReaction(channelID, evt, "\u{1F916}");
        if(payload != undefined && web3.utils.isAddress(payload)){
          web3.eth.getBalance(payload)
            .then( balance => {
              bot.sendMessage(getBalance(channelID, payload, balance));
            })
            .catch((err) => {
                bot.sendMessage(error(channelID, err))
            });
        } else {
          bot.sendMessage({
            to: channelID,
            message: "Get balance requires an account number (i.e. !getBalance <0xaccount>)"
          });
        }
        break;

        // getTransaction
        case 'gettransaction':
          addReaction(channelID, evt, "\u{1F916}");
          if(payload != undefined){
            web3.eth.getTransaction(payload)
            .then(transaction => {
                bot.sendMessage(getTransaction(channelID, payload, transaction));
            })
            .catch((err) => {
                bot.sendMessage(error(channelID, err))
            });
          } else {
            bot.sendMessage({
              to: channelID,
              message: "Get transaction requires a txId (i.e. !getTransaction <txId>)"
            });
          }
          break;

        //get transactionReceipt
        case 'inspect':
          addReaction(channelID, evt, "\u{1F916}");
          if(payload != undefined){
            web3.eth.getTransactionReceipt(payload)
            .then(transaction => {
                bot.sendMessage(getTXR(channelID, payload, transaction));
            })
            .catch((err) => {
              bot.sendMessage(error(channelID, err))
            });
          } else {
            bot.sendMessage({
              to: channelID,
              message: "Get transaction receipt requires a txId (i.e. !getTransaction <txId>)"
            });
          }
          break;

        // sendSignedTransaction
        case 'sendsignedtransaction':
          addReaction(channelID, evt, "\u{1F916}");
          if(payload != undefined){
            web3.eth.sendSignedTransaction(payload)
            .then( hash => {
              bot.sendMessage(sendSignedTransaction(channelID, hash))
            })
            .catch((err) => {
              bot.sendMessage(error(channelID, err))
            });
          } else {
            bot.sendMessage({
              to: channelID,
              message: "Send Raw Tx requires a signed transaction (i.e. !sendRawTransaction <0xdeadbeef>)"
            });
          }
          break;

        // gasPrice
        case 'gasprice' :
          addReaction(channelID, evt, "\u{1F916}");
          web3.eth.getGasPrice()
          .then(gas => {
            bot.sendMessage(getGasPrice(channelID, gas))
          })
          .catch((err) => {
            bot.sendMessage(error(channelID, err))
          });
          break;

        // getBlock
        case 'getblock':
          addReaction(channelID, evt, "\u{1F916}");
          if(payload != undefined){
            var funcs = args[2];
            web3.eth.getBlock(payload)
            .then( rawBlk => {
              bot.sendMessage(getBlock(channelID, funcs, rawBlk))
            })
            .catch((err) => {
              bot.sendMessage(error(channelID, err))
            });
          } else {
            bot.sendMessage({
              to: channelID,
              message: "Get transaction requires a txId (i.e. !getTransaction <txId>)"
            });
          }
          break;
      
          //catch all
        case 'query':
          addReaction(channelID, evt, "\u{1F916}");
          if(payload != undefined && isNumber(payload)){
            if(web3.utils.isAddress(payload)){
              web3.eth.getBalance(payload)
              .then( balance => {
                bot.sendMessage(getBalance(channelID, payload, balance));
              })
              .catch((err) => {
                bot.sendMessage(error(channelID, err))
              });
            } else if (payload.length == 66 ){
              web3.eth.getTransaction(payload).then(
              transaction => {
                bot.sendMessage(getTransaction(channelID, payload, transaction));
              })
            } else if (payload.length <= 9) {
              web3.eth.getBlock(payload)
              .then( rawBlk => {
                bot.sendMessage(getBlock(channelID, funcs, rawBlk))
              })
              .catch((err) => {
                bot.sendMessage(error(channelID, err))
              });
            } else {
              bot.sendMessage({
                  to: channelID,
                  message: "Query requires a payload of txId, or account, block number, or something (i.e. !query <something>)"
              });
            }
          } else {
            bot.sendMessage({
                to: channelID,
                message: "Query requires a payload of txId, or account, block number, or something (i.e. !query <something>)"
            });
          };
          break;

//* dapps *//
        case 'statebot':
          statebot.methods.currentAddr().call()
          .then( ca => {
            bot.sendMessage({
              to: channelID,
              message :  "The most current state dump is located at http://ipfs.io/ipfs/" +ca
            });
          });
          break;

        case 'community':
          if(payload != undefined){
            switch(payload) {
              case 'address':
                bot.sendMessage({
                  to: channelID,
                  message :  "The community multisig is located at: `" + multi.options.address + "`"
                });
                break;
              case 'balance':
                web3.eth.getBalance(multi.options.address)
                .then (res => {
                  bot.sendMessage(getBalance(channelID, "Community Multisig", res))
                });
                break;
            }
          } else {
            bot.sendMessage({
              to: channelID,
              message :  "Please use either `!community balance` or `!community address`"
            });
          }
          break;
        
        case 'donate' :
          if(payload != undefined){
            bot.sendMessage({
              to: channelID,
              message :  'Creating a contract with ' + dLoad[2] +' as the owner giving ' + dLoad[1] +'% of anything donated to '+ dLoad[0] + '.'
            });
            bot.sendMessage(await donate(channelID, user,dLoad))
          } else {
            bot.sendMessage(donatehelp(channelID));
          }
          break;

        case 'getetc' :
          if(payload != undefined && web3.utils.isAddress(payload)){
            bot.sendMessage({
              to: channelID,
              message :  'Ok, I\'ll see if I can send some gas money.'
            });
            bot.sendMessage(await getetc(channelID, user, payload))
          } else {
            bot.sendMessage({
              to: channelID,
              message :  "Sorry" + user + " try again with an address!"
            });
          }
          break;
       
        case 'getkotti' :
          if(payload != undefined && web3.utils.isAddress(payload)){
            bot.sendMessage({
              to: channelID,
              message :  'Ok, I\'ll see if I can send some kotti.'
            });
            getkotti(channelID, bot, user, payload)
          } else {
            bot.sendMessage({
              to: channelID,
              message :  "Sorry" + user + " try again with an address!"
            });
          }
          break;


        case 'mail' :
          if(payload != undefined){
            addReaction(channelID, evt, "\u{1F916}");
            bot.sendMessage(await etcmail(channelID, user, args)
            .catch((err) => {
              addReaction(channelID, evt, "⛔");
              console.error(err)}));
          } else {
            bot.sendMessage(etcmailhelp(channelID));
          }
          break;

        case 'tipper' :
          if(payload != undefined){
            await tipper(channelID, user, userID, args, evt)
          } else {
            addReaction(channelID, evt, "⚠️");
            bot.sendMessage(tipperError(channelID));
          }
          break;

        case 'events' :
          bot.sendMessage(await eventLog(channelID, user, payload));
        break;

      };
       //* forks *//
      for(var fork in forks.forks) {
//      log.debug('[Bridgett-bot/index.js] fork check:' + forks.forks[fork].fn);
        if( forks.forks[fork].fn == cmd ){
          log.debug("matched "+cmd);
          log.debug("block" + forks.forks[fork].fn);
          var check = forks.forks[fork];
            try{
              log.debug("forkblock: "+check.block);
              bot.sendMessage(atlantis(channelID, check.name, check.block, blockSTATE.blockNumber, blockSTATE.averageBlockTime));
            }
            catch(err) {
              bot.sendMessage(error(channelID, err))
            };
        }
      }

    }
});

module.exports.bot = bot;
