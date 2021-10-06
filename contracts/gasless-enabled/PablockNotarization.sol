// SPDX-License-Identifier: MIT
pragma solidity ^0.7.4;

import "./PablockToken.sol";

contract PablockNotarization {

    address private pablockTokenAddress;
    address private contractOwner;

    bytes32 public immutable NOTARIZE_TYPEHASH = keccak256("Notarize(bytes32 hash, string memory uri, address applicant)");


    bytes32 immutable DOMAIN_SEPARATOR;

    event Notarize(bytes32 hash, string uri, address applicant);

    constructor(address _pablockToken) {
        contractOwner = msg.sender;
        pablockTokenAddress = _pablockToken;

        DOMAIN_SEPARATOR = utils.getDomainSeparator("notarization", address(this));
    }

    modifier byOwner {
        require(contractOwner == msg.sender, "Not allowed");
        _;
    }

    modifier initialized {
        require(pablockTokenAddress != address(0), "Contract not initialized");
        _;
    }

    function initialize (address contractAddr) public byOwner {
        pablockTokenAddress = contractAddr;
    }
    
    function notarize(bytes32 hash, string memory uri, address applicant, uint8 v, bytes32 r, bytes32 s) public initialized {

        bytes32 hashStruct = keccak256(
            abi.encode(
                NOTARIZE_TYPEHASH,
                hash,
                uri,
                applicant              
            )
        );

        bytes32 hash = utils.generateHash(hashStruct, DOMAIN_SEPARATOR);

        address signer = ecrecover(hash, v, r, s);

        require(
            signer != address(0) && signer == applicant,
            "Notarization signature check: invalid signature"
        );


        PablockToken(pablockTokenAddress).receiveAndBurn(1, signer);

        emit Notarize(hash, uri, signer);
    }

}
