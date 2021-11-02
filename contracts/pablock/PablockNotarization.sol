// SPDX-License-Identifier: MIT
pragma solidity ^0.7.4;

import "../EIP712MetaTransaction.sol";

contract PablockNotarization is EIP712MetaTransaction {

    address private contractOwner;
    address private metaTransactionAddress;

    event Notarize(bytes32 hash, string uri, address applicant);

    constructor(address _metaTxAddress) EIP712MetaTransaction("PablockNotarization", "0.1.0", _metaTxAddress){
        contractOwner = msg.sender;
        metaTransactionAddress = _metaTxAddress;
        EIP712MetaTransaction(_metaTxAddress).registerContract("PablockNotarization", "0.1.0", address(this));
    }

   

    modifier byOwner {
        require(contractOwner == msg.sender, "Not allowed");
        _;
    }

    modifier initialized {
        require(metaTransactionAddress != address(0), "Contract not initialized");
        _;
    }

    function initialize (address contractAddr) public byOwner {
        metaTransactionAddress = contractAddr;
    }
    
    function notarize(bytes32 hash, string memory uri, address applicant) public initialized {

        emit Notarize(hash, uri, applicant);
    }

}
