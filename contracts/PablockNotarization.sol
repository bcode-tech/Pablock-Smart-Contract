// SPDX-License-Identifier: MIT
pragma solidity ^0.7.4;

import "./PablockToken.sol";

contract PablockNotarization {
    PablockToken pablockToken;

    event Notarize(bytes32 hash, string uri);

    function notarize(bytes32 hash, string memory uri) public payable {
        pablockToken.receiveAndBurn(1);

        emit Notarize(hash, uri);
    }
}
