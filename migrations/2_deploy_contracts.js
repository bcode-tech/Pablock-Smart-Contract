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

//MetaTransaction Contract
const MetaTransaction = artifacts.require("EIP712MetaTransaction.sol");

module.exports = async function (deployer, network) {
  process.env.NETWORK = deployer.network;

  deployer.then(async () => {
    const pablockToken = await deployer.deploy(PablockToken, 1000000000);
    console.log("PABLOCK TOKEN CONTRACT:", pablockToken.address);

    // const pablockToken = {
    //   // address: "0x9D0d991c90112C2805F250cD7B5D399c5e834088", //MUMBAI
    //   // address: "0x2b9233683001657161db866c7405493Fc1d1C22d", //LOCAL Legacy
    //   address: "0x2F73D51b8813775D8CFB2a7147b516CB01EEb4C2", //LOCAL Permit enabled
    // };

    if (pablockToken.address) {
      const metaTransaction = await deployer.deploy(
        MetaTransaction,
        "PablockMetaTransaction",
        "0.1.0",
        pablockToken.address
      );
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

      const pablockNotarization = await deployer.deploy(
        PablockNotarization,
        metaTransaction.address
      );

      const pablockNFT = await deployer.deploy(
        PablockNFT,
        "PablockNFT",
        "PTNFT",
        metaTransaction.address
      );

      const multisignFactory = await deployer.deploy(
        PablockMultiSignFactory,
        metaTransaction.address
      );

      //Contract whitelisting on PablockToken
      await pablockToken.addContractToWhitelist(
        pablockNotarization.address,
        1,
        1
      );
      await pablockToken.addContractToWhitelist(pablockNFT.address, 1, 1);
      await pablockToken.addContractToWhitelist(multisignFactory.address, 1, 1);
      // await pablockToken.addContractToWhitelist(customERC20.address);

      //Contract registration on PablocketaTransaction
      await metaTransaction.registerContract(
        "PablockNotarization",
        "0.1.0",
        pablockNotarization.address
      );
      await metaTransaction.registerContract(
        "PablockNFT",
        "0.2.1",
        pablockNFT.address
      );
      await metaTransaction.registerContract(
        "PablockMultiSignFactory",
        "0.1.1",
        multisignFactory.address
      );

      console.log("PABLOCK TOKEN CONTRACT:", pablockToken.address);
      console.log("PABLOCK META TRANSACTION: ", metaTransaction.address);
      // console.log("CUSTOMERC20 TOKEN ADDRESS: ", customERC20.address);
      console.log(
        "PABLOCK NOTARIZATION CONTRACT:",
        pablockNotarization.address
      );
      console.log("PABLOCK NFT CONTRACT:", pablockNFT.address);
      console.log(
        "PABLOCK MULTISIGN FACTORY CONTRACT:",
        multisignFactory.address
      );

      const contractsAddress = [
        // "0xF99b4Aef511E395958d254beF144866Ab4959287", // Notarization
        // "0x86A8A88286443536764953E70A3aC533687B7012", // NFT
        // "0x3EDCA10Df9E81A812ccf79ff10baAC67337680D6", // MultiSign
        // "0xB8Fdda9445a65FFA6cBC03349bFFD9208A755EC1", // CustomERC20
      ];
      // for (const addr of contractsAddress) {
      //   await pablockToken.addContractToWhitelist(addr);
      // }
    }
  });

  console.log("Finished 2/3 migrations files");
};
