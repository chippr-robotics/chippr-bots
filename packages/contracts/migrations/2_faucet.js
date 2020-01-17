var F = artifacts.require("./faucet.sol");

var i = {
  '_dropValue': '10',
  '_dripRate' : '100',
};

module.exports = function(deployer) {
  deployer.deploy(F, i._dropValue, i._dripRate);
};
