// SPDX-License-Identifier: MIT

pragma solidity ^0.7.4;

import "./PablockMultiSignNotarization.sol";
import "./PablockToken.sol";

contract PablockMultiSignFactory {

   PablockToken pablockToken;
   

   event NewPablockMultiSignNotarization(address multiSignAddress);

    
   function createNewMultiSignNotarization(bytes32 hash, address[] memory signers, string memory uri, uint256 expirationDate) public returns (PablockMultiSignNotarization){
        
        pablockToken.receiveAndBurn(2, msg.sender);

        PablockMultiSignNotarization _multiSign = new PablockMultiSignNotarization(hash, signers, uri, expirationDate);
        emit NewPablockMultiSignNotarization(address(_multiSign));

        return _multiSign;
   }
    
}