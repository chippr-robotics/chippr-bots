const { log } = require("@chippr-bots/common");
const Web3 = require('web3');
const kvs = require("@chippr-bots/contracts/build/contracts/kvs")
const EventEmitter = require("events");
const assert = require("assert");

module.exports = class bridgetteDB {

    /**
     * Connects to the blockchain and returns a new BDB object
     * @param {Object} config - The optional config object
     * @param {String} config.nodeAddr - The address of the ethereum node
     * @param {String} config.accountAddress - The account to use on the node to send transactions
     * @param {String} config.accountPassword - The password of the account to be used
     * @param {String} config.kvsAddr - The contract address of the kvs on chain
     * @param {String} config.DBKEY - The key to id the db, should be unique
     */

    constructor( {
        nodeAddr = process.env.NODEADDR,
        accountAddress = process.env.BRIDGETTE_ADDRESS_KOTTI, 
        accountPasswd = process.env.BRIDGETTE_PW_KOTTI,
        kvsAddr = kvs.networks['6'].address,
        DBKEY = process.env.DBKEY || "default",
     } = {}) {
       //validate constructor types
	assert.equal(typeof nodeAddr, "string");
//        assert.match(accountAddress, /^0x[a-fA-F0-9]{40}$/);
        assert.equal(typeof accountPasswd,"string");
//        assert.match(kvsAddr, /^0x[a-fA-F0-9]{40}$/);
	assert.equal(typeof DBKEY,"string");

      log.info(
        "BridgetteDB config: " +
        "node address: " + nodeAddr + ", " +
        "kvsAddr: " + kvsAddr + ", " +
        "user account: " + accountAddress + ", " +
        "user password: " + accountPasswd + ", " +
        "dbkey: " + DBKEY
      );


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
     var res = await this.kvsContract.methods.store( key ).call();
     return res;
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


