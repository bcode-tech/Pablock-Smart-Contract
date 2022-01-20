// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./interfaces/IEIP712MetaTransaction.sol";

contract PablockMetaTxReceiver {
  string public metaTxName;
  string public version;

  address internal metaTxAddress;

  constructor(string memory _name, string memory _version) {
    metaTxName = _name;
    version = _version;
  }

  function setMetaTransaction(address metaContract) internal {
    metaTxAddress = metaContract;
    IEIP712MetaTransaction(metaContract).registerContract(
      metaTxName,
      version,
      address(this)
    );
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
