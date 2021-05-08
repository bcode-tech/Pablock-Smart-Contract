const truffleAssert = require("truffle-assertions");

var PablockToken = artifacts.require("./PablockToken.sol");
var PablockNotarization = artifacts.require("./PablockNotarization.sol");

contract("PablockToken", function (accounts) {
  it("should have 3 token", function () {
    return PablockToken.deployed(10000)
      .then(async function (instance) {
        await instance.requestToken(accounts[1], 3);

        return instance.balanceOf(accounts[1]);
      })
      .then(function (balance) {
        assert.equal(balance.toString(), "3", "3 wasn't in the second account");
      });
  });
  // it("should have 2 token", function () {
  //   return PablockToken.deployed(10000)
  //     .then(async function (instance) {
  //       // await instance.requestToken(accounts[1], 3);
  //       console.log("ACCOUNTS ==>", accounts[1]);
  //       await instance.receiveAndBurn(1, accounts[1], { from: accounts[1] });

  //       return instance.balanceOf(accounts[1]);
  //     })
  //     .then(function (balance) {
  //       assert.equal(balance.toString(), "2", "2 wasn't in the second account");
  //     });
  // });
  it("should notarize", function () {
    return PablockNotarization.deployed()
      .then(async function (instance) {
        let pablockToken = await PablockToken.deployed();
        let tx = await instance.notarize(
          "0xb133a0c0e9bee3be20163d2ad31d6248db292aa6dcb1ee087a2aa50e0fc75ae2",
          "QmQHbDKtR6kp48Jzh2VGoC9VATX5QWASXejAg4ZiyhYbaB",
          pablockToken.address,
          { from: accounts[1] }
        );
        return pablockToken.balanceOf(accounts[1]);
      })
      .then(function (balance) {
        assert.equal(balance.toString(), "2", "3 wasn't in the second account");

        // truffleAssert.eventEmitted(result, "TestEvent", (ev) => {
        //   return ev.param1 === 10 && ev.param2 === ev.param3;
        // });
      });
  });
});
