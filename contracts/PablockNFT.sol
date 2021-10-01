// SPDX-License-Identifier: MIT
pragma solidity ^0.7.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./PablockToken.sol";


contract PablockNFT is ERC721 {
    
    address private contractOwner;
    address private pablockTokenAddress;
    uint256 private counter;

    bytes32 public immutable PERMIT_TYPEHASH = keccak256("Permit(address owner,address spender,uint256 tokenId,uint256 nonce,uint256 deadline)");
    bytes32 public immutable TRANSFER_TYPEHASH = keccak256("Transfer(address from,address to,uint256 tokenId)");

    bytes32 public immutable DOMAIN_SEPARATOR;

    mapping(address => uint256) private nonces;


    event TokenGeneration(address indexed from, string indexed uri, uint[] indexes) ;

    constructor(string memory _tokenName, string memory _tokenSymbol, address _contractAddr) ERC721(_tokenName, _tokenSymbol){
        counter = 0;
        pablockTokenAddress = _contractAddr;
        contractOwner = msg.sender;

        uint256 chainId = getChainId();
        
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes(_tokenName)),
                keccak256(bytes("1")),
                chainId,
                address(this)
            )
        );
    }

    modifier byOwner(){
        require(contractOwner == msg.sender, "Not allowed");
        _;
    }
    
    modifier initialized {
        require(pablockTokenAddress != address(0), "Contract not initialized");
        _;
    }

    function initialize (address contractAddr) public byOwner {
        pablockTokenAddress = contractAddr;
    }

    function generateToken(address to, uint quantity, string memory _uri) public initialized {

        PablockToken(pablockTokenAddress).receiveAndBurn(quantity, to);

        uint[] memory indexes = new uint[](quantity);

        // uint[quantity] memory indexes;

        for(uint i = 0; i < quantity; i++ ){
            _safeMint(to, counter);
            _setTokenURI(counter, _uri);
            indexes[i] = counter;
            counter++;
        }

        emit TokenGeneration(msg.sender, _uri, indexes);
    }

    function transferFrom(address from, address to, uint256 tokenId) override public initialized {
        
        PablockToken(pablockTokenAddress).receiveAndBurn(1, from);
        _transfer(from, to, tokenId);
              
    }

    function requestPermit(address owner, address spender, uint256 tokenId, uint256 deadline, uint8 v, bytes32 r, bytes32 s) public {  
        
        bytes32 hashStruct = keccak256(
            abi.encode(
                PERMIT_TYPEHASH,
                owner,
                spender,
                tokenId,
                nonces[owner]++,
                deadline
            )
        );

        bytes32 hash = generateHash(hashStruct);

        address signer = ecrecover(hash, v, r, s);

        require(
            signer != address(0) && signer == owner,
            "ERC721Permit: invalid signature"
        );

        // require(verifySignature( hash, v, r, s) == owner, "ERC20: Invalid signature");
        PablockToken(pablockTokenAddress).receiveAndBurn(1, owner);
        nonces[owner]++;

        
        if(msg.sender != spender){
            _approve(msg.sender, tokenId);       
        }
        _approve(spender, tokenId);

    }


    function getVersion() public view returns (string memory){
        return "PablockNFT version 0.2.0";
    }

    function getPablockTokenAddress() public view returns(address){
        return pablockTokenAddress;
    }

    function getNonces(address addr) external view returns(uint256){
        return nonces[addr];
    }

   function getChainId() public view returns (uint256 chain){
        uint256 chainId;
        assembly {
            chainId := chainid()
        }
        return chainId;
    }


    function generateHash(bytes32 hashStruct  ) private returns (bytes32 hash){
        return keccak256(
            abi.encodePacked(
                '\x19\x01',
                DOMAIN_SEPARATOR,
                hashStruct
            )
        );
    }

   
    // function getTokensOfOwner(address owner) public view returns(uint256[]){
    //     return _holderTokens[owner];
    // }

}

    
