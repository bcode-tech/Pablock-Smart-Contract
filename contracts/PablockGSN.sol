// SPDX-License-Identifier: MIT
pragma solidity ^0.6.2;

import "./ConvertLib.sol";
import "@opengsn/gsn/contracts/BaseRelayRecipient.sol";
import "./PablockToken.sol";


// This is just a simple example of a coin-like contract.
// It is not standards compatible and cannot be expected to talk to other
// coin/token contracts. If you want to create a standards-compliant
// token, see: https://github.com/ConsenSys/Tokens. Cheers!

contract PablockGSN is BaseRelayRecipient {


    string public symbol = "PBGSN";
    string public description = "Pablock GSN";
    uint public decimals = 0;

    mapping(address => uint) balances;

    event Transfer(address indexed _from, address indexed _to, uint256 _value);

    constructor(address forwarder) public {
        balances[tx.origin] = 10000;
        trustedForwarder = forwarder;
    }

    function versionRecipient() external override view returns (string memory) {
        return "2.0.0";
    }

    function transfer(address receiver, uint amount) public returns (bool sufficient) {
        
        if(PablockToken(msg.sender).balanceOf(msg.sender) < amount) return false;
        PablockToken(msg.sender).transferFrom(msg.sender, receiver, amount);
       
    }

    function balanceOf(address addr) public view returns (uint) {
        return balances[addr];
    }


    mapping(address => bool) minted;

    /**
     * mint some coins for this caller.
     * (in a real-life application, minting is protected for admin, or by other mechanism.
     * but for our sample, any user can mint some coins - but just once..
     */
    function mint() public {
        require(!minted[_msgSender()], "already minted");
        minted[_msgSender()] = true;
        balances[_msgSender()] += 10000;
    }

    function requestToken() public {
        PablockToken(msg.sender).requestToken(msg.sender);
    }
}
