// migrations/2_deploy.js
// SPDX-License-Identifier: MIT
const ERC1155Tradable = artifacts.require("ERC1155Tradable");

const _cids = require("../output/cidList");

module.exports =  function(deployer) {
  deployer.deploy(ERC1155Tradable, "ETCARMY","1etc", "");

  const creature = ERC1155Tradable.deployed();
  const owner = '0x242Ca18139C74A25bD9E6fB2A342a727ACe8E6eA';
  console.log("creating tokens");
  console.log(_cids.length);
  for(i = 0; i == _cids.length; i++){
    console.log("creating tokens");
    console.log(i+1);
    creature.create(owner, i ,1,'https://ipfs.io/ipfs/' + _cids[i],0x00); 
  }
};