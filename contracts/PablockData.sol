// SPDX-License-Identifier: MIT
pragma solidity ^0.7.4;

contract PablockData{

    struct PablockContracts {
        address pablockToken;
        address pablockNFT;
        address oablockNotarization;
        address pablockMultiSignFactory;
    }

    mapping (bytes32 => uint256) private functionPrices;

    address private contractOwner;
    PablockContracts private pablockContracts;
    PablockContracts private pablockGaslessContracts;

    modifier byOwner {
        require(contractOwner == msg.sender, "Contract update not allowed");
        _;
    }


    constructor (address _pablockToken, address _pablockNFT, address, _pablockNotarization, address _pablockMultiSignFactory) public {
        pablockToken = _pablockToken;
        pablockNFT = _pablockNFT;
        pablockNotarization = _pablockNotarization;
        pablockMultiSignFactory = _pablockMultiSignFactory;

        contractOwner = msg.sender;
    }

    function updateContractAddress(address _newAddr, string _key) public byOwner {
        pablockContracts[_key] = _newAddr;
    }

    function updateGaslessContractAddress(address _newAddr, string _key) public byOwner {
        pablockGaslessContracts[_key] = _newAddr;
    }

    function getContractAddress(string _key) public returns (string addr)  {
        return pablockContracts[_key];
    }

    function getGaslessContractAddress(string _key) public returns (string addr)  {
        return pablockGaslessContracts[_key];
    }

    function addFunctionPrice(bytes32 functionSig, uint256 price) public byOwner {
        functionPrices[functionSig] = price;
    }

    function getFunctionPrice(bytes32 functionSig) public returns (uint256 price) {
        return functionPrices[functionSig];
    }

    function isFunctionSigSet(bytes32 functionSig) public returns (bool) {
        return exists(functionPrices[functionSig]);
    }

    function changeOwner(address _newOwner) public byOwner {
        contractOwner = _newOwner;
    }

}