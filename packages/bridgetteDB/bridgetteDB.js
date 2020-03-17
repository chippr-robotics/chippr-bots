var kotti = require("@chippr-bots/common/kotti");

var  kvs = require("@chippr-bots/contracts/build/contracts/kvs")


const ABI = kvs.abi;
const kvsAddr = kvs.networks['6'].address;

const kvsContract = new kotti.eth.Contract(ABI, kvsAddr);

kotti.eth.net.isListening().then( res => {console.log(res)});

module.exports = class bridgetteDB {

    constructor( { accountAddress = process.env.BRIDGETTE_ADDRESS_KOTTI || null, 
                   accountPasswd = process.env.BRIDGETTE_PW_KOTTI || null
                } ) {
      this.accountAddress = accountAddress;
      this.accountPasswd = accountPasswd;
    }

    async get( _key ) {
     let key = kotti.utils.sha3(_key);
      return await kvsContract.methods.store( key ).call();
   }

   async set( _key, _value ) {
     let key = kotti.utils.sha3(_key);
     kotti.eth.personal.unlockAccount(this.accountAddress, this.accountPasswd, 600);
      return await kvsContract.methods.set( key, _value ).send({
        from: this.accountAddress,
        gas: '900000',
        gasPrice: '20000000000'
      })
   }

   async rem( _key ) {
     let key = kotti.utils.sha3(_key);
     kotti.eth.personal.unlockAccount(this.accountAddress, this.accountPasswd, 600);
      return await kvsContract.methods.rem( key ).send({
        from: this.accountAddress,
        gas: '90000',
        gasPrice: '20000000000'
      })
   }

 









}


