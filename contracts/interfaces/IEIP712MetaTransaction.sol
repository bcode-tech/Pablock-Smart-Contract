//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface IEIP712MetaTransaction {
  function initialize(address _pablockTokenAddress) external;

  function setPayer(address _payer) external;

  /**
   *   This function allow the execution of another cotnract function through relay method.
   *   The contract function needs to be register and gives this contract name and version to enable
   *   correct DOMAIN_SEPARATOR calcualtion. If a contract register to meta transaction but not validated on PablockToken
   *   the execution will failed.
   */
  function executeMetaTransaction(
    address destinationContract,
    address userAddress,
    bytes memory functionSignature,
    bytes32 sigR,
    bytes32 sigS,
    uint8 sigV
  ) external payable returns (bytes memory);

  function setPauseStatus(bool status) external;

  function registerContract(
    string memory name,
    string memory version,
    address contractAddress
  ) external;
}
