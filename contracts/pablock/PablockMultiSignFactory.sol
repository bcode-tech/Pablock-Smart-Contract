// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./PablockMultiSignNotarization.sol";
import "../PablockToken.sol";

contract PablockMultiSignFactory is PablockMetaTxReceiver {
  address private contractOwner;
  address private pablockTokenAddress;

  event NewPablockMultiSignNotarization(address multiSignAddress);

  constructor(address _pablockTokenAddress, address _metaTxAddress)
    PablockMetaTxReceiver("PablockMultiSignFactory", "0.1.1")
  {
    contractOwner = msg.sender;
    pablockTokenAddress = _pablockTokenAddress;

    setMetaTransaction(_metaTxAddress);
  }

  function createNewMultiSignNotarization(
    bytes32 hash,
    address[] memory signers,
    string memory uri,
    uint256 expirationDate
  ) public initialized {
    //returns (PablockMultiSignNotarization){

    PablockToken(pablockTokenAddress).receiveAndBurn(
      address(this),
      msg.sig,
      msgSender()
    );

    PablockMultiSignNotarization _multiSign = new PablockMultiSignNotarization(
      hash,
      signers,
      uri,
      expirationDate,
      pablockTokenAddress,
      metaTxAddress
    );
    emit NewPablockMultiSignNotarization(address(_multiSign));

    // return _multiSign;
  }

  function initialize(address contractAddr) public byOwner {
    pablockTokenAddress = contractAddr;
  }

  function getVersion() public pure returns (string memory) {
    return "Version 0.1.1";
  }
}
