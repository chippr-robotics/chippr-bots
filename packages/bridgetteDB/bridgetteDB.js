var { log } = require("@chippr-bots/common");
var Web3 = require('web3');
var  kvs = require("@chippr-bots/contracts/build/contracts/kvs")


module.exports = class bridgetteDB {

    constructor( {
                   nodeAddr = process.env.NODEADDR || null,
                   accountAddress = process.env.BRIDGETTE_ADDRESS_KOTTI || null, 
                   accountPasswd = process.env.BRIDGETTE_PW_KOTTI || null,
                   kvsAddr = process.env.kvsContract ||  kvs.networks['6'].address,
                   DBKEY = process.env.DBKEY || null,
                } ) {
      //setup node connection
      this.nodeAddr = nodeAddr;
      this.web3 = new Web3(new Web3.providers.HttpProvider(this.nodeAddr));
      //save account info
      this.accountAddress = accountAddress;
      this.accountPasswd = accountPasswd;
      this.DBKEY = DBKEY;

      //setup smart contract
      this.ABI = kvs.abi;
      this.kvsAddr = kvsAddr;
      this.kvsContract = new this.web3.eth.Contract(this.ABI, this.kvsAddr);

     // return connection information
      log.info(
        "BridgetteDB established \n" +
        "node address: " + this.nodeAddr + "\n" +
        "kvsAddr: " + this.kvsAddr + "\n" +
        "user account: " + this.accountAddress + "\n" +
        "user password: " + this.accountPasswd + "\n" +
        "dbkey: " + this.DBKEY
      );
      this.web3.eth.net.isListening().then( res => {console.log(res)});
    }

// util functions
   unlock(){
    this.web3.eth.personal.unlockAccount(this.accountAddress, this.accountPasswd, 600);
    return true;
   }

   getKey( _key ) {
    return this.web3.utils.sha3(this.DBKEY + _key);
   }

//db functions
   async get( _key ) {
     let key = this.getKey( _key );
     await this.kvsContract.methods.store( key ).call().then( res => {
       return res;
       })
     }

   async set( _key, _value ) {
     let key = this.getKey( _key );
     await this.unlock();
     return await this.kvsContract.methods.set( key, _value ).send({
        from: this.accountAddress,
        gas: '900000',
        gasPrice: '20000000000'
      })
   }

   async rem( _key ) {
     let key = this.getKey( _key );
     await this.unlock();
     return await this.kvsContract.methods.rem( key ).send({
        from: this.accountAddress,
        gas: '90000',
        gasPrice: '20000000000'
      })
   }
}


