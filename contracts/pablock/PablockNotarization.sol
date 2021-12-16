// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../PablockMetaTxReceiver.sol";
import "../PablockToken.sol";

contract PablockNotarization is PablockMetaTxReceiver {
  address private pablockTokenAddress;

  event Notarize(bytes32 hash, string uri, address applicant, string appId);

  mapping(address => bool) authAddresses;

  constructor(
    address _pablockTokenAddress,
    address _metaTxAddress,
    address _payer
  ) PablockMetaTxReceiver("PablockNotarization", "0.1.1") {
    pablockTokenAddress = _pablockTokenAddress;

    setMetaTransaction(_metaTxAddress);
    setPayer(_payer);
  }

  modifier isInitialized() {
    require(pablockTokenAddress != address(0), "Contract not initialized");
    _;
  }

  function initialize(address contractAddr) public byOwner {
    pablockTokenAddress = contractAddr;
  }

  function needToPay() internal view returns (bool) {
    return
      !hasRole(DEFAULT_ADMIN_ROLE, msgSender()) &&
      !hasRole(PAYER_ROLE, msgSender());
  }

  function setPauseStatus(bool status) public byOwner {
    if (status) {
      _pause();
    } else {
      _unpause();
    }
  }

  function notarize(
    bytes32 hash,
    string memory uri,
    address applicant,
    string memory appId
  ) public isInitialized {
    if (needToPay()) {
      PablockToken(pablockTokenAddress).receiveAndBurn(
        address(this),
        msg.sig,
        applicant
      );
    }
    emit Notarize(hash, uri, applicant, appId);
  }
}
