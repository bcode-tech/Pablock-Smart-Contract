<!-- <img src="https://www.pablock.it/wp-content/uploads/2021/05/cropped-logoBCode_bianco-1.png" alt=""Pablock" height="40px"> -->

# Pablock-Smart-Contract

Implementations of Pablock Suite smazrt contracts, includes:

- PablockToken: ERC20 Utility Token to use Pablock services.
- PablockNFT: ERC721 token to generate custom NFT
- PablockNotarization: Notarization contract to save file hash on blockchain
- PablockMultiSign: Facotry to deploy multi sign contract.
- EIP712 compatible meta transaction.

## Overview

### Installation

```console
npm install git+https://github.com/bcode-tech/Pablock-Smart-Contracts
```

or

```console
yarn add git+https://github.com/bcode-tech/Pablock-Smart-Contracts
```

### Usage

Once installed, use PablockMetaTranasactionReceiver to enable Pablock meta
transaction on your contract.

```solidity
pragma solidity ^0.7.4;
import "pablock-smart-contract/contract/PablockMetaTxReceiver.sol";

contract MyContract is PablockMetaTxReceiver {
  constructor(address metaTxAddress)
    PablockMetaTxReceiver("MyContract", "0.0.1")
  {
    setMetaTransaction(metaTxAddress);
  }
}

```

metaTxAddress rappresents the deployment address of EIP712MetaTransaction
deployed by BCode from the Pablock ecosystem.

## Integration

To use Pablock contracts in your contract as shown above:

### MUBAI

For the Matic Mumbai network:

```json
{
  "PABLOCK_TOKEN_ADDRESS": "0x70b2b8c820d62e7bd95e296dcb8de6a18ad2bca5",
  "PABLOCK_META_TRANSACTION": "0x4884fd12bd652412648f3452148260c30e6cb08a",
  "PABLOCK_NOTARIZATION": "0xb2c82046c2cf26a247b4467ab95cba4398c8b9a0",
  "PABLOCK_NFT": "0x81e5fed95a6c474416d416a3fa59cf07fd7315f9",
  "PABLOCK_MULTISIGN_FACTORY": "0x819e458106f40bc7730bd0621b3201b51c05d205"
}
```
