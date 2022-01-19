// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../EIP712MetaTransaction.sol";

import "../PablockMetaTxReceiver.sol";

contract TestMetaTransaction is PablockMetaTxReceiver {
  uint256 public counter = 0;
  address private pablockTokenAddress;

  event Notarize(bytes32 hash, string uri, address applicant);

  constructor(
    string memory _name,
    string memory _version,
    address _pablockTokenAddress,
    address _metaTxAddress
  ) public PablockMetaTxReceiver(_name, _version) {
    pablockTokenAddress = _pablockTokenAddress;

    setMetaTransaction(_metaTxAddress);
  }

  function increment() public {
    // IPablockToken(pablockTokenAddress).receiveAndBurn(address(this), msg.sig, applicant);
    counter = counter + 1;
  }

  function decrement() public {
    counter = counter - 1;
  }

  function setCounter(uint256 _counter, address account) public {
    IPablockToken(pablockTokenAddress).receiveAndBurn(
      address(this),
      msg.sig,
      account
    );
    counter = _counter;
  }

  function getCounter() public view returns (uint256) {
    return counter;
  }

  function notarize(
    bytes32 hash,
    string memory uri,
    address applicant
  ) public initialized {
    IPablockToken(pablockTokenAddress).receiveAndBurn(
      address(this),
      msg.sig,
      applicant
    );
    emit Notarize(hash, uri, applicant);
  }
}
