pragma experimental ABIEncoderV2;
pragma solidity >=0.4.20 <0.6.0;

contract owned{
  function owned() public {owner = msg.sender;}
  address owner;
  modifier onlyOwner {
          require(msg.sender == owner);
          _;
          }
  }

contract kvs is owned{
 
  mapping(bytes32 => string) public store;

  function set(bytes32 _key, string _newValue) public onlyOwner returns(bool){
      store[_key] = _newValue;
      return true;
  }
  
  function rem(bytes32 _key) public onlyOwner returns(bool){
      store[_key] = "";
      return true;
  }
  
}
