// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

import "../PablockMetaTxReceiver.sol";
import "../PablockToken.sol";


contract PablockNFT is ERC721Enumerable, ERC721URIStorage,  PablockMetaTxReceiver {
    
    address private contractOwner;
    address private pablockTokenAddress;
    uint256 private counter;

    mapping(address => uint256) private nonces;
    mapping(uint256 =>  bool) private unlockedTokens;


    event TokenGeneration(address indexed from, string indexed uri, uint[] ) ;

    constructor(string memory _tokenName, string memory _tokenSymbol,address _pablockTokenAddress, address _metaTxAddress) ERC721(_tokenName, _tokenSymbol) PablockMetaTxReceiver(_tokenName, "0.2.1",  _metaTxAddress){
        counter = 0;
        contractOwner = msg.sender;

        pablockTokenAddress = _pablockTokenAddress;
    }

    modifier byOwner(){
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

    function mintToken(address to, uint quantity, string memory _uri) public isInitialized returns(uint[] memory indexes) {

        indexes = new uint[](quantity);

        // uint[quantity] memory indexes;

        for(uint i = 0; i < quantity; i++ ){
            _safeMint(to, counter);
            _setTokenURI(counter, _uri);
            unlockedTokens[counter] = false;
            indexes[i] = counter;
            counter++;
        }
        
        PablockToken(pablockTokenAddress).receiveAndBurn(address(this), msg.sig, to);


        emit TokenGeneration(msg.sender, _uri, indexes);
    }

    function transferFrom(address from, address to, uint256 tokenId) override public isInitialized {

        if(!unlockedTokens[tokenId]){ 
           PablockToken(pablockTokenAddress).receiveAndBurn(address(this), msg.sig, from);
        }

        _transfer(from, to, tokenId);
              
    }

    function unlockToken(uint256 tokenId) public isInitialized{
        require(ownerOf(tokenId) == msgSender());

        unlockedTokens[tokenId] = true;
    }

    function isUnlocked(uint256 tokenId) public view returns(bool){
        return unlockedTokens[tokenId];
    }


    function getVersion() public pure returns (string memory){
        return "PablockNFT version 0.2.1";
    }
   
    // function getTokensOfOwner(address owner) public view returns(uint256[]){
    //     return _holderTokens[owner];
    // }

    //OVERRIDE FUNCTIONS

     function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, amount);
    }

      function _burn(uint256 tokenId) internal virtual override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

      function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, ERC721Enumerable) returns (bool) {
        super.supportsInterface(interfaceId);
    }

     function tokenURI(uint256 tokenId) public view virtual override(ERC721, ERC721URIStorage) returns (string memory) {
        super.tokenURI(tokenId);
}
    


}

    
