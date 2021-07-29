const { ethers } = require("ethers");

/* global */
const PablockToken = artifacts.require("PablockToken.sol");
const PablockNotarization = artifacts.require("PablockNotarization.sol");
const PablockNFT = artifacts.require("PablockNFT.sol");
const PablockMultiSignFactory = artifacts.require(
  "PablockMultiSignFactory.sol"
);

const CustomFactory = artifacts.require("CustomFactory.sol");
const CustomERC20 = artifacts.require("CustomERC20.sol");

module.exports = async function (deployer, network) {
  process.env.NETWORK = deployer.network;

  deployer.then(async () => {
    const pablockToken = await deployer.deploy(PablockToken, 1000000000);
    console.log("PABLOCK TOKEN CONTRACT:", pablockToken.address);

    await deployer.deploy(
      CustomERC20,
      "Prova",
      "PRV",
      "0x5d1305A4EEE866c6b3C3Cf25ad70392b6459f2cD",
      "0xfc8CFa30350f7B195f2b5c6F350f76720bfD89f4",
      pablockToken.address
    );

    //   if (pablockToken.address) {
    //     const pablockNotarization = await deployer.deploy(
    //       PablockNotarization,
    //       pablockToken.address
    //     );

    //     console.log(
    //       "PABLOCK NOTARIZATION CONTRACT:",
    //       pablockNotarization.address
    //     );

    //     const pablockNFT = await deployer.deploy(
    //       PablockNFT,
    //       "PablockNFT",
    //       "PTNFT",
    //       pablockToken.address
    //     );

    //     console.log("PABLOCK NFT CONTRACT:", pablockNFT.address);

    //     const multisignFactory = await deployer.deploy(
    //       PablockMultiSignFactory,
    //       pablockToken.address
    //     );
    //     //
    //     console.log(
    //       "PABLOCK MULTISIGN FACTORY CONTRACT:",
    //       multisignFactory.address
    //     );

    //     await pablockToken.addContractToWhitelist(pablockNotarization.address);
    //     await pablockToken.addContractToWhitelist(pablockNFT.address);
    //     await pablockToken.addContractToWhitelist(multisignFactory.address);
    //   }
  });

  // if (pablockTokenAddress) {
  //   await deployer.deploy(PablockNotarization, pablockTokenAddress);
  //   await deployer.deploy(
  //     PablockNFT,
  //     "PablockNFT",
  //     "PTNFT",
  //     pablockTokenAddress
  //   );
  //   await deployer.deploy(PablockMultiSignFactory, pablockTokenAddress);
  // }

  // await deployer.deploy(
  //   PablockNotarization,
  //   "0xc1A4EEf2C26C1D757385f396411b8179b02c2B56"
  // );

  // await deployer.deploy(
  //   PablockNFT,
  //   "TryNFT",
  //   "TNFT",
  //   // "0xbBE1aFaa82cF378AA124dcD6ab1c2B844F8944B4"
  //   // "0x0891c7c2900dd52fE5B0218A896631cc6340786E"
  //   "0xAdEB4cEA8E4A28E2C6f83d1820DAB686929Fbf9A"
  // );

  // await deployer.deploy(
  //   PablockMultiSignFactory,
  //   // "0x0891c7c2900dd52fE5B0218A896631cc6340786E"
  //   "0x199DA9C3b0801945c6953ee962dF18f339aB5432"
  // );

  console.log("Finished 2/3 migrations files");
};
