// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";

import PablockNFTArtifact from "../artifacts/contracts/pablock/PablockNFT.sol/PablockNFT.json";
import PablockMUltiSignFactoryArtifact from "../artifacts/contracts/pablock/PablockMultiSignFactory.sol/PablockMultiSignFactory.json";

const PAYER = "0x6d2610394B36fAB55926Dd4739da536F59b20F5d";

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
    PAYER,
    { gasLimit: 10000000 },
  );
  await metaTransaction.deployed();
  console.log("Pablock MetaTransaction deployed!");

  if (metaTransaction.address) {
    const pablockToken = await PablockToken.deploy(1000000000, {
      gasLimit: 10000000,
    });
    await pablockToken.deployed();
    console.log("PablockToken deployed!");
    await pablockToken.setPayer(PAYER);
    console.log("Set payer for PablockToken");

    const pablockNotarization = await PablockNotarization.deploy(
      pablockToken.address,
      metaTransaction.address,
      PAYER,
      { gasLimit: 10000000 },
    );
    await pablockNotarization.deployed();
    console.log("PablockNotarization deployed!");

    const pablockNFT = await PablockNFT.deploy(
      "PablockNFT",
      "PTNFT",
      pablockToken.address,
      metaTransaction.address,
      { gasLimit: 10000000 },
    );
    await pablockNFT.deployed();
    console.log("PablockNFT deployed!");

    await metaTransaction.initialize(pablockToken.address, {
      gasLimit: 100000,
    });
    console.log("Pablock MetaTransaction initialized!");

    const multisignFactory = await PablockMultiSignFactory.deploy(
      pablockToken.address,
      metaTransaction.address,
      { gasLimit: 10000000 },
    );
    await multisignFactory.deployed();
    console.log("Pablock MultiSign Factory deployed!");

    await pablockToken.addContractToWhitelist(pablockToken.address, 1, 3, {
      gasLimit: 100000,
    });
    await pablockToken.addContractToWhitelist(
      pablockNotarization.address,
      1,
      3,
      { gasLimit: 100000 },
    );

    await pablockToken.addContractToWhitelist(pablockNFT.address, 1, 3, {
      gasLimit: 100000,
    });
    await pablockToken.addContractToWhitelist(multisignFactory.address, 1, 3, {
      gasLimit: 100000,
    });
    await pablockToken.addContractToWhitelist(metaTransaction.address, 1, 3, {
      gasLimit: 100000,
    });
    console.log("Contracts added to PablockToken whitelist!");

    // await pablockToken.addContractToWhitelist(
    //   testMetaTransaction.address,
    //   1,
    //   2
    // );

    // await pablockToken.changeProfilationStatus(
    //   testMetaTransaction.address,
    //   true
    // );

    /**
     * To unlockToken and create a multiSign contract you need to pay 2 PTK
     */
    await pablockToken.addFunctionPrice(
      pablockNFT.address, // @ts-ignore
      new ethers.utils.Interface(PablockNFTArtifact.abi).getSighash(
        "unlockToken",
      ),
      2,
      { gasLimit: 100000 },
    );
    await pablockToken.addFunctionPrice(
      multisignFactory.address, // @ts-ignore
      new ethers.utils.Interface(
        PablockMUltiSignFactoryArtifact.abi,
      ).getSighash("createNewMultiSignNotarization"),
      2,
      { gasLimit: 100000 },
    );
    console.log("Functions' prices added!");

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
