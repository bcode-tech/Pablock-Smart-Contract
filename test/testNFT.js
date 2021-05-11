var PablockToken = artifacts.require("./PablockToken.sol");
var PablockNFT = artifacts.require("./PablockNFT.sol");

contract("PablockToken", function (accounts) {
  it("should have 3 token", function () {
    return PablockToken.deployed(10000)
      .then(async function (instance) {
        await instance.requestToken(accounts[1], 3);

        await PablockNFT.deployed().then(async (instance) => {
          let index = await instance.generateToken("Prova", "PRV", 1, "prova", {
            from: accounts[1],
          });
        });

        return instance.balanceOf(accounts[1]);
      })
      .then(function (balance) {
        assert.equal(balance.toString(), "2", "3 wasn't in the second account");
      });
  });
});
