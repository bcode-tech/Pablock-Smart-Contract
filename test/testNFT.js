const truffleAssert = require("truffle-assertions");

const PablockToken = artifacts.require("./PablockToken.sol");
const PablockNFT = artifacts.require("./PablockNFT.sol");

contract("PablockNFT", function (accounts) {
  it("should be possible to mint an NFT", async () => {
    const pablockTokenInstance = await PablockToken.deployed();
    const pablockNFTInstance = await PablockNFT.deployed();

    const numNFTBefore = await pablockNFTInstance.balanceOf(accounts[6]);
    const tokenBalanceBefore = await pablockTokenInstance.balanceOf(
      accounts[6]
    );

    await pablockTokenInstance.requestToken(accounts[6], 10);

    const res = await pablockNFTInstance.generateToken(1, "prova", {
      from: accounts[6],
    });

    const numNFTAfter = await pablockNFTInstance.balanceOf(accounts[6]);
    const tokenBalanceAfter = await pablockTokenInstance.balanceOf(accounts[6]);

    truffleAssert.eventEmitted(res, "TokenGeneration");
    assert.notEqual(numNFTBefore, numNFTAfter, "NFT has not been minted");
    assert.notEqual(
      tokenBalanceBefore,
      tokenBalanceAfter,
      "Pablock token has not been paid"
    );
  });
});
