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
  "PABLOCK_TOKEN_ADDRESS": "0x4D47A9694389B1E42403FC5152E68d8D27803b14",
  "PABLOCK_META_TRANSACTION": "0x4419AF074BC3a6C7D90f242dfdC1a163Bc710091",
  "PABLOCK_NOTARIZATION": "0x8344F05f33AE80f1c03C8dc8f619719AcDe8cE49",
  "PABLOCK_NFT": "0x1cDED0caD17a03f410e6Cf3C3db003331B9341ec",
  "PABLOCK_MULTISIGN_FACTORY": "0x7296EE0F1036eC74eCF111E676e70eE97597A7d1"
}
```
