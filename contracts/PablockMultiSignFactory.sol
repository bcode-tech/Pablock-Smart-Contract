pragma solidity ^0.6.2;

import "./PablockMultiSignNotarization.sol";
import "./PablockToken.sol";

contract PablockMultiSignFactory {
    

event NewPablockMultiSignNotarization(address multiSignAddress);

    
   function createNewMultiSignNotarization(bytes32 hash, address[] signers, string uri, uint256 expirationDate) public returns (PablockMultiSignNotarization){
        
        PablockToken.receiveAndBurn(2);

        PablockMultiSignNotarization _multiSign = new PablockMultiSignNotarization(hash, signers, uri, expirationDate);
        emit NewPablockMultiSignNotarization(address(_multiSign));

        return _multiSign;
   }
    
}