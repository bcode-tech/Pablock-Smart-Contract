// SPDX-License-Identifier: MIT
pragma solidity ^0.7.4;

function getChainId() returns (uint256 chain){
        uint256 chainId;
        assembly {
            chainId := chainid()
        }
        return chainId;
}

function getDomainSeparator(string memory name, address contractAddress) returns (bytes32){
    return keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes(name)),
                keccak256(bytes("1")),
                getChainId(),
                contractAddress
            )
        );
}

function generateHash(bytes32 hashStruct, bytes32 domainSeparator  ) returns (bytes32 hash){
    return keccak256(
        abi.encodePacked(
            '\x19\x01',
            domainSeparator,
            hashStruct
        )
    );
}