// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./lib/EIP712Base.sol";

contract PablockToken is ERC20 {
  /**
   * NOTESET -> not correctly configured
   * CONSUME -> users need to have PTK in order to execute ops
   * SUBSCRIPTION -> users with subscription contract, have a flat monthly fee to execute as many request
   * INTERNAL -> used by Pablock cotracts
   */
  enum SubscriptionType { NOTSET, CONSUME, SUBSCRIPTION, INTERNAL }

  struct WhiteListedContract {
    uint256 defaultPrice;
    bool isSet;
    SubscriptionType subscriptionType;
    mapping(bytes4 => uint256) functionPrices;
    mapping(address => bool) allowedAddresses;
    bool profilationEnabled;
    address contractOwner;
  }

  uint256 constant MAX_ALLOWANCE = 2 ^ (256 - 1);
  uint256 constant DECIMALS = 18;

  address private contractOwner;

  //Supply data
  uint256 public maxSupply;
  bool public lockSupply = false;

  mapping(address => WhiteListedContract) private contractWhitelist;
  mapping(address => uint256) private nonces;

  modifier byOwner() {
    require(contractOwner == msg.sender, "Not allowed");
    _;
  }

  modifier onlyWhitelisted(address contractAddr) {
    require(contractWhitelist[contractAddr].isSet, "Contract not allowed");
    _;
  }

  modifier checkProfilation(address _contract) {
    require(
      contractWhitelist[_contract].subscriptionType !=
        SubscriptionType.SUBSCRIPTION ||
        (contractWhitelist[_contract].subscriptionType ==
          SubscriptionType.SUBSCRIPTION &&
          !contractWhitelist[_contract].profilationEnabled) ||
        (contractWhitelist[_contract].subscriptionType ==
          SubscriptionType.SUBSCRIPTION &&
          contractWhitelist[_contract].allowedAddresses[msg.sender]),
      "User not allowed to execute function"
    );
    _;
  }

  constructor(uint256 _maxSupply, address _metaTxAddr)
    ERC20("PablockToken", "PTK")
  {
    contractOwner = msg.sender;
    maxSupply = _maxSupply;
  }

  function initialize(address _owner) public byOwner {
    contractOwner = _owner;
  }

  function requestToken(address to, uint256 mintQuantity) public byOwner {
    if (lockSupply) {
      require(
        (maxSupply >= totalSupply() + mintQuantity),
        "Would exceed max supply"
      );
    }

    _mint(to, mintQuantity * 10**DECIMALS);
  }

  function addContractToWhitelist(
    address _contract,
    uint256 _price,
    uint256 _type
  ) public byOwner {
    contractWhitelist[_contract].isSet = true;
    contractWhitelist[_contract].defaultPrice = _price;
    contractWhitelist[_contract].subscriptionType = SubscriptionType(_type);
    contractWhitelist[_contract].contractOwner = msg.sender;
  }

  function removeContractFromWhitelist(address _contract) public byOwner {
    contractWhitelist[_contract].isSet = false;
  }

  function addFunctionPrice(
    address _contract,
    bytes4 _functionSig,
    uint256 price
  ) public byOwner {
    contractWhitelist[_contract].functionPrices[_functionSig] = price;
  }

  function getFunctionPrice(address _contract, bytes4 _functionSig)
    public
    view
    returns (uint256 price)
  {
    return contractWhitelist[_contract].functionPrices[_functionSig];
  }

  function setSubUserAddr(
    address contractAddr,
    address userAddress,
    bool status
  ) public byOwner {
    contractWhitelist[contractAddr].allowedAddresses[userAddress] = status;
  }

  function changeProfilationStatus(address contractAddr, bool status) public {
    require(
      contractWhitelist[contractAddr].contractOwner == msg.sender,
      "Address not authorized"
    );
    contractWhitelist[contractAddr].profilationEnabled = status;
  }

  function changeOwner(address _newOwner) public byOwner {
    contractOwner = _newOwner;
  }

  function changeSupplyData(uint256 _maxSupply, bool _lockSupply)
    public
    byOwner
  {
    maxSupply = _maxSupply;
    lockSupply = _lockSupply;
  }

  function receiveAndBurn(
    address _contract,
    bytes4 _functionSig,
    address addr
  )
    public
    onlyWhitelisted(_contract)
    checkProfilation(_contract)
    returns (bool)
  {
    if (
      (msg.sender != contractOwner &&
        contractWhitelist[_contract].subscriptionType ==
        SubscriptionType.CONSUME) ||
      (msg.sender == _contract &&
        contractWhitelist[_contract].subscriptionType ==
        SubscriptionType.INTERNAL)
    ) {
      _burn(addr, getPrice(_contract, _functionSig) * 10**DECIMALS);
    }
    return true;
  }

  function getPrice(address _contract, bytes4 _functionSig)
    internal
    view
    returns (uint256)
  {
    if (contractWhitelist[_contract].functionPrices[_functionSig] == 0) {
      return contractWhitelist[_contract].defaultPrice;
    } else {
      return contractWhitelist[_contract].functionPrices[_functionSig];
    }
  }

  function getContractStatus(address _contract) public view returns (bool) {
    return contractWhitelist[_contract].isSet;
  }

  function getNonces(address addr) external view returns (uint256) {
    return nonces[addr];
  }

  function getVersion() public pure returns (string memory) {
    return "PablockToken version 0.2.3";
  }
}
