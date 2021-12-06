/* global */
//Pablock Contracts
const PablockToken = artifacts.require("PablockToken.sol");
const PablockNotarization = artifacts.require("PablockNotarization.sol");
const PablockNFT = artifacts.require("PablockNFT.sol");
const PablockMultiSignFactory = artifacts.require(
  "PablockMultiSignFactory.sol"
);

//Custom contracts
const CustomERC20 = artifacts.require("CustomERC20.sol");
const TestMetaTransaction = artifacts.require("TestMetaTransaction.sol");

//MetaTransaction Contract
const MetaTransaction = artifacts.require("EIP712MetaTransaction.sol");

module.exports = async function (deployer, network) {
  process.env.NETWORK = deployer.network;

  deployer.then(async () => {
    // const pablockToken = await deployer.deploy(PablockToken, 1000000000);

    const pablockToken = {
      address: "0xFDF84B11382343FbCe877277aEC42091F34bA25D", //MUMBAI
      // address: "0x2b9233683001657161db866c7405493Fc1d1C22d", //LOCAL Legacy
    };

    const metaTransaction = {
      address: "0x3FEecd6269D880Fff83bA82ddA90639062377FB3",
    };

    if (pablockToken.address) {
      // const metaTransaction = await deployer.deploy(
      //   MetaTransaction,
      //   "PablockMetaTransaction",
      //   "0.1.0",
      //   pablockToken.address
      // );
      // const customERC20 = await deployer.deploy(
      //   CustomERC20,
      //   "CustomERC20",
      //   "CTK",
      //   "0x5d1305A4EEE866c6b3C3Cf25ad70392b6459f2cD", // Contract Owner account[1]
      //   "0xfc8CFa30350f7B195f2b5c6F350f76720bfD89f4", // Delegate accounts[0]
      //   // "0x2b61353f31063D007F13eF207cc0cF412648FDF6", //Yupik Wallet address
      //   // "0xf68ec20B5B40B657A32d17DABBbDf6E4FD1497df", //Pablock Wallet address
      //   // "0x5a4654f393CBa1f8Aed8790E98435aEC057b353C", // Contract Owner account[1]
      //   // "0xf68ec20B5B40B657A32d17DABBbDf6E4FD1497df", // Delegate accounts[0]
      //   pablockToken.address
      // );

      // await deployer.deploy(
      //   CustomERC20,
      //   "Yupik",
      //   "YPK",
      //   "0x2b61353f31063D007F13eF207cc0cF412648FDF6",
      //   "0xf68ec20B5B40B657A32d17DABBbDf6E4FD1497df",
      //   pablockToken.address
      // );

      // const testMetaTransaction = await deployer.deploy(
      //   TestMetaTransaction,
      //   "TestMetaTransaction",
      //   "0.0.1",
      //   pablockToken.address,
      //   metaTransaction.address
      // );

      // const pablockNotarization = await deployer.deploy(
      //   PablockNotarization,
      //   pablockToken.address,
      //   metaTransaction.address
      // );

      const pablockNFT = await deployer.deploy(
        PablockNFT,
        "PablockNFT",
        "PTNFT",
        pablockToken.address,
        metaTransaction.address
      );

      const multisignFactory = await deployer.deploy(
        PablockMultiSignFactory,
        pablockToken.address,
        metaTransaction.address
      );

      //Contract whitelisting on PablockToken
      // await pablockToken.addContractToWhitelist(
      //   pablockNotarization.address,
      //   1,
      //   3
      // );
      // await pablockToken.addContractToWhitelist(pablockNFT.address, 1, 3);
      // await pablockToken.addContractToWhitelist(multisignFactory.address, 1, 3);
      // await pablockToken.addContractToWhitelist(metaTransaction.address, 1, 3);
      // await pablockToken.addContractToWhitelist(
      //   testMetaTransaction.address,
      //   1,
      //   1
      // );

      // console.log("PABLOCK_TOKEN_ADDRESS=", pablockToken.address);
      // console.log("PABLOCK_META_TRANSACTION=", metaTransaction.address);
      // // console.log("CUSTOMERC20 TOKEN ADDRESS: ", customERC20.address);
      // console.log("PABLOCK_NOTARIZATION=", pablockNotarization.address);
      console.log("PABLOCK_NFT=", pablockNFT.address);
      console.log("PABLOCK_MULTISIGN_FACTORY=", multisignFactory.address);
      console.log("TEST_META_TX=", testMetaTransaction.address);
    }
  });

  console.log("Finished 2/3 migrations files");
};
