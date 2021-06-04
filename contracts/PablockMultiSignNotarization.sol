// SPDX-License-Identifier: MIT

pragma solidity ^0.7.4;

import "./PablockToken.sol";
pragma experimental ABIEncoderV2;

contract PablockMultiSignNotarization {


    address private pablockTokenAddress;

    struct Signer {
        address addr;
        bool signed;
    }

    // mapping(address => Signer) private signers;
    
    bytes32 private hash;
    string private uri;
    uint256 private expirationDate;
    Signer[] private signers;

    
    constructor (bytes32 _hash, address[] memory _signers, string memory _uri, uint256 _expirationDate, address _pablockTokenAddress ) {
        hash = _hash;
        pablockTokenAddress = _pablockTokenAddress;
        uri = _uri;
        expirationDate = _expirationDate;

        for (uint i = 0; i < _signers.length; i++) {
            signers[i] = Signer(_signers[i], false);
        }
    }

    function signDocument() public {
        // require(signers[msg.sender].registered, "Signers does not exists");

        PablockToken(pablockTokenAddress).receiveAndBurn(1, msg.sender);

        // signers[msg.sender].signed = true;
    }

    function getNotarizationData() public returns (bytes32, Signer [] memory, string memory, uint256 ) {
        return (hash, signers, uri, expirationDate);
    }
}
