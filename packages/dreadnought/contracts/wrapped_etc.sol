// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "dreadnought_v1.sol";

/// @custom:security-contact info@chipprbots.com -- DO NOT USE THIS YET
contract WETCv1 {
    /// @custom:oz-upgrades-unsafe-allow constructor
    Dreadnought proxyMain;

    constructor(Dreadnought _contract){
        proxyMain = _contract;
    }

    function mint(address to, uint256 amount) public  {
        proxyMain.mint(to, 0x0000000000000000000000000000000000000000000000000000000000000000, amount,"");
    }

    //balanceof
    //transfer
    function _transfer(address from, address to, uint256 value) internal {
  
    }
    //burn

   
}