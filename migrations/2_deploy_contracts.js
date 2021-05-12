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
// const PablockMultiSignFactory = artifacts.require(
//   "PablockMultiSignFactory.sol"
// );

module.exports = async function deployFunc(deployer, network) {
  // await deployer.deploy(PablockToken, 1000000000).then(async (res) => {
  //   // await deployer.deploy(PablockNotarization);
  //   await deployer.deploy(PablockNFT, res.address);
  // });
  await deployer.deploy(
    PablockNFT,
    "0x0C7229f982a199A0A2b0Bacb450Eb2F6e92981f8"
  );

  // await deployer.deploy(PablockMultiSignFactory);
  console.log("Finished 2/3 migrations files");
};
