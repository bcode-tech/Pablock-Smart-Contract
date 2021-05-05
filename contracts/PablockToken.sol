pragma solidity ^0.6.2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract PablockToken is  ERC20 {

    address public contractOwner;
    uint256 public maxSupply;
    uint256 constant MAX_ALLOWANCE = 2^256 - 1;

    function byOwner() private {
        require(contractOwner == msg.sender, "Messager sender is not contract owner");
    }
            
    constructor (uint256 maxSupply) public ERC20("PablockToken", "PTK") {
        contractOwner = msg.sender;
        this.maxSupply = maxSupply;
    }

    function requestToken(address to, uint256 mintQuantity) public byOwner {
        require(this.maxSupply >= totalSupply() + mintQuantity , "Would exceed max supply");
        _mint(to, mintQuantity);
    }

    function unlimitedApprove() external {
        _approve(msg.sender, address(this), MAX_ALLOWANCE);
    }

    function receiveAndBurn(uint256 amount) public {
        _burn(msg.sender, amount);
    }
}