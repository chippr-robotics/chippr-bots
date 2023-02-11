module.exports = (channelID) => {
  return {
    to: channelID,
    message: "``` I am Bridgette, the minimilst web3 bridge." + "\n"
    + "    Commands: " + "\n"
    + "        query: use <addr> or <blkNumber> or <txHash> to get info" +"\n"
    + "   ;    getBlockNumber : returns the current block number" +"\n"
    + "  [\"]   getBalance <account>: returns an account\'s balance" +"\n"
    + " /[_]\\  getTransaction <txId>: get info on a transaction" +"\n"
    + "  ] [   sendSignedTransaction <txHash>: send a signed transaction" +"\n"
    + "        gasPrice: gets the median gas price" +"\n"
    + "        getBlock <number> returns a block with info" +"\n"
    + "        depi: get a pizza!" +"\n"
    + " " +"\n"
    + "      dapps:" +"\n"
    + "      (x) statebot: get the latest state dump on ipfs" +"\n"
    + "      (x) getETC <addr>: get a small amount of etc if you need gas money " +"\n"
    + "       community: see the balance of the community multisig" +"\n"
    + "      (x) mail: send a message to an address" + "\n"
    + "      (x) donate <team> <percent> <addr>: get a contract to donate to your fav dev team" +"\n"
    + "      (x) tipper: send a Tipper Coin to users" + "\n"
    + "       forkit <year> <month> <day>: get a range of blocks for a date" +"\n"
    + "```"

  };
};
