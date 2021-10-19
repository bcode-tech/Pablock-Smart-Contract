// SPDX-License-Identifier: MIT
pragma solidity ^0.7.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import PablockUtils from "./Pablocksol";

using PablockUtils for *;

contract PablockToken is ERC20 {
    address contractOwner;
    uint256 maxSupply;
    uint256 MAX_ALLOWANCE = 2 ^ (256 - 1);
    uint256 DECIMALS = 18;

    bytes32 public immutable PERMIT_TYPEHASH = keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)");

    bytes32 public immutable DOMAIN_SEPARATOR;

    mapping(address => bool) private contractWhitelist;
    mapping(address => uint256) private nonces;

    modifier byOwner(){
        require(contractOwner == msg.sender, "Not allowed");
        _;
    }

    modifier onlyWhitelisted(){
        require(contractWhitelist[msg.sender], "Contract not allowed");
        _;
    }
            
    constructor (uint256 _maxSupply)  ERC20("PablockToken", "PTK") {
        contractOwner = msg.sender;
        maxSupply = _maxSupply;

        

        DOMAIN_SEPARATOR = getDomainSeparator( "PablockToken", address(this));
        
    }

    function requestToken(address to, uint256 mintQuantity) public byOwner {
        // require(
        //     maxSupply >= totalSupply() + mintQuantity,
        //     "Would exceed max supply"
        // );
        _mint(to, mintQuantity * 10 ** DECIMALS);
    }

    function addContractToWhitelist(address _contract) public byOwner {
        contractWhitelist[_contract] = true;
    }

    function removeContractFromWhitelist(address _contract) public byOwner {
        contractWhitelist[_contract] = false;
    }

    function changeOwner(address _newOwner) public byOwner {
        contractOwner = _newOwner;
    }

    function changeMaxSupply(uint256 _maxSupply) public byOwner {
        maxSupply = _maxSupply;
    }

    function unlimitedApprove() external {
        _approve(msg.sender, address(this), MAX_ALLOWANCE);
    }

    function receiveAndBurn(uint256 amount, address addr) public onlyWhitelisted returns (bool) {
        _burn(addr, amount * 10 ** DECIMALS);
        return true;
    }

    function getContractStatus(address _contract) public view returns (bool){
        return contractWhitelist[_contract];
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

        bytes32 hash = generateHash(hashStruct, DOMAIN_SEPARATOR);

        address signer = ecrecover(hash, v, r, s);

        require(
            signer != address(0) && signer == owner,
            "PTK Permit: invalid signature"
        );
        
        if(msg.sender != spender){
            _approve(owner, msg.sender, amount * 10 ** DECIMALS);       
        }
        _approve(owner, spender, amount * 10 ** DECIMALS) ;

    }

    function getNonces(address addr) external view returns(uint256){
        return nonces[addr];
    }

    function getVersion() public view returns (string memory){
        return "PablockToken version 0.2.1 (Gasless)";
    }
}
