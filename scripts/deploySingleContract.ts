// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers, waffle } from "hardhat";

const PAYER = "0x6d2610394B36fAB55926Dd4739da536F59b20F5d";
const PABLOCK_TOKEN_ADDRESS = "0x9e0296fDfaB97c428507e36f077177EbDC4e5Faf";
const PABLOCK_METATX_ADDRESS = "0x3A2faCBF588DA64Ef94D90049d529f3862b7a6fb";

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const [addr0] = await ethers.getSigners();
  console.log(
    "ADDRESS 0 ==>",
    addr0.address,
    await waffle.provider.getBalance(addr0.address),
  );

  const Contract = await ethers.getContractFactory("TestMetaTransaction");

  const contract = await Contract.deploy(
    "TestMetaTransaction",
    "0.0.1",
    PABLOCK_TOKEN_ADDRESS,
    PABLOCK_METATX_ADDRESS,
    { gasLimit: 2000000, gasPrice: 800000000000 },
  );
  await contract.deployed();
  console.log("Contract deployed!");

  // const changeOwnerTx = await contract.transferOwnership(PAYER);
  // await changeOwnerTx.wait();
  // console.log("Changed owner!");

  console.log(`CONTRACT ADDRESS: ${contract.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
