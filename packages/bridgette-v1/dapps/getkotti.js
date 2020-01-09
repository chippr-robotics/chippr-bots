// based on bot made by the ellisiam team

const { log, kotti } = require('@chippr-bots/common');

log.debug('[Bridgette-bot/lib/statebot] GETKOTTI loaded');

var faucet = require('@chippr-bots/contracts/build/contracts/faucet.json');

const ABI = faucet.abi;
const faucetAddr = "0xe27F239443803dc1B804f6c6603d68e43312781e";

const faucetContract = new kotti.eth.Contract(ABI, faucetAddr);


module.exports = async (channelID, sender,  args) => {

//*  get a payout *//
  kotti.eth.personal.unlockAccount(process.env.BRIDGETTE_ADDRESS_KOTTI, process.env.BRIDGETTE_PW_KOTTI);
  //console.log(args);
  const newDrip = await faucetContract.methods.getETC(args).send({
    from: process.env.BRIDGETTE_ADDRESS_KOTTI,
    gas: '90000',
    gasPrice: '20000000000'
  })
    .then( res => {
      return {
          to: channelID,
          message : '@'+ sender + ', I sent you some kotti money! You\'re welcome!'
        }
    })
  .catch((err) => {
    return {
      to: channelID,
      message : err
    }
  });
return {
    to: channelID,
    message : '@'+ sender + ', I have sent you some kotti money! You\'re welcome!'
  }

}
