// SPDX-License-Identifier: MIT
pragma solidity ^0.7.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/draft-ERC20PermitUpgradeable.sol";

import "./PablockToken.sol";

// import {ERC20, ERC20Permit} from "erc20permit/contracts/ERC20Permit.sol";

contract CustomERC20 is ERC20 {
    address contractOwner;
    uint256 MAX_ALLOWANCE = 2 ^ (256 - 1);
    address private pablockTokenAddress;


    mapping(address => uint256) private nonces;

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
            
    constructor (string memory _name, string memory _symbol, address  _owner, address _delegate, address _pablockTokenAddress) ERC20(_name, _symbol) {
        contractOwner = _owner;
        delegates[_delegate] = true;
        delegates[msg.sender] = true;
        pablockTokenAddress = _pablockTokenAddress;
        

        // _mint(address(this), maxSupply);
    }

    function initialize (address contractAddr) public isDelegated {
        pablockTokenAddress = contractAddr;
    }

    function mint(address to, uint256 mintQuantity) public isDelegated {
        // require(
        //     maxSupply >= totalSupply() + mintQuantity,
        //     "Would exceed max supply"
        // );

        PablockToken(pablockTokenAddress).receiveAndBurn(1, contractOwner);
        _mint(to, mintQuantity);


        // require(
        //     balanceOf(address(this)) >= mintQuantity,
        //     "Would exceed max supply"
        // );
        // _transfer(address(this), to, mintQuantity);
    } 

    function spendToken(address from, uint256 amount) public isDelegated {
        
        PablockToken(pablockTokenAddress).receiveAndBurn(1, contractOwner);
        _transfer(from, address(this), amount);

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

    function transferToken( address from, address to,uint256 amount) public isDelegated returns (bool) {
        PablockToken(pablockTokenAddress).receiveAndBurn(1, contractOwner);
        _transfer(from, to, amount);
        return true;
    }

    function getDelegateStatus(address _addr) public view returns (bool){
        return delegates[_addr];
    }

    function getVersion() public pure returns (string memory){
        return "CustomToken version 0.1.0";
    }
    
    function getChainId() public view returns (uint256 chain){
        uint256 chainId;
        assembly {
            chainId := chainid()
        }
        return chainId;
    }

    function requestPermit(address owner, address spender, uint256 amount, bytes32 hash, uint8 v, bytes32 r, bytes32 s) public {  
        
        require( verifySignature(owner, hash, v, r, s), "ERC20: Invalid signature");
        PablockToken(pablockTokenAddress).receiveAndBurn(1, contractOwner);
        nonces[owner]++;
        
        if(msg.sender != spender){
            _approve(owner, msg.sender, amount);       
        }
        _approve(owner, spender, amount);
    }


    function verifySignature(address owner, bytes32 hash, uint8 v, bytes32 r, bytes32 s) public pure returns (bool result){
        
        return ecrecover(hash, v, r, s) == owner;

    }

    function getNonces(address addr) external view returns(uint256){
        return nonces[addr];
    }
}
