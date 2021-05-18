// SPDX-License-Identifier: MIT
pragma solidity ^0.7.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./PablockToken.sol";

contract PablockNFT is ERC721 {
    
    address private contractOwner;
    address private pablockTokenAddress;
    uint256 private counter;
    

    constructor(string memory _tokenName, string memory _tokenSymbol, address _contractAddr) ERC721(_tokenName, _tokenSymbol){
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

    function generateToken(uint256 _quantity, string memory _uri) public initialized returns (uint[] memory) {

        PablockToken(pablockTokenAddress).receiveAndBurn(_quantity, msg.sender);

        uint[] memory indexes;

        for(uint i = 0; i < _quantity; i++ ){
            _safeMint(msg.sender, counter);
            _setTokenURI(counter, _uri);
            indexes[i] = counter;
            counter++;
        }

        return indexes;

    }

}