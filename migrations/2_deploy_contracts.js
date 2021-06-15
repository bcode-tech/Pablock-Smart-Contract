// /* global */
// const MetaCoin = artifacts.require("MetaCoin.sol");
// const Forwarder = artifacts.require("Forwarder.sol");

// module.exports = async function deployFunc(deployer, network) {
//   // first, check if already deployed through truffle:
//   const forwarder = await Forwarder.deployed()
//     .then((c) => c.address)
//     .catch((e) => require("../build/gsn/Forwarder.json").address);
//   if (!forwarder) {
//     throw new Error("no valid forwarder for network " + network);
//   }
//   console.log("using forwarder: ", forwarder);
//   await deployer.deploy(MetaCoin, forwarder, { gas: 2.6e6 });
//   console.log("Finished 2/3 migrations files");
// };

/* global */
const PablockToken = artifacts.require("PablockToken.sol");
const PablockNotarization = artifacts.require("PablockNotarization.sol");
const PablockNFT = artifacts.require("PablockNFT.sol");
const PablockMultiSignFactory = artifacts.require(
  "PablockMultiSignFactory.sol"
);

module.exports = async function deployFunc(deployer, network) {
  let pablockTokenAddress = null;
  await deployer.deploy(PablockToken, 1000000000).then(async (res) => {
    pablockTokenAddress = res.address;
  });
  console.log(pablockTokenAddress);
  if (pablockTokenAddress) {
    // await deployer.deploy(PablockNotarization, pablockTokenAddress);
    // await deployer.deploy(
    //   PablockNFT,
    //   "PablockNFT",
    //   "PTNFT",
    //   pablockTokenAddress
    // );
    await deployer.deploy(PablockMultiSignFactory, pablockTokenAddress);
  }

  // await deployer.deploy(
  //   PablockNotarization,
  //   "0xc1A4EEf2C26C1D757385f396411b8179b02c2B56"
  // );
  // await deployer.deploy(
  //   PablockNFT,
  //   "PablockNFT",
  //   "PTNFT",
  //   "0xbBE1aFaa82cF378AA124dcD6ab1c2B844F8944B4"
  //   // "0xc1A4EEf2C26C1D757385f396411b8179b02c2B56"
  // );
  // await deployer.deploy(
  //   PablockMultiSignFactory,
  //   "0x0891c7c2900dd52fE5B0218A896631cc6340786E"
  // );

  // await deployer.deploy(PablockMultiSignFactory);
  console.log("Finished 2/3 migrations files");
};
