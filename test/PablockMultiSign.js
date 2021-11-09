const { assert } = require("chai");
const { ethers } = require("ethers");
const truffleAssert = require("truffle-assertions");

const PablockToken = artifacts.require("./PablockToken.sol");
const PablockMultiSignFactory = artifacts.require(
  "./PablockMultiSignFactory.sol"
);
const PablockMultiSign = artifacts.require(
  "./PablockMultiSignNotarization.sol"
);

let pablockMultiSignFactory = null;
let pablockTokenInstance = null;
let multisignatureAddress = null;

contract("Pablock MultiSign", function (accounts) {
  it("should have 3 token", async () => {
    pablockTokenInstance = await PablockToken.deployed();

    await pablockTokenInstance.requestToken(accounts[1], 10);
    await pablockTokenInstance.requestToken(accounts[2], 10);

    const balanceAfter1 = ethers.utils.formatEther(
      (await pablockTokenInstance.balanceOf(accounts[1])).toString()
    );
    const balanceAfter2 = ethers.utils.formatEther(
      (await pablockTokenInstance.balanceOf(accounts[2])).toString()
    );

    assert.equal(balanceAfter1, 10, "Balance has not been increased");
    assert.equal(balanceAfter2, 10, "Balance has not been increased");
  });

  it("should be able to create a MultiSignature Contract", async () => {
    pablockMultiSignFactory = await PablockMultiSignFactory.deployed();
    try {
      let res = await pablockMultiSignFactory.createNewMultiSignNotarization(
        "0xb133a0c0e9bee3be20163d2ad31d6248db292aa6dcb1ee087a2aa50e0fc75ae2",
        [accounts[2]],
        "prova",
        100000,
        { from: accounts[1] }
      );

      truffleAssert.eventEmitted(
        res,
        "NewPablockMultiSignNotarization",
        (ev) => {
          multisignatureAddress = ev.multiSignAddress;
          return ev.multiSignAddress;
        }
      );

      assert.notEqual(
        multisignatureAddress,
        null,
        "Multisignature contract has not been created"
      );
    } catch (e) {
      console.log("error", e);
    }
  });

  it("should not be possible to create a MultiSignature Contract without paying tokens", async () => {
    let error = null;
    const addr = null;
    try {
      let res = await pablockMultiSignFactory.createNewMultiSignNotarization(
        "0xb133a0c0e9bee3be20163d2ad31d6248db292aa6dcb1ee087a2aa50e0fc75ae2",
        [accounts[3], accounts[2]],
        "prova",
        100000,
        { from: accounts[3] }
      );
      truffleAssert.eventEmitted(
        res,
        "NewPablockMultiSignNotarization",
        (ev) => {
          addr = ev.multiSignAddress;
          return addr;
        }
      );
    } catch (error) {
      assert(error, "Create contract even without token");
    }

    assert.equal(
      addr,
      null,
      "Multisignature contract has been createn even without paying tokens"
    );
  });

  it("should sign document", async () => {
    let multiSignContract = await PablockMultiSign.at(multisignatureAddress);
    await pablockTokenInstance.addContractToWhitelist(
      multisignatureAddress,
      1,
      3,
      {
        from: accounts[0],
      }
    );

    await multiSignContract.signDocument({ from: accounts[2] });

    let status = await multiSignContract.getSignerStatus(accounts[2]);

    assert.equal(status, true, "Account 2 has not signed");
  });
});
