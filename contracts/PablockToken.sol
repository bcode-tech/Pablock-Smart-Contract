pragma solidity ^0.6.2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract PablockToken is  ERC20 {

    address public contractOwner;
            
    constructor (uint256 _maxSupply) public ERC20("PablockToken", "PTK") {
        
        contractOwner = msg.sender;
        _mint(contractOwner, _maxSupply);
    }

    function requestToken(address _to) public {
        transferFrom(contractOwner, _to, 1000);
    }
}