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

  event update(bytes32, string);
  event remove(bytes32);

  function set(bytes32 _key, string _newValue) public onlyOwner returns(bool){
      store[_key] = _newValue;
      emit update(_key, _newValue);
      return true;
  }
  
  function bulkSet(bytes32[] _key, string[] _newValue) public onlyOwner returns(bool){
      for(i=0; i <= _key.length; ){
        store[_key[i]] = _newValue[i];
        emit update(_key[i], _newValue[i]);
      }
      return true;
  }

  function rem(bytes32 _key) public onlyOwner returns(bool){
      store[_key] = "";
      emit remove(bytes32);
      return true;
  }
  
  function bulkSet(bytes32[] _key) public onlyOwner returns(bool){
      for(i=0; i <= _key.length; ){
        store[_key[i]] = "";
        emit remove(_key[i]);
      }
      return true;
  }
}
