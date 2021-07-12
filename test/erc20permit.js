const { expect, assert } = require("chai");
const { signERC2612Permit } = require("eth-permit");
const Common = require("ethereumjs-common");
const { Transaction } = require("ethereumjs-tx");
const Web3 = require("web3");
const { ethers } = require("ethers");

const web3 = new Web3("http://127.0.0.1:7545");

const CustomERC20 = artifacts.require("./CustomERC20.sol");

const {
  PERMIT_TYPEHASH,
  getPermitDigest,
  getDomainSeparator,
  sign,
} = require("../utility");

// first Buidler default account
const ownerPrivateKey =
  "fc0846a4e1d827c9c7a1fd8f255074d01bb019760a2065e0756b578dde00ecf1";

const deadline = 1657121546000;
const chainId = 1;

contract("ERC20Permit", async (accounts) => {
  it("should set allowance after a permit transaction", async () => {
    const instance = await CustomERC20.deployed();

    const value = 100;

    const approve = {
      owner: accounts[1],
      spender: accounts[0],
      value,
    };

    const nonce = parseInt((await instance.nonces(approve.owner)).toString());

    const digest = getPermitDigest(
      await instance.name(),
      instance.address,
      parseInt((await instance.getChainId()).toString()),
      approve,
      nonce,
      deadline
    );

    // Sign it
    // NOTE: Using web3.eth.sign will hash the message internally again which
    // we do not want, so we're manually signing here
    const { v, r, s } = sign(digest, Buffer.from(ownerPrivateKey, "hex"));

    const receipt = await instance.permit(
      approve.owner,
      approve.spender,
      approve.value,
      deadline,
      v,
      r,
      s
    );

    console.log(receipt);

    // console.log("CHAIN ID ==>", (await instance.getChainId()).toString());
  });
});
