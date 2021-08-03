// SPDX-License-Identifier: MIT
pragma solidity ^0.7.4;

import "./PablockMultiSignNotarization.sol";
import "./PablockToken.sol";

contract PablockMultiSignFactory {

   address private pablockTokenAddress;
   
   event NewPablockMultiSignNotarization(address multiSignAddress);

   constructor(address _pablockTokenAddress){
       pablockTokenAddress = _pablockTokenAddress;
   }
    
   function createNewMultiSignNotarization(bytes32 hash, address[] memory signers, string memory uri, uint256 expirationDate) public {//returns (PablockMultiSignNotarization){
        
        PablockToken(pablockTokenAddress).receiveAndBurn(2, msg.sender);

        PablockMultiSignNotarization _multiSign =
            new PablockMultiSignNotarization(
                hash,
                signers,
                uri,
                expirationDate, 
                pablockTokenAddress
            );
        emit NewPablockMultiSignNotarization(address(_multiSign));


        // return _multiSign;
    }

    function getVersion() public pure returns (string memory){
        return "Version 0.1.0";
    }
}