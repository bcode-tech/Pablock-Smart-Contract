import { expect } from "chai";
import { ContractFactory, Contract, BigNumber } from "ethers";
import { ethers } from "hardhat";

import web3Abi from "web3-eth-abi";
import { getTransactionData } from "../utility";

import CustomNFTArtifact from "../artifacts/contracts/custom/CustomNFT.sol/CustomNFT.json";

import PRIVATE_KEYS from "../hardhatPrivateKeys.json";

describe("Custom NFT Contract", function () {
  let MetaTransaction, PablockToken, CustomContract: ContractFactory;

  let metaTransaction: Contract;
  let customContract: Contract;
  let pablockToken: Contract;

  /**
   * addr0 will be the owner of all the contract
   * payer will be the payer of all the contract,
   * can execute meta transaction but can be replaced in case of misfunction
   * payer and addr3 will be users with PTK
   * addr4 will be a user without PTK
   */
  before(async () => {
    const [pablockDeployer, customDeployer, payer, user] =
      await ethers.getSigners();

    MetaTransaction = await ethers.getContractFactory("EIP712MetaTransaction");
    PablockToken = await ethers.getContractFactory("PablockToken");

    CustomContract = await ethers.getContractFactory("CustomNFT");

    metaTransaction = await MetaTransaction.deploy(payer.address);
    await metaTransaction.deployed();

    pablockToken = await PablockToken.deploy(1000000000);
    await pablockToken.deployed();

    await metaTransaction.initialize(pablockToken.address);
    await pablockToken.addContractToWhitelist(
      metaTransaction.address,
      1,
      3,
      pablockDeployer.address,
      {
        gasLimit: 100000,
      },
    );
    console.log("MetaTx initialized!");

    if (metaTransaction.address) {
      customContract = await CustomContract.connect(customDeployer).deploy();
      await customContract.connect(customDeployer).deployed();
      await customContract
        .connect(customDeployer)
        .initialize(metaTransaction.address);
      console.log("CustomContract deployed!");

      await pablockToken.addFunctionPrice(
        customContract.address, // @ts-ignore
        new ethers.utils.Interface(CustomNFTArtifact.abi).getSighash(
          "mintToken",
        ),
        1,
      );
    }

    await pablockToken.requestToken(payer.address, 10);
    console.log("Deploy completed!");
  });

  it("Should add contract to whitelist", async () => {
    const [_, customDeployer, payer, user] = await ethers.getSigners();

    await expect(
      pablockToken.addContractToWhitelist(
        customContract.address,
        1,
        1,
        payer.address,
      ),
    )
      .to.emit(pablockToken, "ContractWhitelisted")
      .withArgs(customContract.address, payer.address);
  });
  /**
   * EXPLANATION: the orignal error is triggered in ForeverBambuNFT contract
   * and it's "Caller not allowed"
   * This error has been overwritten by "ERC20: burn amount exceeds balance"
   * because it happens after
   */
  it("Simple user should not mint with meta tx", async () => {
    const [_, customDeployer, payer, user] = await ethers.getSigners();

    // @ts-ignore
    const functionSignature = web3Abi.encodeFunctionCall(
      CustomNFTArtifact.abi.find(
        (el: any) => el.type === "function" && el.name === "mintToken",
      ),
      [user.address, "https://customToken.com/1"],
    );

    const nonce = await metaTransaction.getNonce(user.address);

    const { r, s, v } = await getTransactionData(
      nonce.toNumber(),
      functionSignature,
      user.address,
      PRIVATE_KEYS[3],
      {
        name: "CustomNFT",
        version: "0.0.1",
        address: customContract.address,
      },
    );

    await expect(
      metaTransaction
        .connect(_)
        .executeMetaTransaction(
          customContract.address,
          user.address,
          functionSignature,
          r,
          s,
          v,
        ),
    ).revertedWith("ERC20: burn amount exceeds balance");
  });
});
