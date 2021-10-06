// SPDX-License-Identifier: MIT
pragma solidity ^0.7.4;

import "./PablockMultiSignNotarization.sol";
import "./PablockToken.sol";

contract PablockMultiSignFactory {

   address private contractOwner;
   address private pablockTokenAddress;
   
   event NewPablockMultiSignNotarization(address multiSignAddress);

   constructor(address _pablockTokenAddress){
       contractOwner = msg.sender;
       pablockTokenAddress = _pablockTokenAddress;
   }
    
   function createNewMultiSignNotarization(bytes32 hash, address[] memory signers, string memory uri, uint256 expirationDate) public initialized {//returns (PablockMultiSignNotarization){
        
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

    modifier byOwner(){
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

    function getVersion() public pure returns (string memory){
        return "Version 0.1.1";
    }
}