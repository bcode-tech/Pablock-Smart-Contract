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

    mapping(address => Signer) private signers;
    
    bytes32 private hash;
    string private uri;
    uint256 private expirationDate;
    // bool[] private signers;

    
    constructor (bytes32 _hash, address[] memory _signers, string memory _uri, uint256 _expirationDate, address _pablockTokenAddress ) public {
        hash = _hash;
        pablockTokenAddress = _pablockTokenAddress;
        uri = _uri;
        // expirationDate = _expirationDate;

        for (uint i = 0; i < _signers.length; i++) {
            signers[_signers[i]] = Signer(_signers[i], true, false);
        }


    }

    function signDocument() public {
        require(signers[msg.sender].initialized, "Signers does not exists");

        PablockToken(pablockTokenAddress).receiveAndBurn(1, msg.sender);

        signers[msg.sender].signed = true;
    }

    function getNotarizationData() public view returns (bytes32, string memory, uint256 ) {

        return (hash,  uri, expirationDate);
    }

    function getURI() public view returns (string memory){
        return uri;
    }

}
