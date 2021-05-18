var PablockToken = artifacts.require("./PablockToken.sol");
var PablockNFT = artifacts.require("./PablockNFT721.sol");

contract("PablockToken", function (accounts) {
  it("should have 3 token", function () {
    return PablockToken.deployed(10000)
      .then(async function (instance) {
        await instance.requestToken(accounts[0], 3);

        return await PablockNFT.deployed().then(async (instance) => {
          await instance.generateToken("Prova", "PRV", 1, "prova", {
            from: accounts[0],
          });

          console.log(await instance.uri(0));
          return instance.balanceOf(accounts[0], 0);
        });
      })
      .then(function (balance) {
        assert.equal(balance.toString(), "1", "3 wasn't in the second account");
      });
  });
});
