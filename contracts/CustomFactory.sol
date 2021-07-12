// SPDX-License-Identifier: MIT
pragma solidity ^0.7.4;

import "./CustomERC20.sol";

contract CustomFactory {
   
   event NewCustomToken(address customTokenAddress);
    
   function createNewCustomToken(uint256 _maxSupply, string memory _name, string memory _symbol, address _owner, address _delegate) public {//returns (PablockMultiSignNotarization){
        
        CustomERC20 _newCustomToken =
            new CustomERC20(
                _maxSupply, _name, _symbol, _owner, _delegate
            );

        emit NewCustomToken(address(_newCustomToken));

    }

    function getVersion() public view returns (string memory){
        return "Custom Token Factory version 0.1.0";
    }
}