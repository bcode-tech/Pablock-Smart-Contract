// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface IPablockToken {
  function initialize(address _owner) external;

  function setPayer(address _payer) external;

  function requestToken(address to, uint256 mintQuantity) external;

  /**
   * This function allow auth address to add trusted contract to enabled transaction relay
   */
  function addContractToWhitelist(
    address _contract,
    uint256 _price,
    uint256 _type
  ) external;

  /**
   * This function allows auth address to remove contract to transaction relay
   */
  function removeContractFromWhitelist(address _contract) external;

  /**
   * This function allows to specify a PTK price for a determined function call
   */
  function addFunctionPrice(
    address _contract,
    bytes4 _functionSig,
    uint256 price
  ) external;

  /**
   * Getter for function price, given contract and function signature it return PTK price for function execution
   */
  function getFunctionPrice(address _contract, bytes4 _functionSig)
    external
    view
    returns (uint256 price);

  /**
   * Allows auth users to add a subscription second user
   */
  function setSubUserAddr(
    address contractAddr,
    address userAddress,
    bool status
  ) external;

  function changeProfilationStatus(address contractAddr, bool status) external;

  function changeSupplyData(uint256 _maxSupply, bool _lockSupply) external;

  function receiveAndBurn(
    address _contract,
    bytes4 _functionSig,
    address addr
  ) external;

  function getPrice(address _contract, bytes4 _functionSig)
    external
    view
    returns (uint256);

  function setPauseStatus(bool status) external;

  function getContractStatus(address _contract) external view returns (bool);

  function getNonces(address addr) external view returns (uint256);

  function getVersion() external pure returns (string memory);
}
