// SPDX-License-Identifier: MIT
pragma solidity ^0.7.4;

import "./PablockMultiSignNotarization.sol";
import "../PablockToken.sol";

contract PablockMultiSignFactory is PablockMetaTxReceiver {

   address private contractOwner;
   address private pablockTokenAddress;
   
   event NewPablockMultiSignNotarization(address multiSignAddress);

   constructor(address _pablockTokenAddress, address _metaTxAddress) public PablockMetaTxReceiver("PablockMultiSignFactory", "0.1.1", _metaTxAddress){
        contractOwner = msg.sender;
        pablockTokenAddress = _pablockTokenAddress;
   }
    
   function createNewMultiSignNotarization(bytes32 hash, address[] memory signers, string memory uri, uint256 expirationDate) public initialized {//returns (PablockMultiSignNotarization){
        
        PablockToken(pablockTokenAddress).receiveAndBurn(address(this), msg.sig, signers[0]);

        PablockMultiSignNotarization _multiSign =
            new PablockMultiSignNotarization(
                hash,
                signers,
                uri,
                expirationDate, 
                pablockTokenAddress,
                metaTxAddress
            );
        emit NewPablockMultiSignNotarization(address(_multiSign));


        // return _multiSign;
    }

    modifier byOwner(){
        require(contractOwner == msg.sender, "Not allowed");
        _;
    }
    

    function initialize (address contractAddr) public byOwner {
        pablockTokenAddress = contractAddr;
    }

    function getVersion() public pure returns (string memory){
        return "Version 0.1.1";
    }
}