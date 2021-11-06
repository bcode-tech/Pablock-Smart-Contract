// SPDX-License-Identifier: MIT
pragma solidity ^0.7.4;

import "../EIP712MetaTransaction.sol";
import "../PablockToken.sol";

contract TestMetaTransaction {
    uint256 public counter = 0;
    string public name;
    string public version;

    address private pablockTokenAddress;
    address private metaTransactionAddress;

    event Notarize(bytes32 hash, string uri, address applicant);

    constructor(string memory _name, string memory _version, address _pablockTokenAddress, address metaContract){
        name = _name;
        version = _version;
        pablockTokenAddress = _pablockTokenAddress;
        metaTransactionAddress = metaContract;
        EIP712MetaTransaction(metaContract).registerContract(name, version, address(this));
    }

    modifier initialized {
        require(metaTransactionAddress != address(0), "Contract not initialized");
        _;
    }

    function increment() public {
        counter = counter + 1;
    }

    function decrement() public {
        counter = counter - 1;
    }

    function setCounter(uint256 _counter, address account) public {
        PablockToken(pablockTokenAddress).receiveAndBurn(address(this),msg.sig, account );
        counter = _counter;
    }

    function getCounter() public view returns (uint256) {
        return counter;
    }

     function notarize(bytes32 hash, string memory uri, address applicant) public initialized {
        PablockToken(pablockTokenAddress).receiveAndBurn(address(this), msg.sig, applicant);
        emit Notarize(hash, uri, applicant);
    }
}
