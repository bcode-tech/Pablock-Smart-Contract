const fs = require("fs");
const {ethers, BigNumber} = require("ethers");

const truffleAssert = require("truffle-assertions");
const web3Abi = require("web3-eth-abi");

const TestMetaTransaction = artifacts.require(
  "./custom/TestMetaTransaction.sol"
);
const PablockToken = artifacts.require("./PablockToken.sol");
const MetaTransaction = artifacts.require("./EIP712MetaTransaction.sol");

const {getTransactionData} = require("../utility");
const {expect} = require("chai");

const privateKeys = require("../ganachePrivateKeys.json");

const {abi} = require("../build/contracts/TestMetaTransaction.json");
const {reverts} = require("truffle-assertions");

let balance = null;

let pablockTokenInstance = null;
let metaTransactionInstance = null;

contract("Test Meta Transaction", async (accounts) => {
  it("should have token", async () => {
    pablockTokenInstance = await PablockToken.deployed();
    metaTransactionInstance = await MetaTransaction.deployed();

    balance = ethers.utils.formatEther(
      (await pablockTokenInstance.balanceOf(accounts[1])).toString()
    );

    if (balance < 10) {
      await pablockTokenInstance.requestToken(accounts[1], 5 - balance);
      balance = ethers.utils.formatEther(
        (await pablockTokenInstance.balanceOf(accounts[1])).toString()
      );
    }
    await pablockTokenInstance.requestToken(accounts[0], 1);
    expect(balance).equal("5.0");
  });
  it("should not increment", async () => {
    const testMetaTxInstance = await TestMetaTransaction.deployed();

    const functionSignature = web3Abi.encodeFunctionCall(
      abi.find((el) => el.type === "function" && el.name === "increment"),
      []
    );

    let nonce = await metaTransactionInstance.getNonce(accounts[1]);

    let {r, s, v} = await getTransactionData(
      nonce.toNumber(),
      functionSignature,
      accounts[1],
      privateKeys[1],
      {
        name: "TestMetaTransaction",
        version: "0.0.1",
        address: testMetaTxInstance.address,
      }
    );

    await reverts(
      metaTransactionInstance.executeMetaTransaction(
        testMetaTxInstance.address,
        accounts[1],
        functionSignature,
        r,
        s,
        v,
        {from: accounts[0]}
      ),
      "User not allowed to execute function"
    );
  });
  it("should increment with meta transaction", async () => {
    const testMetaTxInstance = await TestMetaTransaction.deployed();

    await pablockTokenInstance.setSubUserAddr(
      testMetaTxInstance.address,
      accounts[1],
      true
    );

    const functionSignature = web3Abi.encodeFunctionCall(
      abi.find((el) => el.type === "function" && el.name === "increment"),
      []
    );

    let nonce = await metaTransactionInstance.getNonce(accounts[1]);

    let {r, s, v} = await getTransactionData(
      nonce.toNumber(),
      functionSignature,
      accounts[1],
      privateKeys[1],
      {
        name: "TestMetaTransaction",
        version: "0.0.1",
        address: testMetaTxInstance.address,
      }
    );

    await metaTransactionInstance.executeMetaTransaction(
      testMetaTxInstance.address,
      accounts[1],
      functionSignature,
      r,
      s,
      v,
      {from: accounts[0]}
    );

    const currentBalance = ethers.utils.formatEther(
      (await pablockTokenInstance.balanceOf(accounts[1])).toString()
    );

    expect(currentBalance).equal("5.0");
  });
});
