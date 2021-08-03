const fs = require("fs");
const { ethers, BigNumber } = require("ethers");

const CustomERC20 = artifacts.require("./CustomERC20.sol");
const PablockToken = artifacts.require("./PablockToken.sol");

const { getPermitDigest, getTransferDigest, sign } = require("../utility");

const privateKeys = [
  "52f6882af2362a0f3b9efc67e2521b6a698283e88ebb5428285168ea303fd15b",
  "fc0846a4e1d827c9c7a1fd8f255074d01bb019760a2065e0756b578dde00ecf1",
  "cac55b77a9a055839272436dba5c38aa9ed18b052330c9a3bf426848ccfcd4fc",
];

const deadline = 1657121546000;

contract("ERC20Permit", async (accounts) => {
  it("should set allowance after a permit transaction", async () => {
    const pablockTokenInstance = await PablockToken.deployed();
    const customERC20Instance = await CustomERC20.deployed();

    await pablockTokenInstance.requestToken(accounts[1], 10);
    await pablockTokenInstance.addContractToWhitelist(
      customERC20Instance.address
    );

    const value = 100;

    const approve = {
      owner: accounts[1],
      spender: accounts[2],
      value,
    };

    const nonce = parseInt(
      (await customERC20Instance.getNonces(approve.owner)).toString()
    );

    const digest = getPermitDigest(
      await customERC20Instance.name(),
      customERC20Instance.address,
      parseInt((await customERC20Instance.getChainId()).toString()),
      approve,
      nonce,
      deadline
    );

    // Sign it
    // NOTE: Using web3.eth.sign will hash the message internally again which
    // we do not want, so we're manually signing here
    const { v, r, s } = sign(digest, Buffer.from(privateKeys[1], "hex"));

    await customERC20Instance.requestPermit(
      approve.owner,
      approve.spender,
      approve.value,
      deadline,
      v,
      r,
      s,
      { from: accounts[0] }
    );

    let allowance = (
      await customERC20Instance.allowance(accounts[1], accounts[2])
    ).toString();

    assert.equal(allowance, "100", "Allowance is set at 100");
  });
  it("Should transfer token", async function () {
    const customERC20Instance = await CustomERC20.deployed();

    await customERC20Instance.mint(accounts[1], 1000);

    let balance = (await customERC20Instance.balanceOf(accounts[1])).toString();

    assert.equal(balance, "1000", "1000 token minted");
  });
  it("should allow transfer", async () => {
    const pablockTokenInstance = await PablockToken.deployed();
    const customERC20Instance = await CustomERC20.deployed();

    //Transfer from accounts[2] to accounts[1] after accounts[2] give permit to accounts[1] to spend his tokens
    const transfer = {
      from: accounts[1],
      to: accounts[2],
      amount: 10,
    };

    const nonce = parseInt(
      (await customERC20Instance.getNonces(accounts[2])).toString()
    );

    const digest = getTransferDigest(
      await customERC20Instance.name(),
      customERC20Instance.address,
      parseInt((await customERC20Instance.getChainId()).toString()),
      transfer,
      nonce
    );

    const { v, r, s } = sign(digest, Buffer.from(privateKeys[2], "hex"));

    await customERC20Instance.transferToken(
      transfer.from,
      transfer.to,
      accounts[2],
      transfer.amount,
      v,
      r,
      s
    );
    let balance = (await customERC20Instance.balanceOf(accounts[2])).toString();

    console.log("BALANCE ==>", balance);
    assert.equal(balance, "10", "transfer 100 token");
  });
});
