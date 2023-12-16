// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "etc_army_v1.sol";

/// @custom:security-contact info@chipprbots.com
contract WETCv1 {
    /// @custom:oz-upgrades-unsafe-allow constructor
    ETCArmy proxyMain;

    constructor(ETCArmy _contract){
        proxyMain = _contract;
    }

    function mint(address to, uint256 amount) public  {
        proxyMain.mint(to, 0x0000000000000000000000000000000000000000000000000000000000000000, amount,"");
    }

    //balanceof
    //transfer
       /**
     * @dev Moves a `value` amount of tokens from `from` to `to`.
     *
     * This internal function is equivalent to {transfer}, and can be used to
     * e.g. implement automatic token fees, slashing mechanisms, etc.
     *
     * Emits a {Transfer} event.
     *
     * NOTE: This function is not virtual, {_update} should be overridden instead.
     */
    function _transfer(address from, address to, uint256 value) internal {
        if (from == address(0)) {
            revert ERC20InvalidSender(address(0));
        }
        if (to == address(0)) {
            revert ERC20InvalidReceiver(address(0));
        }
        _update(from, to, value);
    }
    //burn

   
}