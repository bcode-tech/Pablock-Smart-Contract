// SPDX-License-Identifier: MIT

pragma solidity ^0.7.4;

import "./PablockToken.sol";
pragma experimental ABIEncoderV2;

contract PablockMultiSignNotarization {


    address private pablockTokenAddress;
    


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

    
    constructor (bytes32 _hash, address[] memory _signers, string memory _uri, uint256 _expirationDate, address _pablockTokenAddress ) public {
        hash = _hash;
        pablockTokenAddress = _pablockTokenAddress;
        uri = _uri;
        // expirationDate = _expirationDate;

        for (uint i = 0; i < _signers.length; i++) {
            signers.push(Signer(_signers[i], true, false));
            indexOfSigners[_signers[i]] = i;
        }


    }

    function signDocument() public {
        require(signers[indexOfSigners[msg.sender]].initialized, "Signers does not exists");

        PablockToken(pablockTokenAddress).receiveAndBurn(1, msg.sender);

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
