// SPDX-License-Identifier: MIT
pragma solidity ^0.7.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./PablockToken.sol";

import "../EIP712MetaTransaction.sol";


contract PablockNFT is ERC721 {
    
    address private contractOwner;
    address private metaTxAddress;
    uint256 private counter;

    mapping(address => uint256) private nonces;


    event TokenGeneration(address indexed from, string indexed uri, uint[] indexes) ;

    constructor(string memory _tokenName, string memory _tokenSymbol, address _metaTxAddress) ERC721(_tokenName, _tokenSymbol){
        counter = 0;
        metaTxAddress = _metaTxAddress;
        contractOwner = msg.sender;

        EIP712MetaTransaction(_metaTxAddress).registerContract(_tokenName, "0.2.1", address(this));
    }

    modifier byOwner(){
        require(contractOwner == msg.sender, "Not allowed");
        _;
    }
    
    modifier initialized {
        require(metaTxAddress != address(0), "Contract not initialized");
        _;
    }

    function initialize (address contractAddr) public byOwner {
        metaTxAddress = contractAddr;
    }

    function generateToken(address to, uint quantity, string memory _uri) public initialized {


        uint[] memory indexes = new uint[](quantity);

        // uint[quantity] memory indexes;

        for(uint i = 0; i < quantity; i++ ){
            _safeMint(to, counter);
            _setTokenURI(counter, _uri);
            indexes[i] = counter;
            counter++;
        }

        emit TokenGeneration(msg.sender, _uri, indexes);
    }

    function transferFrom(address from, address to, uint256 tokenId) override public initialized {
        
        _transfer(from, to, tokenId);
              
    }


    function getVersion() public view returns (string memory){
        return "PablockNFT version 0.2.1";
    }
   
    // function getTokensOfOwner(address owner) public view returns(uint256[]){
    //     return _holderTokens[owner];
    // }

}

    
