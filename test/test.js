const truffleAssert = require("truffle-assertions");

const PablockToken = artifacts.require("./PablockToken.sol");
const PablockMultiSignFactory = artifacts.require(
  "./PablockMultiSignFactory.sol"
);
const PablockNotarization = artifacts.require("./PablockNotarization.sol");
const PablockNFT = artifacts.require("./PablockNFT.sol");

// var PablockMultiSign = artifacts.require("./PablockMultiSignNotarization.sol");

contract("PablockToken", function (accounts) {
  it("should have 3 token", async () => {
    const instance = await PablockToken.deployed();

    const balanceBefore = await instance.balanceOf(accounts[1]);

    await instance.requestToken(accounts[1], 3);

    const balanceAfter = await instance.balanceOf(accounts[1]);

    assert.equal(balanceAfter.toNumber(), 3, "Balance has not been increased");
  });

  it("should notarize", async () => {
    const notarizationInstance = await PablockNotarization.deployed();
    const tokenInstance = await PablockToken.deployed();

    let tx = await notarizationInstance.notarize(
      "0xb133a0c0e9bee3be20163d2ad31d6248db292aa6dcb1ee087a2aa50e0fc75ae2",
      "QmQHbDKtR6kp48Jzh2VGoC9VATX5QWASXejAg4ZiyhYbaB",
      { from: accounts[1] }
    );

    truffleAssert.eventEmitted(tx, "Notarize");

    const balanceAfter = await tokenInstance.balanceOf(accounts[1]);

    assert.equal(balanceAfter.toNumber(), 2, "Token has not been burnt");
  });

  it("should be able to create a MultiSignature Contract", async () => {
    const multisignatureFactoryInstance =
      await PablockMultiSignFactory.deployed();
    try {
      let res =
        await multisignatureFactoryInstance.createNewMultiSignNotarization(
          "0xb133a0c0e9bee3be20163d2ad31d6248db292aa6dcb1ee087a2aa50e0fc75ae2",
          [accounts[2]],
          "prova",
          100000,
          { from: accounts[1] }
        );

      let multisignatureAddress = null;
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
    const multisignatureFactoryInstance =
      await PablockMultiSignFactory.deployed();
    let multisignatureAddress = null;
    let error = null;

    let res = await multisignatureFactoryInstance
      .createNewMultiSignNotarization(
        "0xb133a0c0e9bee3be20163d2ad31d6248db292aa6dcb1ee087a2aa50e0fc75ae2",
        [accounts[2]],
        "prova",
        100000,
        { from: accounts[1] }
      )
      .catch((e) => {
        error = e;
      });

    if (res) {
      truffleAssert.eventNotEmitted(
        res,
        "NewPablockMultiSignNotarization",
        (ev) => {
          multisignatureAddress = ev.multiSignAddress;
          return ev.multiSignAddress;
        }
      );
    }

    assert.equal(
      multisignatureAddress,
      null,
      "Multisignature contract has been createn even without paying tokens"
    );
  });
});
