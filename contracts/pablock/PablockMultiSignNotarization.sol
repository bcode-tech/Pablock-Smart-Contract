// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "../PablockMetaTxReceiver.sol";
import "../interfaces/IPablockToken.sol";

pragma experimental ABIEncoderV2;

contract PablockMultiSignNotarization is PablockMetaTxReceiver {
  address private pablockTokenAddress;

  struct Signer {
    // address addr;
    bool initialized;
    bool signed;
  }

  // mapping(address => uint256) private indexOfSigners;
  mapping(address => Signer) private signers;

  bytes32 private hash;
  string private uri;
  uint256 private expirationDate;

  event SignDocument(address signer, address contractAddr);

  // Signer[] private signers;

  constructor(
    bytes32 _hash,
    address[] memory _signers,
    string memory _uri,
    uint256 _expirationDate,
    address _pablockTokenAddress,
    address _metaTxAddress
  ) PablockMetaTxReceiver("PablockMultiSignNotarization", "0.2.1") {
    hash = _hash;
    pablockTokenAddress = _pablockTokenAddress;
    uri = _uri;
    // expirationDate = _expirationDate;

    setMetaTransaction(_metaTxAddress);

    for (uint256 i = 0; i < _signers.length; i++) {
      // signers.push(Signer(_signers[i], true, false));
      // indexOfSigners[_signers[i]] = i;
      signers[_signers[i]].initialized = true;
    }
  }

  //Need to integrate signature to sign with meta transaction, otherwise anyone can firm any address
  function signDocument() public {
    // require(signers[indexOfSigners[msgSender()]].initialized, "Signers does not exists");
    require(signers[msgSender()].initialized, "Signers does not exists");

    IPablockToken(pablockTokenAddress).receiveAndBurn(
      address(this),
      msg.sig,
      msgSender()
    );

    signers[msgSender()].signed = true;

    emit SignDocument(msgSender(), address(this));
  }

  function getNotarizationData()
    public
    view
    returns (
      bytes32,
      string memory,
      uint256
    )
  {
    return (hash, uri, expirationDate);
  }

  function getURI() public view returns (string memory) {
    return uri;
  }

  function getSignerStatus(address signer) public view returns (bool) {
    // return signers[indexOfSigners[signer]].signed;
    return signers[signer].signed;
  }

  function getVersion() public pure returns (string memory) {
    return "Version 0.1.0";
  }
}
