// SPDX-License-Identifier: MIT
pragma solidity ^0.7.4;

import "./EIP712MetaTransaction.sol";


contract PablockMetaTxReceiver {

    string metaTxName;
    string version;

    address internal metaTxAddress;

    constructor(string memory _name, string memory _version, address metaContract){
        metaTxName = _name;
        version = _version;
        metaTxAddress = metaContract;
        EIP712MetaTransaction(metaContract).registerContract(metaTxName, version, address(this));
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

    modifier initialized {
        require(metaTxAddress != address(0), "Contract not initialized");
        _;
    }

}