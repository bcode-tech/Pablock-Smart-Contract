import { expect } from "chai";
import { ContractFactory, Contract, BigNumber } from "ethers";
import { ethers } from "hardhat";

import web3Abi from "web3-eth-abi";
import { getTransactionData } from "../utility";

import TestMetaTxArtifact from "../artifacts/contracts/custom/TestMetaTransaction.sol/TestMetaTransaction.json";

const PRIVATE_KEYS = [
  "ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
  "59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
  "5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a",
  "7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6",
];

describe("Custom Contract test SUBSCRIPTION type", function () {
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
    const [_, payer] = await ethers.getSigners();

    MetaTransaction = await ethers.getContractFactory("EIP712MetaTransaction");
    PablockToken = await ethers.getContractFactory("PablockToken");

    CustomContract = await ethers.getContractFactory("TestMetaTransaction");

    metaTransaction = await MetaTransaction.deploy(payer.address);
    await metaTransaction.deployed();

    pablockToken = await PablockToken.deploy(1000000000);
    await pablockToken.deployed();

    await metaTransaction.initialize(pablockToken.address);
    await pablockToken.addContractToWhitelist(
      metaTransaction.address,
      1,
      3,
      _.address,
      {
        gasLimit: 100000,
      },
    );
    console.log("MetaTx initialized!");

    if (metaTransaction.address) {
      customContract = await CustomContract.connect(payer).deploy(
        metaTransaction.address,
      );
      await customContract.connect(payer).deployed();

      console.log("CustomContract deployed!");

      await pablockToken.addFunctionPrice(
        customContract.address, // @ts-ignore
        new ethers.utils.Interface(TestMetaTxArtifact.abi).getSighash(
          "increment",
        ),
        5,
      );
    }

    await pablockToken.requestToken(payer.address, 10);
    console.log("Deploy completed!");
  });

  it("Should add contract to whitelist", async () => {
    const [_, payer] = await ethers.getSigners();

    await expect(
      pablockToken.addContractToWhitelist(
        customContract.address,
        1,
        2,
        payer.address,
      ),
    )
      .to.emit(pablockToken, "ContractWhitelisted")
      .withArgs(customContract.address, payer.address);
  });
  it("Should not increment", async () => {
    const [_, payer, user] = await ethers.getSigners();

    // @ts-ignore
    const functionSignature = web3Abi.encodeFunctionCall(
      TestMetaTxArtifact.abi.find(
        (el: any) => el.type === "function" && el.name === "increment",
      ),
      [],
    );

    const nonce = await metaTransaction.getNonce(user.address);

    const { r, s, v } = await getTransactionData(
      nonce.toNumber(),
      functionSignature,
      user.address,
      PRIVATE_KEYS[2],
      {
        name: "TestMetaTransaction",
        version: "0.1.0",
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
    ).revertedWith("Not allowed");
  });
  it("Should allowed user", async () => {
    const [_, payer, user] = await ethers.getSigners();

    // @ts-ignore
    const functionSignature = web3Abi.encodeFunctionCall(
      TestMetaTxArtifact.abi.find(
        (el: any) => el.type === "function" && el.name === "allowedUser",
      ),
      [user.address],
    );

    const nonce = await metaTransaction.getNonce(user.address);

    const { r, s, v } = await getTransactionData(
      nonce.toNumber(),
      functionSignature,
      payer.address,
      PRIVATE_KEYS[1],
      {
        name: "TestMetaTransaction",
        version: "0.1.0",
        address: customContract.address,
      },
    );

    await expect(
      metaTransaction
        .connect(_)
        .executeMetaTransaction(
          customContract.address,
          payer.address,
          functionSignature,
          r,
          s,
          v,
        ),
    )
      .to.emit(customContract, "SubUser")
      .withArgs(user.address);

    const currentBalance = await pablockToken.balanceOf(payer.address);

    expect(currentBalance).to.eq(ethers.utils.parseEther("9"));
  });
  it("Should increment and user payer token", async () => {
    const [_, payer, user] = await ethers.getSigners();

    // @ts-ignore
    const functionSignature = web3Abi.encodeFunctionCall(
      TestMetaTxArtifact.abi.find(
        (el: any) => el.type === "function" && el.name === "increment",
      ),
      [],
    );

    const nonce = await metaTransaction.getNonce(user.address);

    const { r, s, v } = await getTransactionData(
      nonce.toNumber(),
      functionSignature,
      user.address,
      PRIVATE_KEYS[2],
      {
        name: "TestMetaTransaction",
        version: "0.1.0",
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
    ).to.emit(customContract, "Increment");

    const currentBalance = await pablockToken.balanceOf(payer.address);

    expect(currentBalance).to.eq(ethers.utils.parseEther("4"));
  });
  it("Should increment without metatx", async () => {
    await expect(customContract.increment())
      .to.emit(customContract, "Increment")
      .withArgs(2);
  });
});
