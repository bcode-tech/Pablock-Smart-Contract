// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract PablockData {
    struct PablockContracts {
        address pablockToken;
        address pablockNFT;
        address pablockNotarization;
        address pablockMultiSignFactory;
    }

    mapping(bytes32 => uint256) private functionPrices;

    address private contractOwner;
    PablockContracts private pablockContracts;

    modifier byOwner {
        require(contractOwner == msg.sender, "Contract update not allowed");
        _;
    }

    constructor(
        address _pablockToken,
        address _pablockNFT,
        address _pablockNotarization,
        address _pablockMultiSignFactory
    ) {
        pablockContracts.pablockToken = _pablockToken;
        pablockContracts.pablockNFT = _pablockNFT;
        pablockContracts.pablockNotarization = _pablockNotarization;
        pablockContracts.pablockMultiSignFactory = _pablockMultiSignFactory;

        contractOwner = msg.sender;
    }

    // function updateContractAddress(address _newAddr, string memory _key) public byOwner {
    //     pablockContracts[_key] = _newAddr;
    // }

    // function getContractAddress(string memory _key) public returns (string memory addr)  {
    //     return pablockContracts[_key];
    // }

    // function addFunctionPrice(bytes32 functionSig, uint256 price) public byOwner {
    //     functionPrices[functionSig] = price;
    // }

    // function getFunctionPrice(bytes32 functionSig) public returns (uint256 price) {
    //     return functionPrices[functionSig];
    // }

    // function isFunctionSigSet(bytes32 functionSig) public returns (bool) {
    //     return exists(functionPrices[functionSig]);
    // }

    function changeOwner(address _newOwner) public byOwner {
        contractOwner = _newOwner;
    }
}
