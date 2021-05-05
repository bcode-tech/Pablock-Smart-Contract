pragma solidity ^0.6.2;

import "./PablockToken.sol";

contract PablockMultiSignNotarization {

    struct Signer {
        address signer;
        bool signed;
    }
    
    bytes32  hash;
    Signer[]  signers;
    string  uri;
    uint256  expirationDate;

    
    constructor (bytes32 hash, address[] signers, string uri, uint256 expirationDate ) {
        this.hash = hash;
       
        this.uri = uri;
        this.expirationDate = expirationDate;

        for (uint i = 0; i < signers.length; i++) {
            this.signers[signers[i]] = Signer(signers[i], false);
        }
    }
    

    function signDocument() public {
        require(signers[msg.sender].exists, "Signers does not exists");

        PablockToken.receiveAndBurn(1);

        this.signers[msg.sender].signed = true;
    }

    function getNotarizationData() public returns (address, Signer[], string, uint256) {
        return (this.hash, this.signers, this.uri, this.expirationDate);
    }

}