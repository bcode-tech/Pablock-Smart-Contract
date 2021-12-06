// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../PablockMetaTxReceiver.sol";
import "../PablockToken.sol";

contract PablockNotarization is PablockMetaTxReceiver {

    address private contractOwner;
    address private pablockTokenAddress;

    event Notarize(bytes32 hash, string uri, address applicant, string appId);

    constructor(address _pablockTokenAddress, address _metaTxAddress) PablockMetaTxReceiver("PablockNotarization", "0.1.0", _metaTxAddress){
        contractOwner = msg.sender;
        pablockTokenAddress = _pablockTokenAddress;
    }

    modifier byOwner {
        require(contractOwner == msg.sender, "Not allowed");
        _;
    }

    modifier isInitialized {
        require(pablockTokenAddress != address(0), "Contract not initialized");
        _;
    }

    function initialize (address contractAddr) public byOwner {
        pablockTokenAddress = contractAddr;
    }
    
    function notarize(bytes32 hash, string memory uri, address applicant, string memory appId) public isInitialized {
        PablockToken(pablockTokenAddress).receiveAndBurn(address(this), msg.sig, applicant);
        emit Notarize(hash, uri, applicant, appId);
    }

}
