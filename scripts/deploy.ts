// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const MetaTransaction = await ethers.getContractFactory(
    "EIP712MetaTransaction",
  );
  const PablockToken = await ethers.getContractFactory("PablockToken");
  const PablockNotarization = await ethers.getContractFactory(
    "PablockNotarization",
  );
  const PablockNFT = await ethers.getContractFactory("PablockNFT");
  const PablockMultiSignFactory = await ethers.getContractFactory(
    "PablockMultiSignFactory",
  );

  const metaTransaction = await MetaTransaction.deploy(
    "PablockMetaTransaction",
    "0.1.0",
  );

  await metaTransaction.deployed();

  if (metaTransaction.address) {
    const pablockToken = await PablockToken.deploy(1000000000);
    await pablockToken.deployed();

    const pablockNotarization = await PablockNotarization.deploy(
      pablockToken.address,
      metaTransaction.address,
    );
    await pablockNotarization.deployed();

    const pablockNFT = await PablockNFT.deploy(
      "PablockNFT",
      "PTNFT",
      pablockToken.address,
      metaTransaction.address,
    );
    await pablockNFT.deployed();

    const multisignFactory = await PablockMultiSignFactory.deploy(
      pablockToken.address,
      metaTransaction.address,
    );
    await multisignFactory.deployed();

    await metaTransaction.initialize(pablockToken.address);

    await pablockToken.addContractToWhitelist(pablockToken.address, 1, 3);
    await pablockToken.addContractToWhitelist(
      pablockNotarization.address,
      1,
      3,
    );

    await pablockToken.addContractToWhitelist(pablockNFT.address, 1, 3);
    await pablockToken.addContractToWhitelist(multisignFactory.address, 1, 3);
    await pablockToken.addContractToWhitelist(metaTransaction.address, 1, 3);
    // await pablockToken.addContractToWhitelist(
    //   testMetaTransaction.address,
    //   1,
    //   2
    // );

    // await pablockToken.changeProfilationStatus(
    //   testMetaTransaction.address,
    //   true
    // );

    console.log("PABLOCK_TOKEN_ADDRESS=", pablockToken.address);
    console.log("PABLOCK_META_TRANSACTION=", metaTransaction.address);
    console.log("PABLOCK_NOTARIZATION=", pablockNotarization.address);
    console.log("PABLOCK_NFT=", pablockNFT.address);
    console.log("PABLOCK_MULTISIGN_FACTORY=", multisignFactory.address);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
