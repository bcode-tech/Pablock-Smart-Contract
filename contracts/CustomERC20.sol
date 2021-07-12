// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

// import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/draft-ERC20PermitUpgradeable.sol";

import {ERC20, ERC20Permit} from "erc20permit/contracts/ERC20Permit.sol";

contract CustomERC20 is ERC20Permit {
    address contractOwner;
    uint256 maxSupply;
    uint256 MAX_ALLOWANCE = 2 ^ (256 - 1);

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
            
    constructor (uint256 _maxSupply, string memory _name, string memory _symbol, address  _owner, address _delegate) ERC20Permit(_name, _symbol) {
        contractOwner = msg.sender;
        delegates[_delegate] = true;
        delegates[msg.sender] = true;
        maxSupply = _maxSupply;
    }

    function mint(address to, uint256 mintQuantity) public isDelegated {
        require(
            maxSupply >= totalSupply() + mintQuantity,
            "Would exceed max supply"
        );
        _mint(to, mintQuantity);
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

    function changeMaxSupply(uint256 _maxSupply) public byOwner {
        maxSupply = _maxSupply;
    }

    function transferToken( address from, address to,uint256 amount) public isDelegated returns (bool) {
        _transfer(from, to, amount);
        return true;
    }

    function getDelegateStatus(address _addr) public view returns (bool){
        return delegates[_addr];
    }

    function getVersion() public view returns (string memory){
        return "CustomToken version 0.1.0";
    }
    
    function getChainId() public view returns (uint256 chain){
        uint256 chainId;
        assembly {
            chainId := chainid()
        }
        return chainId;
    }
}
