// SPDX-License-Identifier: MIT
pragma solidity ^0.7.4;

import "./PablockToken.sol";

contract PablockGasless {

    address public pablockTokenAddress;
    address public pablockAddress;

    bytes32 public immutable DOMAIN_SEPARATOR;

    constructor(address _pablockToken, address _pablockAddress){
        pablockTokenAddress= _pablockToken;
        pablockAddress = _pablockAddress;

        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes(name_)),
                keccak256(bytes(version())),
                chainId,
                address(this)
            )
        );

    }

}