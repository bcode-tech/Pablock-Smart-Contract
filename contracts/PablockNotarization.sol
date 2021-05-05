pragma solidity ^0.6.2;

import "./PablockToken.sol";

contract PablockNotarization {
    
    event Notarize(bytes32 hash, string uri);
    
    function notarize(bytes32 hash, string uri) public payable {

        PablockToken.receiveAndBurn(1);

        emit Notarize(hash, uri);
    }
    
}