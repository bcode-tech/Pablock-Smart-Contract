// SPDX-License-Identifier: MIT
<<<<<<< HEAD

=======
>>>>>>> 9235bf0f39914eac96f7f3538708d1459ed2fb06
pragma solidity ^0.7.4;

import "./PablockToken.sol";

contract PablockNotarization {

    PablockToken pablockToken;

    event Notarize(bytes32 hash, string uri);
    
    function notarize(bytes32 hash, string memory uri) public {

        pablockToken.receiveAndBurn(1, msg.sender);

        emit Notarize(hash, uri);

    }
}
