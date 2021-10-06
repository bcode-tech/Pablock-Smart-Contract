// SPDX-License-Identifier: MIT
pragma solidity ^0.7.4;

import "./PablockToken.sol";

contract PablockNotarization {

    address private pablockTokenAddress;
    address private contractOwner;

    event Notarize(bytes32 hash, string uri);

    constructor(address _pablockToken) {
        contractOwner = msg.sender;
        pablockTokenAddress = _pablockToken;
    }

    modifier byOwner {
        require(contractOwner == msg.sender, "Not allowed");
        _;
    }

    modifier initialized {
        require(pablockTokenAddress != address(0), "Contract not initialized");
        _;
    }

    function initialize (address contractAddr) public byOwner {
        pablockTokenAddress = contractAddr;
    }
    
    function notarize(bytes32 hash, string memory uri) public initialized {

        PablockToken(pablockTokenAddress).receiveAndBurn(1, msg.sender);

        emit Notarize(hash, uri);
    }
}
