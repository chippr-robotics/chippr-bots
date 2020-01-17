var { log, kotti } = require("./index");

var  kvs = require("@chippr-bots/contracts/build/contracts/kvs")

log.debug('[common/realstate] realstate loaded');


const ABI = kvs.abi;
const kvsAddr = kvs.networks['6'].address;

const kvsContract = new kotti.eth.Contract(ABI, kvsAddr);

module.exports = class blkState {

    constructor(fate, blkStack, blockNumber, averageBlockTime, blkDiv) {
      this.blockNumber = blockNumber;
      this.averageBlockTime = averageBlockTime;
      this.blkDiv = blkDiv ;
      this.blkStack = blkStack;
      this.fate = fate;
    }

    get( _key ) {
     let key = kotti.utils.sha3(_key);
     kotti.eth.personal.unlockAccount(process.env.BRIDGETTE_ADDRESS_KOTTI, process.env.BRIDGETTE_PW_KOTTI, 600);
      return kvsContract.method.store( key ).send({
        from: process.env.BRIDGETTE_ADDRESS_KOTTI,
        gas: '90000',
        gasPrice: '20000000000'
      })
      .on('reciept', function(receipt){
        console.log("got receipt");
        console.log(receipt);
        })
     .on('error', function(error){bot.sendMessage(msg)});
   }
    set( _key, _value ) {
     let key = kotti.utils.sha3(_key);
     kotti.eth.personal.unlockAccount(process.env.BRIDGETTE_ADDRESS_KOTTI, process.env.BRIDGETTE_PW_KOTTI, 600);
      return kvsContract.method.set( key, _value ).send({
        from: process.env.BRIDGETTE_ADDRESS_KOTTI,
        gas: '900000',
        gasPrice: '20000000000'
      })
      .on('reciept', function(receipt){
        console.log("got receipt");
        console.log(receipt);
        })
     .on('error', console.error());
   }










}


