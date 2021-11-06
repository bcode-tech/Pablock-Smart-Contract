// SPDX-License-Identifier: MIT
pragma solidity ^0.7.4;

import "../EIP712MetaTransaction.sol";
import "../PablockToken.sol";

contract PablockNotarization {

    address private contractOwner;
    address private metaTransactionAddress;
    address private pablockTokenAddress;

    event Notarize(bytes32 hash, string uri, address applicant, string appId);

    constructor(address _pablockTokenAddress, address _metaTxAddress){
        contractOwner = msg.sender;
        pablockTokenAddress = _pablockTokenAddress;
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
    
    function notarize(bytes32 hash, string memory uri, address applicant, string memory appId) public initialized {
        PablockToken(pablockTokenAddress).receiveAndBurn(address(this), msg.sig, applicant);
        emit Notarize(hash, uri, applicant, appId);
    }

}
