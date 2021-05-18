// SPDX-License-Identifier: MIT
pragma solidity ^0.7.4;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "./PablockToken.sol";

contract PablockNFT is ERC1155 {

    struct Token{
        string name;
        string symbol;
        uint256 maxSupply;
        address creator;
    }

    mapping(uint256 => Token) public tokensData;
    
    address private contractOwner;
    address private pablockTokenAddress;
    uint256 private counter;
    

    constructor(address _contractAddr) ERC1155(""){
        counter = 0;
        pablockTokenAddress = _contractAddr;
        contractOwner = msg.sender;
    }

      modifier byOwner(){
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

    function generateToken(string memory _name, string memory _symbol, uint256 _maxSupply, string memory _uri) public initialized returns (uint256 id){

        PablockToken(pablockTokenAddress).receiveAndBurn(_maxSupply, msg.sender);

        _mint(msg.sender, counter, _maxSupply, bytes(_uri));

        tokensData[counter] = Token(_name, _symbol, _maxSupply, msg.sender);
        counter++;

        return counter;

    }

}