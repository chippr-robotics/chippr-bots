var contract = require("@truffle/contract");

var K = require("../build/contracts/faucet");
var Faucet = contract(K);

module.exports = function(callback) {
 var f = Faucet.deployed();
 console.log(f);
}
