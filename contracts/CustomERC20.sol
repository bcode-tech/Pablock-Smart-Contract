// SPDX-License-Identifier: MIT
pragma solidity ^0.7.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/draft-ERC20PermitUpgradeable.sol";

import "./PablockToken.sol";

// import {ERC20, ERC20Permit} from "erc20permit/contracts/ERC20Permit.sol";

contract CustomERC20 is ERC20 {
    address contractOwner;
    uint256 MAX_ALLOWANCE = 2 ^ (256 - 1);

    bytes32 public immutable PERMIT_TYPEHASH = keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)");
    bytes32 public immutable TRANSFER_TYPEHASH = keccak256("Transfer(address from,address to,uint256 amount)");

    bytes32 public immutable DOMAIN_SEPARATOR;

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

        uint256 chainId = getChainId();
        
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes(_name)),
                keccak256(bytes("1")),
                chainId,
                address(this)
            )
        );

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

    function addDelegate(address _addr) public isDelegated {
        delegates[_addr] = true;
    }

    function removeDelegate(address _addr) public isDelegated {
        delegates[_addr] = false;
    }

    function changeOwner(address _newOwner) public byOwner {
        contractOwner = _newOwner;
    }

    function transferToken( address from, address to, address spender, uint256 amount, uint8 v, bytes32 r, bytes32 s ) public isDelegated  {
        
        bytes32 hashStruct = keccak256(
            abi.encode(
                TRANSFER_TYPEHASH,
                from,
                to,
                amount,
                nonces[spender]++
            )
        );

        bytes32 hash = generateHash(hashStruct);

        address signer = ecrecover(hash, v, r, s);

        require(allowance(from, signer) >= amount , "ERC20: Spender not allowed");
        PablockToken(pablockTokenAddress).receiveAndBurn(1, contractOwner);

        if(to == address(0)) {
            _burn(from, amount);
        } else {
            _transfer(from, to, amount);
        }

       
    }

    function transferFrom(address from, address to, uint256 amount) public override isDelegated returns (bool){
        PablockToken(pablockTokenAddress).receiveAndBurn(1, contractOwner);
        if(to == address(0)){
            _burn(from, amount);
        } else{_transfer(from, to, amount);}
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

    function requestPermit(address owner, address spender, uint256 amount, uint256 deadline, uint8 v, bytes32 r, bytes32 s) public {  
        
        bytes32 hashStruct = keccak256(
            abi.encode(
                PERMIT_TYPEHASH,
                owner,
                spender,
                amount,
                nonces[owner]++,
                deadline
            )
        );

        bytes32 hash = generateHash(hashStruct);

        address signer = ecrecover(hash, v, r, s);

      

        require(
            signer != address(0) && signer == owner,
            "ERC20Permit: invalid signature"
        );

        // require(verifySignature( hash, v, r, s) == owner, "ERC20: Invalid signature");
        PablockToken(pablockTokenAddress).receiveAndBurn(1, contractOwner);
        nonces[owner]++;

        
        if(msg.sender != spender){
            _approve(owner, msg.sender, amount);       
        }
        _approve(owner, spender, amount);

    }


    function verifySignature( bytes32 hash, uint8 v, bytes32 r, bytes32 s) public pure returns (address signer){
        
        return ecrecover(hash, v, r, s);

    }

    function getNonces(address addr) external view returns(uint256){
        return nonces[addr];
    }

    function generateHash(bytes32 hashStruct) private returns (bytes32 hash){
        return keccak256(
            abi.encodePacked(
                '\x19\x01',
                DOMAIN_SEPARATOR,
                hashStruct
            )
        );
    }
}
