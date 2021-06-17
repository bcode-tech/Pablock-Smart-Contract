// SPDX-License-Identifier: MIT
pragma solidity ^0.7.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./PablockToken.sol";

contract PablockNFT is ERC721 {
    
    address private contractOwner;
    address private pablockTokenAddress;
    uint256 private counter;

    event TokenGeneration(address indexed from, string indexed uri, uint[] indexes) ;

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

    function generateToken(uint quantity, string memory _uri) public initialized {

        PablockToken(pablockTokenAddress).receiveAndBurn(quantity, msg.sender);

        uint[] memory indexes = new uint[](quantity);

        // uint[quantity] memory indexes;

        for(uint i = 0; i < quantity; i++ ){
            _safeMint(msg.sender, counter);
            _setTokenURI(counter, _uri);
            indexes[i] = counter;
            counter++;
        }

        emit TokenGeneration(msg.sender, _uri, indexes);
    }

    function transferNFT(address from, address to, uint256 tokenId) public initialized {
        PablockToken(pablockTokenAddress).receiveAndBurn(1, msg.sender);
        transferFrom(from, to, tokenId);
    }

    function getVersion() public view returns (string memory){
        return "PablockNFT version 0.2.0";
    }

    function getPablockTokenAddress() public view returns(address){
        return pablockTokenAddress;
    }

}