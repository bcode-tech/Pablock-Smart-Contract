// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";

const PAYER = "0x3160bc56318310d11FC410F21C8986E559d3380a";
const PABLOCK_TOKEN_ADDRESS = "0x4D47A9694389B1E42403FC5152E68d8D27803b14";
const PABLOCK_METATX_ADDRESS = "0x4419AF074BC3a6C7D90f242dfdC1a163Bc710091";

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const Contract = await ethers.getContractFactory("PablockNFT");

  const contract = await Contract.deploy(
    "PablockNFT",
    "PTNFT",
    PABLOCK_TOKEN_ADDRESS,
    PABLOCK_METATX_ADDRESS,
    { gasLimit: 10000000 },
  );
  await contract.deployed();
  console.log("Contract deployed!");

  const changeOwnerTx = await contract.transferOwnership(PAYER);
  await changeOwnerTx.wait();
  console.log("Changed owner!");

  console.log(`CONTRACT ADDRESS: ${contract.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
