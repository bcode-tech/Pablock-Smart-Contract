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

Once installed, use PablockMetaTranasactionReceiver to enable Pablock meta transaction on your contract.

```solidity
pragma solidity ^0.7.4;
import "pablock-smart-contract/contract/PablockMetaTxReceiver.sol";

contract MyContract is PablockMetaTxReceiver {
  constructor(address metaTxAddress)
    PablockMetaTxReceiver("MyContract", "0.0.1", metaTxAddress)
  {}
}

```

metaTxAddress rappresents the deployment address of EIP712MetaTransaction deployed by BCode fro the Pablock ecosystem.
