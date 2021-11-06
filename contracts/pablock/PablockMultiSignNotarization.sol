// SPDX-License-Identifier: MIT

pragma solidity ^0.7.4;

import "../EIP712MetaTransaction.sol";
import "../PablockToken.sol";

pragma experimental ABIEncoderV2;

contract PablockMultiSignNotarization {

    address private pablockTokenAddress;    
    address private metaTxAddress;

    struct Signer {
        address addr;
        bool initialized;
        bool signed;
    }

    mapping(address => uint256) private indexOfSigners;

    bytes32 private hash;
    string private uri;
    uint256 private expirationDate;
    Signer[] private signers;

    
    constructor (bytes32 _hash, address[] memory _signers, string memory _uri, uint256 _expirationDate, address _pablockTokenAddress, address _metaTxAddress ) public {
        hash = _hash;
        pablockTokenAddress = _pablockTokenAddress;
        metaTxAddress = _metaTxAddress;
        uri = _uri;
        // expirationDate = _expirationDate;

        for (uint i = 0; i < _signers.length; i++) {
            signers.push(Signer(_signers[i], true, false));
            indexOfSigners[_signers[i]] = i;
        }

        EIP712MetaTransaction(_metaTxAddress).registerContract("PablockMultiSignNotarization", "0.2.1", address(this));
    }

    //Need to integrate signature to sign with meta transaction, otherwise anyone can firm any address
    function signDocument() public {
        require(signers[indexOfSigners[msg.sender]].initialized, "Signers does not exists");
        PablockToken(pablockTokenAddress).receiveAndBurn(address(this), msg.sig, msg.sender);

        signers[indexOfSigners[msg.sender]].signed = true;
    }

    function getNotarizationData() public view returns (bytes32, string memory, uint256 ) {

        return (hash,  uri, expirationDate);
    }

    function getURI() public view returns (string memory){
        return uri;
    }

    function getSignerStatus(address signer) public view returns (bool){
        return signers[indexOfSigners[signer]].signed;

    } 

    function getVersion() public view returns (string memory){
        return "Version 0.1.0";
    }
}
