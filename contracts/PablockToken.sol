// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./lib/EIP712Base.sol";

contract PablockToken is ERC20, AccessControl, Pausable {
  bytes32 public constant PAYER_ROLE = keccak256("PAYER");

  /**
   * NOTESET -> not correctly configured
   * CONSUME -> users need to have PTK in order to execute ops
   * SUBSCRIPTION -> users with subscription contract, have a flat monthly fee to execute as many request
   * INTERNAL -> used by Pablock contracts
   */
  enum SubscriptionType {
    NOTSET,
    CONSUME,
    SUBSCRIPTION,
    INTERNAL
  }

  struct WhiteListedContract {
    uint256 defaultPrice;
    bool isSet;
    SubscriptionType subscriptionType;
    mapping(bytes4 => uint256) functionPrices;
    address contractOwner;
  }

  uint256 constant MAX_ALLOWANCE = 2 ^ (256 - 1);
  uint256 constant DECIMALS = 18;

  //Supply data
  uint256 public maxSupply;
  bool public lockSupply = false;

  mapping(address => WhiteListedContract) private contractWhitelist;
  mapping(address => uint256) private nonces;

  event ContractWhitelisted(address coontractAddress, address contractOwner);

  modifier byOwner() {
    require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Not allowed as owner");
    _;
  }

  modifier byPayer() {
    require(hasRole(PAYER_ROLE, msg.sender), "Not allowed as payer");
    _;
  }

  modifier hasAuth() {
    require(
      (hasRole(DEFAULT_ADMIN_ROLE, msg.sender) ||
        hasRole(PAYER_ROLE, msg.sender)) && !paused(),
      "Not allowed"
    );
    _;
  }

  modifier onlyWhitelisted(address contractAddr) {
    require(
      contractWhitelist[contractAddr].isSet && !paused(),
      "Contract not allowed"
    );
    _;
  }

  constructor(uint256 _maxSupply) ERC20("PablockToken", "PTK") {
    _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    maxSupply = _maxSupply;
  }

  function initialize(address _owner) public byOwner {
    _setupRole(DEFAULT_ADMIN_ROLE, _owner);
  }

  function setPayer(address _payer) public byOwner {
    _setupRole(PAYER_ROLE, _payer);
  }

  function requestToken(address to, uint256 mintQuantity) public hasAuth {
    if (lockSupply) {
      require(
        (maxSupply >= totalSupply() + mintQuantity),
        "Would exceed max supply"
      );
    }

    _mint(to, mintQuantity * 10**DECIMALS);
  }

  /// @notice This function allow auth address to add trusted contract to enabled transaction relay
  /// @param _contract Contract's address to whitelist
  /// @param _price Default price per contract function
  /// @param _type Type of subscription
  /// @param _contractOwner Owner of contract or payer in case of SUBSCRIPTION type contract (Address with PTK)
  function addContractToWhitelist(
    address _contract,
    uint256 _price,
    uint256 _type,
    address _contractOwner
  ) public hasAuth {
    contractWhitelist[_contract].isSet = true;
    contractWhitelist[_contract].defaultPrice = _price;
    contractWhitelist[_contract].subscriptionType = SubscriptionType(_type);
    contractWhitelist[_contract].contractOwner = _contractOwner;

    emit ContractWhitelisted(_contract, _contractOwner);
  }

  /**
   * This function allows auth address to remove contract to transaction relay
   */
  function removeContractFromWhitelist(address _contract) public hasAuth {
    contractWhitelist[_contract].isSet = false;
  }

  /**
   * This function allows to specify a PTK price for a determined function call
   */
  function addFunctionPrice(
    address _contract,
    bytes4 _functionSig,
    uint256 price
  ) public hasAuth {
    contractWhitelist[_contract].functionPrices[_functionSig] = price;
  }

  /**
   * Getter for function price, given contract and function signature it return PTK price for function execution
   */
  function getFunctionPrice(address _contract, bytes4 _functionSig)
    public
    view
    returns (uint256 price)
  {
    return contractWhitelist[_contract].functionPrices[_functionSig];
  }

  function changeSupplyData(uint256 _maxSupply, bool _lockSupply)
    public
    hasAuth
  {
    maxSupply = _maxSupply;
    lockSupply = _lockSupply;
  }

  /// @notice Function to burn PTK when function is called
  /// @param _contract Address of whitelisted contract
  /// @param _functionSig Signature of called function
  /// @param _addr Address of function caller
  function receiveAndBurn(
    address _contract,
    bytes4 _functionSig,
    address _addr
  ) public onlyWhitelisted(_contract) returns (bool) {
    /**
     * If sender contract is CONSUME || sender is contract and contract is INTERNAL
     * burn on received address
     * else if contract is SUBSCRIPTION and sender is allowed burn from contract address
     * If
     */
    if (
      (contractWhitelist[_contract].subscriptionType ==
        SubscriptionType.CONSUME) ||
      (msg.sender == _contract &&
        contractWhitelist[_contract].subscriptionType ==
        SubscriptionType.INTERNAL)
    ) {
      _burn(_addr, getPrice(_contract, _functionSig) * 10**DECIMALS);
    } else if (
      contractWhitelist[_contract].subscriptionType ==
      SubscriptionType.SUBSCRIPTION
    ) {
      _burn(
        contractWhitelist[_contract].contractOwner,
        getPrice(_contract, _functionSig) * 10**DECIMALS
      );
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

  function setPauseStatus(bool status) public byOwner {
    if (status) {
      _pause();
    } else {
      _unpause();
    }
  }

  function getContractStatus(address _contract) public view returns (bool) {
    return contractWhitelist[_contract].isSet;
  }

  function getNonces(address addr) external view returns (uint256) {
    return nonces[addr];
  }

  function getVersion() public pure returns (string memory) {
    return "PablockToken version 0.2.5";
  }
}
