const fs = require("fs");
const { ethers, BigNumber } = require("ethers");

const CustomERC20 = artifacts.require("./CustomERC20.sol");
const PablockToken = artifacts.require("./PablockToken.sol");

const { getPermitDigest, sign } = require("../utility");

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
      owner: accounts[2],
      spender: accounts[0],
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
    const { v, r, s } = sign(digest, Buffer.from(privateKeys[2], "hex"));

    await customERC20Instance.requestPermit(
      approve.owner,
      approve.spender,
      approve.value,
      digest,
      v,
      r,
      s,
      { from: accounts[0] }
    );

    let balance = (
      await pablockTokenInstance.balanceOf(accounts[1])
    ).toString();

    assert.equal(balance, "9", "Balances are equals");
  });
});
