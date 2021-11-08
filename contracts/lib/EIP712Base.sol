//SPDX-License-Identifier: MIT
pragma solidity ^0.7.4;

contract EIP712Base {
    struct EIP712Domain {
        string name;
        string version;
        address verifyingContract;
        bytes32 salt;
    }

    struct RegisteredContract {
        string name;
        string version;
        bool registered;
    }

    mapping(address => RegisteredContract ) private registeredContracts;

    bytes32 internal constant EIP712_DOMAIN_TYPEHASH =
        keccak256(
                "EIP712Domain(string name, string version, uint256 chainId, address verifyingContract)"
        );

    bytes32 internal domainSeparator;

    constructor(string memory name, string memory version) public {

        domainSeparator = keccak256(
            abi.encode(
                EIP712_DOMAIN_TYPEHASH,
                keccak256(bytes(name)),
                keccak256(bytes(version)),
                getChainID(),
                address(this)
            )
        );
    }

    function registerContract(string memory name, string memory version, address contractAddress) public {
        registeredContracts[contractAddress].name = name;
        registeredContracts[contractAddress].version = version;
        registeredContracts[contractAddress].registered = true;
    }

    function getChainID() internal pure returns (uint256 id) {
        assembly {
            id := chainid()
        }
    }

    function getDomainSeparator(address contractAddress) private view returns (bytes32) {
        return keccak256(
            abi.encode(
                EIP712_DOMAIN_TYPEHASH,
                keccak256(bytes(registeredContracts[contractAddress].name)),
                keccak256(bytes(registeredContracts[contractAddress].version)),
                getChainID(),
                contractAddress
            )
        );
    }

    /**
     * Accept message hash and returns hash message in EIP712 compatible form
     * So that it can be used to recover signer from signature signed using EIP712 formatted data
     * https://eips.ethereum.org/EIPS/eip-712
     * "\\x19" makes the encoding deterministic
     * "\\x01" is the version byte to make it compatible to EIP-191
     */
    function toTypedMessageHash(bytes32 messageHash, address contractAddress)
        internal
        view
        returns (bytes32)
    {
        return
            keccak256(
                abi.encodePacked("\x19\x01",getDomainSeparator(contractAddress), messageHash)
            );
    }
}
