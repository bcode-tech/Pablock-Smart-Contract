// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./CustomERC20.sol";

contract CustomFactory {
   
   event NewCustomToken(address customTokenAddress);
    
   function createNewCustomToken(string memory _name, string memory _symbol, address _owner, address _delegate, address _pablockTokenAddress) public {//returns (PablockMultiSignNotarization){
        
        CustomERC20 _newCustomToken =
            new CustomERC20(
                _name, _symbol, _owner, _delegate, _pablockTokenAddress
            );

        emit NewCustomToken(address(_newCustomToken));

    }

    function getVersion() public view returns (string memory){
        return "Custom Token Factory version 0.1.0";
    }
}