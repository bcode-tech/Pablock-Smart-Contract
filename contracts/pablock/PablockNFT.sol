// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import "../PablockMetaTxReceiverExt.sol";
import "../interfaces/IPablockToken.sol";

contract PablockNFT is
  ERC721Enumerable,
  ERC721URIStorage,
  Ownable,
  Pausable,
  PablockMetaTxReceiver
{
  using Counters for Counters.Counter;

  address private pablockTokenAddress;
  Counters.Counter private counter;

  mapping(address => uint256) private nonces;
  mapping(uint256 => bool) private unlockedTokens;

  event TokenGeneration(
    address indexed from,
    string indexed uri,
    uint256 counter
  );
  event MultipleTokenGeneration(
    address indexed from,
    string indexed uri,
    uint256[]
  );

  constructor(
    string memory _tokenName,
    string memory _tokenSymbol,
    address _pablockTokenAddress,
    address _metaTxAddress
  )
    ERC721(_tokenName, _tokenSymbol)
    PablockMetaTxReceiver(_tokenName, "0.2.2")
  {
    pablockTokenAddress = _pablockTokenAddress;

    setMetaTransaction(_metaTxAddress);
  }

  modifier isInitialized() {
    require(pablockTokenAddress != address(0), "Contract not initialized");
    _;
  }

  function initialize(address contractAddr) public byOwner {
    pablockTokenAddress = contractAddr;
  }

  function _mintToken(address to, string memory _uri) internal {
    counter.increment();
    _safeMint(to, counter.current());
    _setTokenURI(counter.current(), _uri);
    unlockedTokens[counter.current()] = false;
  }

  function mintMultipleToken(
    address to,
    uint256 quantity,
    string memory _uri
  ) public isInitialized returns (uint256[] memory indexes) {
    indexes = new uint256[](quantity);

    for (uint256 i = 0; i < quantity; i++) {
      _mintToken(to, _uri);
      indexes[i] = counter.current();
      IPablockToken(pablockTokenAddress).receiveAndBurn(
        address(this),
        msg.sig,
        to
      );
    }

    emit MultipleTokenGeneration(msg.sender, _uri, indexes);
  }

  function mintToken(address to, string memory _uri)
    public
    isInitialized
    returns (uint256 index)
  {
    _mintToken(to, _uri);

    IPablockToken(pablockTokenAddress).receiveAndBurn(
      address(this),
      msg.sig,
      to
    );

    emit TokenGeneration(msg.sender, _uri, counter.current());
  }

  function transferFrom(
    address from,
    address to,
    uint256 tokenId
  ) public override isInitialized {
    if (!unlockedTokens[tokenId]) {
      IPablockToken(pablockTokenAddress).receiveAndBurn(
        address(this),
        msg.sig,
        msgSender()
      );
    }

    _transfer(from, to, tokenId);
  }

  function unlockToken(uint256 tokenId) public isInitialized {
    require(ownerOf(tokenId) == msgSender());

    IPablockToken(pablockTokenAddress).receiveAndBurn(
      address(this),
      msg.sig,
      msgSender()
    );

    unlockedTokens[tokenId] = true;
  }

  function isUnlocked(uint256 tokenId) public view returns (bool) {
    return unlockedTokens[tokenId];
  }

  function getVersion() public pure returns (string memory) {
    return "PablockNFT version 0.2.2";
  }

  // function getTokensOfOwner(address owner) public view returns(uint256[]){
  //     return _holderTokens[owner];
  // }

  //OVERRIDE FUNCTIONS

  function _beforeTokenTransfer(
    address from,
    address to,
    uint256 amount
  ) internal virtual override(ERC721, ERC721Enumerable) {
    super._beforeTokenTransfer(from, to, amount);
  }

  function _burn(uint256 tokenId)
    internal
    virtual
    override(ERC721, ERC721URIStorage)
  {
    super._burn(tokenId);
  }

  function supportsInterface(bytes4 interfaceId)
    public
    view
    virtual
    override(ERC721, ERC721Enumerable, AccessControl)
    returns (bool)
  {
    super.supportsInterface(interfaceId);
  }

  function tokenURI(uint256 tokenId)
    public
    view
    virtual
    override(ERC721, ERC721URIStorage)
    returns (string memory)
  {
    super.tokenURI(tokenId);
  }
}
