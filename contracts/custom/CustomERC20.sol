// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../EIP712MetaTransaction.sol";

contract CustomERC20 is ERC20 {
    address contractOwner;
    uint256 MAX_ALLOWANCE = 2 ^ (256 - 1);
    uint256 DECIMALS = 18;

    address private metaTransactionAddress;

    mapping(address => bool) private delegates;

    modifier byOwner(){
        require(contractOwner == msg.sender, "Not allowed");
        _;
    }

    modifier onlyWhitelisted(){
        require(delegates[msg.sender], "Contract not allowed");
        _;
    }
    
    modifier isDelegated(){
        require(delegates[msg.sender], "Address not allowed");
        _;
    }
            
    constructor (string memory _name, string memory _symbol, address  _owner, address _delegate, address _metaTransactionAddress) ERC20(_name, _symbol) {
        contractOwner = _owner;
        delegates[_delegate] = true;
        delegates[msg.sender] = true;
        metaTransactionAddress = _metaTransactionAddress;

        // _mint(address(this), maxSupply);

        EIP712MetaTransaction(_metaTransactionAddress).registerContract(_name, "0.1.0", address(this));
    }

    function initialize (address contractAddr) public isDelegated {
        metaTransactionAddress = contractAddr;
    }

    function mint(address to, uint256 mintQuantity) public isDelegated {
        // require(
        //     maxSupply >= totalSupply() + mintQuantity,
        //     "Would exceed max supply"
        // );

        _mint(to, mintQuantity * 10 ** DECIMALS);
        
        // require(
        //     balanceOf(address(this)) >= mintQuantity,
        //     "Would exceed max supply"
        // );
        // _transfer(address(this), to, mintQuantity);
    } 

    function addDelegate(address _addr) public isDelegated {
        delegates[_addr] = true;
    }

    function removeDelegate(address _addr) public isDelegated {
        delegates[_addr] = false;
    }

    function changeOwner(address _newOwner) public byOwner {
        contractOwner = _newOwner;
    }

    function transferFrom(address from, address to, uint256 amount) public override isDelegated returns (bool){
        if(to == address(0)){
            _burn(from, amount* 10 ** DECIMALS);
        } else{_transfer(from, to, amount* 10 ** DECIMALS);}
        return true;
    }

    function getDelegateStatus(address _addr) public view returns (bool){
        return delegates[_addr];
    }

    function getVersion() public pure returns (string memory){
        return "CustomToken version 0.1.0";
    }
}
 

