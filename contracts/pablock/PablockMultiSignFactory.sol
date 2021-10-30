// SPDX-License-Identifier: MIT
pragma solidity ^0.7.4;

import "./PablockMultiSignNotarization.sol";
import "./PablockToken.sol";

contract PablockMultiSignFactory {

   address private contractOwner;
   address private metaTxAddress;
   
   event NewPablockMultiSignNotarization(address multiSignAddress);

   constructor(address _metaTxAddress){
        contractOwner = msg.sender;
        metaTxAddress = _metaTxAddress;

        EIP712MetaTransaction(_metaTxAddress).registerContract("PablockMultiSignFactory", "0.1.1", address(this));
   }
    
   function createNewMultiSignNotarization(bytes32 hash, address[] memory signers, string memory uri, uint256 expirationDate) public initialized {//returns (PablockMultiSignNotarization){
        

        PablockMultiSignNotarization _multiSign =
            new PablockMultiSignNotarization(
                hash,
                signers,
                uri,
                expirationDate, 
                metaTxAddress
            );
        emit NewPablockMultiSignNotarization(address(_multiSign));


        // return _multiSign;
    }

    modifier byOwner(){
        require(contractOwner == msg.sender, "Not allowed");
        _;
    }
    
    modifier initialized {
        require(metaTxAddress != address(0), "Contract not initialized");
        _;
    }

    function initialize (address contractAddr) public byOwner {
        metaTxAddress = contractAddr;
    }

    function getVersion() public pure returns (string memory){
        return "Version 0.1.1";
    }
}