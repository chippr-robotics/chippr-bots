var myContract = artifacts.require("faucet");

module.exports = async () => {
console.log(await myContract.deployed());

myContract.dripRate(100000, 100);
}
