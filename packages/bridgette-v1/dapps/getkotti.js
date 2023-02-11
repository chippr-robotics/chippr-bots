// based on bot made by the ellisiam team

const { log, kotti } = require('@chippr-bots/common');

log.debug('[Bridgette-bot/lib/statebot] GETKOTTI loaded');

var faucet = require('@chippr-bots/contracts/build/contracts/faucet.json');

const ABI = faucet.abi;
const faucetAddr = "0xe27F239443803dc1B804f6c6603d68e43312781e";

const faucetContract = new kotti.eth.Contract(ABI, faucetAddr);


module.exports = async (channelID, bot, sender,  args) => {
var msg = {
        to: channelID,
        message : '@' + sender + ', Something went wrong. You must wait 100 blocks between requests'
};

//*  get a payout *//
  try{
    kotti.eth.personal.unlockAccount(process.env.BRIDGETTE_ADDRESS_KOTTI, process.env.BRIDGETTE_PW_KOTTI, 600);
    console.log("account unlocked");
   }
   catch(err){
    console.log(err);
  }
  //console.log(args);

var drip = await faucetContract.methods.getETC(args).send({
      from: process.env.BRIDGETTE_ADDRESS_KOTTI,
      gas: '90000',
      gasPrice: '20000000000'
      })
      .on('reciept', function(receipt){
        console.log("got receipt");
       console.log(receipt);
        bot.sendMessage({
          to: channelID,
          message : '@'+ sender + ', I sent you some kotti money! You\'re welcome!'
        });
      })
     .on('error', function(error){bot.sendMessage(msg)});
}
