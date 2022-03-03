<!-- <img src="https://www.pablock.it/wp-content/uploads/2021/05/cropped-logoBCode_bianco-1.png" alt=""Pablock" height="40px"> -->

# Pablock Smart Contract

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

## Development

Trying to improve the contracts? Test? Deploy? Run scripts?

Use a .env file based on .env.example to store private keys and other variables.

For testing meta transaction the test will need private keys of hardhat
generated wallet. Run

```console
npx hardhat node
```

Take a bunch of keys and store them in privateKeys.json as an array, the keys
will not need of 0x prefix.

Install all the dependencies:

```console
yarn install
```

Run all test:

```console
npx hardhat test
```

Run specific test:

```console
npx hardhat test test/PablockNotarization.test.ts
```

Deploy:

```console
npx hardhat run scripts/deploy.ts --network <network_name>
```

## Usage

Once installed, use PablockMetaTranasactionReceiver to enable Pablock meta
transaction on your contract.

```solidity
pragma solidity 0.8.9;
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

Contract addresses of currently deployed contracts are shown below.

### MUBAI

Currently deployed contract on Mumbai Testnet refers to v1.1.4

```json
{
  "PABLOCK_TOKEN_ADDRESS": "0x4453cfB250e3a81197D331C86A9B1C8778bb0246",
  "PABLOCK_META_TRANSACTION": "0x4419AF074BC3a6C7D90f242dfdC1a163Bc710091",
  "PABLOCK_NOTARIZATION": "0x8344F05f33AE80f1c03C8dc8f619719AcDe8cE49",
  "PABLOCK_NFT": "0x1cDED0caD17a03f410e6Cf3C3db003331B9341ec",
  "PABLOCK_MULTISIGN_FACTORY": "0x7296EE0F1036eC74eCF111E676e70eE97597A7d1"
}
```

### POLYGON MAINNET

Currently deployed contract on Mumbai Testnet refers to v1.1.2

```json
{
  "PABLOCK_TOKEN_ADDRESS_POLYGON": "0x284a7eF2ADD52890980E0173469FDE45d172bABD",
  "PABLOCK_META_TRANSACTION_POLYGON": "0x5Dc63336bA6d4c1688E51e91fD7B002FC58C2dc9",
  "PABLOCK_NOTARIZATION_POLYGON": "0xa347328B5b71eCFFcA8Da951AE2bDDa42F32066D",
  "PABLOCK_NFT_POLYGON": "0x5979b9697C7ff4AD8925680a0998C449F070E962",
  "PABLOCK_MULTISIGN_FACTORY_POLYGON": "0xDF4FEC568B4975AE4E39AAC576143d0E86dd2e1A"
}
```
