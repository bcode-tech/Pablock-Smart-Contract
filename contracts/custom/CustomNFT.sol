//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import "../PablockMetaTxReceiver.sol";

import "hardhat/console.sol";

contract CustomNFT is
  ERC721URIStorage,
  ERC721Enumerable,
  Ownable,
  Pausable,
  PablockMetaTxReceiver
{
  using Counters for Counters.Counter;

  // Counter for the token id
  Counters.Counter public counter;

  event CreateNFT(uint256 tokenId, string uri);
  event TransferNFT(uint256 tokenId, address to);

  constructor()
    ERC721("CustomNFT", "CNFT")
    PablockMetaTxReceiver("CustomNFT", "0.0.1")
  {}

  modifier onlyContractOwner() {
    require(msgSender() == owner(), "Caller not allowed");
    _;
  }

  function initialize(address _metaTxAddress) public onlyContractOwner {
    setMetaTransaction(_metaTxAddress);
  }

  function mintToken(address to, string memory uri) public onlyContractOwner {
    // Mint the new token
    counter.increment();
    _safeMint(to, counter.current());
    _setTokenURI(counter.current(), uri);

    emit CreateNFT(counter.current(), uri);
  }

  function transferFrom(
    address from,
    address to,
    uint256 tokenId
  ) public override onlyContractOwner {
    _transfer(from, to, tokenId);
  }

  /// @notice Before token transfer hook
  /// @param from Address of the current token owner
  /// @param to Destination address
  /// @param tokenId Id of the token that is being transferred
  function _beforeTokenTransfer(
    address from,
    address to,
    uint256 tokenId
  ) internal virtual override(ERC721, ERC721Enumerable) {
    super._beforeTokenTransfer(from, to, tokenId);
  }

  function supportsInterface(bytes4 interfaceId)
    public
    view
    virtual
    override(ERC721, ERC721Enumerable)
    returns (bool)
  {
    return super.supportsInterface(interfaceId);
  }

  function _burn(uint256 tokenId)
    internal
    virtual
    override(ERC721, ERC721URIStorage)
  {
    return super._burn(tokenId);
  }

  function tokenURI(uint256 tokenId)
    public
    view
    virtual
    override(ERC721, ERC721URIStorage)
    returns (string memory)
  {
    return super.tokenURI(tokenId);
  }
}
