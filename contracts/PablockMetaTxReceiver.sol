// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./interfaces/IEIP712MetaTransaction.sol";

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract PablockMetaTxReceiver is AccessControl, Pausable {
  bytes32 public constant PAYER_ROLE = keccak256("PAYER");

  string public metaTxName;
  string public version;

  address internal metaTxAddress;

  constructor(string memory _name, string memory _version) {
    metaTxName = _name;
    version = _version;

    _setupRole(DEFAULT_ADMIN_ROLE, msgSender());
  }

  modifier byOwner() {
    require(hasRole(DEFAULT_ADMIN_ROLE, msgSender()), "Not allowed as owner");
    _;
  }

  modifier byPayer() {
    require(hasRole(PAYER_ROLE, msg.sender), "Not allowed as payer");
    _;
  }

  modifier hasAuth() virtual {
    require(
      (hasRole(DEFAULT_ADMIN_ROLE, msg.sender) ||
        hasRole(PAYER_ROLE, msg.sender)) && !paused(),
      "Not allowed"
    );
    _;
  }

  function setMetaTransaction(address metaContract) internal {
    _setupRole(DEFAULT_ADMIN_ROLE, msgSender());

    metaTxAddress = metaContract;
    IEIP712MetaTransaction(metaContract).registerContract(
      metaTxName,
      version,
      address(this)
    );
  }

  function setPayer(address _payer) public byOwner {
    _setupRole(PAYER_ROLE, _payer);
  }

  function msgSender() internal view returns (address sender) {
    if (msg.sender == metaTxAddress) {
      bytes memory array = msg.data;
      uint256 index = msg.data.length;
      assembly {
        // Load the 32 bytes word from memory with the address on the lower 20 bytes, and mask those.
        sender := and(
          mload(add(array, index)),
          0xffffffffffffffffffffffffffffffffffffffff
        )
      }
    } else {
      sender = msg.sender;
    }
    return sender;
  }

  modifier initialized() {
    require(metaTxAddress != address(0), "Contract not initialized");
    _;
  }
}
