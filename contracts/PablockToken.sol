// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./PablockMetaTxReceiver.sol";
import "./lib/EIP712Base.sol";

contract PablockToken is ERC20, PablockMetaTxReceiver {
    /**
     * NOTESET -> not correctly configured
     * CONSUME -> users need to have PTK in order to execute ops
     * SUBSCRIPTION -> users with subscription contract, have a flat monthly fee to execute as many request
     * INTERNAL -> used by Pablock cotracts
     */
    enum SubscriptionType {NOTSET, CONSUME, SUBSCRIPTION, INTERNAL}

    struct WhiteListedContract {
        uint256 defaultPrice;
        bool isSet;
        SubscriptionType subscriptionType;
        mapping(bytes4 => uint256) functionPrices;
        mapping(address => bool) allowedAddresses;
        bool profilationEnabled;
address contractOwner;
    }

    uint256 MAX_ALLOWANCE = 2 ^ (256 - 1);
    uint256 DECIMALS = 18;

    address contractOwner;

    //Supply data
    uint256 maxSupply;
    bool lockSupply = false;

    bytes32 public immutable PERMIT_TYPEHASH = keccak256(
        "Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"
    );

    // mapping(address => bool) private contractWhitelist;
    mapping(address => WhiteListedContract) private contractWhitelist;
    mapping(address => uint256) private nonces;

    modifier byOwner() {
        require(contractOwner == msgSender(), "Not allowed");
        _;
    }

    modifier onlyWhitelisted() {
        require(contractWhitelist[msgSender()].isSet, "Contract not allowed");
        _;
    }

    constructor(uint256 _maxSupply)
        ERC20("PablockToken", "PTK")
        PablockMetaTxReceiver("PablockToken", "0.2.3")
    {
        contractOwner = msgSender();
        maxSupply = _maxSupply;
    }

    function initialize(address _owner) public byOwner {
        contractOwner = _owner;
    }

    function requestToken(address to, uint256 mintQuantity) public byOwner {
        if (lockSupply) {
            require(
                (maxSupply >= totalSupply() + mintQuantity),
                "Would exceed max supply"
            );
        }

        _mint(to, mintQuantity * 10**DECIMALS);
    }

    function addContractToWhitelist(
        address _contract,
        uint256 _price,
        uint256 _type
    ) public byOwner {
        contractWhitelist[_contract].isSet = true;
        contractWhitelist[_contract].defaultPrice = _price;
        contractWhitelist[_contract].subscriptionType = SubscriptionType(_type);
    }

    function removeContractFromWhitelist(address _contract) public byOwner {
        contractWhitelist[_contract].isSet = false;
    }

    function addFunctionPrice(
        address _contract,
        bytes4 _functionSig,
        uint256 price
    ) public byOwner {
        contractWhitelist[_contract].functionPrices[_functionSig] = price;
    }

    function getFunctionPrice(address _contract, bytes4 _functionSig)
        public
        view
        returns (uint256 price)
    {
        return contractWhitelist[_contract].functionPrices[_functionSig];
    }

    function setSubUserAddr(address contractAddr, address userAddress, bool status) public {
        require(contractWhitelist[contractAddr].contractOwner == msgSender(), "Address not authorized");
        
        _burn(msgSender(), 1 * 10**DECIMALS);
        
        contractWhitelist[contractAddr].allowedAddresses[userAddress] = status;
    }

    function changeOwner(address _newOwner) public byOwner {
        contractOwner = _newOwner;
    }

    function changeSupplyData(uint256 _maxSupply, bool _lockSupply)
        public
        byOwner
    {
        maxSupply = _maxSupply;
        lockSupply = _lockSupply;
    }

    function receiveAndBurn(
        address _contract,
        bytes4 _functionSig,
        address addr
    ) public onlyWhitelisted returns (bool) {
        if (
            (msgSender() != contractOwner &&
                contractWhitelist[_contract].subscriptionType ==
                SubscriptionType.CONSUME &&
                contractWhitelist[_contract].subscriptionType !=
                SubscriptionType.NOTSET) ||
            (msgSender() == _contract &&
                contractWhitelist[_contract].subscriptionType ==
                SubscriptionType.INTERNAL)
        ) {
            _burn(addr, getPrice(_contract, _functionSig) * 10**DECIMALS);
        }
        return true;
    }

    function getPrice(address _contract, bytes4 _functionSig)
        internal
        view
        returns (uint256)
    {
        if (contractWhitelist[_contract].functionPrices[_functionSig] == 0) {
            return contractWhitelist[_contract].defaultPrice;
        } else {
            return contractWhitelist[_contract].functionPrices[_functionSig];
        }
    }

    function getContractStatus(address _contract) public view returns (bool) {
        return contractWhitelist[_contract].isSet;
    }

    function requestPermit(
        address owner,
        address spender,
        uint256 amount,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public {
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

        bytes32 hash = toTypedMessageHash(hashStruct, address(this));

        address signer = ecrecover(hash, v, r, s);

        require(
            signer != address(0) && signer == owner,
            "PTK Permit: invalid signature"
        );

        if (msgSender() != spender) {
            _approve(owner, msgSender(), amount * 10**DECIMALS);
        }
        _approve(owner, spender, amount * 10**DECIMALS);
    }

    function getNonces(address addr) external view returns (uint256) {
        return nonces[addr];
    }

    function getVersion() public pure returns (string memory) {
        return "PablockToken version 0.2.3";
    }

}
