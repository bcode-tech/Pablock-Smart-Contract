// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IPablockToken.sol";
import "../PablockMetaTxReceiver.sol";

contract TestMetaTransaction is Ownable, PablockMetaTxReceiver {
  uint256 public counter = 0;
  address private pablockTokenAddress;

  mapping(address => bool) allowed;

  event Notarize(bytes32 hash, string uri, address applicant);
  event Increment(uint256 counter);
  event SubUser(address _addr);

  constructor(address _metaTxAddress)
    PablockMetaTxReceiver("TestMetaTransaction", "0.1.0")
  {
    setMetaTransaction(_metaTxAddress);
  }

  modifier onlyContractOwner() {
    require(msgSender() == owner(), "Caller not owner");
    _;
  }

  modifier onlyAllowed() {
    require(owner() == msgSender() || allowed[msgSender()], "Not allowed");
    _;
  }

  function initialize(address _addr) public onlyContractOwner {
    pablockTokenAddress = _addr;
  }

  function increment() public onlyAllowed {
    counter = counter + 1;
    emit Increment(counter);
  }

  function decrement() public {
    counter = counter - 1;
  }

  function setCounter(uint256 _counter) public {
    counter = _counter;
  }

  function getCounter() public view returns (uint256) {
    return counter;
  }

  function allowedUser(address _addr) public onlyContractOwner {
    allowed[_addr] = true;
    emit SubUser(_addr);
  }

  function notarize(
    bytes32 hash,
    string memory uri,
    address applicant
  ) public initialized {
    emit Notarize(hash, uri, applicant);
  }
}
