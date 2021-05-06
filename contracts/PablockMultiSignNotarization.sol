// SPDX-License-Identifier: MIT
pragma solidity ^0.7.4;

import "./PablockToken.sol";

contract PablockMultiSignNotarization {
    PablockToken pablockToken;

    mapping(address => bool) private signers;

    bytes32 hash;
    string uri;
    uint256 expirationDate;

    constructor(
        bytes32 _hash,
        address[] memory _signers,
        string memory _uri,
        uint256 _expirationDate
    ) {
        hash = _hash;
        uri = _uri;
        expirationDate = _expirationDate;

        for (uint256 i = 0; i < _signers.length; i++) {
            signers[_signers[i]] = false;
        }
    }

    function signDocument() public {
        // require(signers[msg.sender].exists, "Signers does not exists");

        pablockToken.receiveAndBurn(1);

        signers[msg.sender] = true;
    }

    function getNotarizationData()
        public
        returns (
            bytes32,
            // address[] memory,
            string memory,
            uint256
        )
    {
        return (hash, uri, expirationDate);
    }
}
