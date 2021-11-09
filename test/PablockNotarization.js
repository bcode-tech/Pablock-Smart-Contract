const fs = require("fs");
const { ethers, BigNumber } = require("ethers");

const truffleAssert = require("truffle-assertions");
const web3Abi = require("web3-eth-abi");

const PablockNotarization = artifacts.require(
  "./pablock/PablockNotarization.sol"
);
const PablockToken = artifacts.require("./PablockToken.sol");
const MetaTransaction = artifacts.require("./EIP712MetaTransaction.sol");

const { getTransactionData } = require("../utility");
const { expect } = require("chai");

const privateKeys = [
  "52f6882af2362a0f3b9efc67e2521b6a698283e88ebb5428285168ea303fd15b",
  "fc0846a4e1d827c9c7a1fd8f255074d01bb019760a2065e0756b578dde00ecf1",
  "cac55b77a9a055839272436dba5c38aa9ed18b052330c9a3bf426848ccfcd4fc",
];

const { abi } = require("../build/contracts/PablockNotarization.json");

let balance = null;

let pablockTokenInstance = null;
let metaTransactionInstance = null;

contract("Pablock Notarization", async (accounts) => {
  it("should have token", async () => {
    pablockTokenInstance = await PablockToken.deployed();
    metaTransactionInstance = await MetaTransaction.deployed();

    balance = ethers.utils.formatEther(
      (await pablockTokenInstance.balanceOf(accounts[1])).toString()
    );

    if (balance < 5) {
      await pablockTokenInstance.requestToken(accounts[1], 5 - balance);
      balance = ethers.utils.formatEther(
        (await pablockTokenInstance.balanceOf(accounts[1])).toString()
      );
    }
    expect(balance).equal("5.0");
  });
  it("should notarize with directly", async () => {
    const pablockNotarizationInstance = await PablockNotarization.deployed();

    let tx = await pablockNotarizationInstance.notarize(
      "0xb133a0c0e9bee3be20163d2ad31d6248db292aa6dcb1ee087a2aa50e0fc75ae2",
      "",
      accounts[1],
      "",
      { from: accounts[1] }
    );

    const currentBalance = ethers.utils.formatEther(
      (await pablockTokenInstance.balanceOf(accounts[1])).toString()
    );

    expect(currentBalance).equal("4.0");
  });
  it("should notarize with meta transaction", async () => {
    const pablockNotarizationInstance = await PablockNotarization.deployed();

    const functionSignature = web3Abi.encodeFunctionCall(
      abi.find((el) => el.type === "function" && el.name === "notarize"),
      [
        "0xb133a0c0e9bee3be20163d2ad31d6248db292aa6dcb1ee087a2aa50e0fc75ae2",
        "",
        accounts[1],
        "",
      ]
    );

    let nonce = await metaTransactionInstance.getNonce(accounts[1]);

    let { r, s, v } = await getTransactionData(
      nonce.toNumber(),
      functionSignature,
      accounts[1],
      privateKeys[1],
      {
        name: "PablockNotarization",
        version: "0.1.0",
        address: pablockNotarizationInstance.address,
      }
    );

    await metaTransactionInstance.executeMetaTransaction(
      pablockNotarizationInstance.address,
      accounts[1],
      functionSignature,
      r,
      s,
      v,
      { from: accounts[0] }
    );

    const currentBalance = ethers.utils.formatEther(
      (await pablockTokenInstance.balanceOf(accounts[1])).toString()
    );

    expect(currentBalance).equal("3.0");
  });
});
