// SPDX-License-Identifier: MIT
pragma solidity ^0.7.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./lib/EIP712Base.sol";

contract PablockToken is ERC20, EIP712Base {
    enum SubscriptionType {
        NOTSET,
        CONSUME,
        SUBSCRIPTION
    }

    struct WhiteListedContract {
        uint256 defaultPrice;
        bool isSet;
        SubscriptionType subscriptionType;
        mapping(bytes4 => uint256) functionPrices;
    }

    uint256 MAX_ALLOWANCE = 2 ^ (256 - 1);
    uint256 DECIMALS = 18;

    address contractOwner;
    address pablockDataAddress;

    //Supply data
    uint256 maxSupply;
    bool lockSupply = false;

    bytes32 public immutable PERMIT_TYPEHASH =
        keccak256(
            "Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"
        );

    // mapping(address => bool) private contractWhitelist;
    mapping(address => WhiteListedContract) private contractWhitelist;
    mapping(address => uint256) private nonces;

    modifier byOwner() {
        require(contractOwner == msg.sender, "Not allowed");
        _;
    }

    modifier onlyWhitelisted() {
        require(contractWhitelist[msg.sender].isSet, "Contract not allowed");
        _;
    }

    constructor(uint256 _maxSupply) ERC20("PablockToken", "PTK") EIP712Base("PablockToken", "0.0.1") {
        contractOwner = msg.sender;
        maxSupply = _maxSupply;

       
    }

    function initialize(address _owner, address _pablockDataAddress)
        public
        byOwner
    {
        contractOwner = _owner;
        pablockDataAddress = _pablockDataAddress;
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

    function unlimitedApprove() external {
        _approve(msg.sender, address(this), MAX_ALLOWANCE);
    }

    function receiveAndBurn(
        address _contract,
        bytes4 _functionSig,
        address addr
    ) public onlyWhitelisted returns (bool) {
        if (
            contractWhitelist[_contract].subscriptionType ==
            SubscriptionType.CONSUME && contractWhitelist[_contract].subscriptionType !=
            SubscriptionType.NOTSET
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

        if (msg.sender != spender) {
            _approve(owner, msg.sender, amount * 10**DECIMALS);
        }
        _approve(owner, spender, amount * 10**DECIMALS);
    }

    function getNonces(address addr) external view returns (uint256) {
        return nonces[addr];
    }

    function getVersion() public pure returns (string memory) {
        return "PablockToken version 0.2.2 (Gasless)";
    }
}
