const truffleAssert = require("truffle-assertions");

const PablockToken = artifacts.require("./PablockToken.sol");
const PablockNFT = artifacts.require("./PablockNFT.sol");

const INDEX = 6;
let tokenId = null;

contract("PablockNFT", function (accounts) {
  it("should be possible to mint an NFT", async () => {
    const pablockTokenInstance = await PablockToken.deployed();
    const pablockNFTInstance = await PablockNFT.deployed();

    const numNFTBefore = await pablockNFTInstance.balanceOf(accounts[INDEX]);
    const tokenBalanceBefore = await pablockTokenInstance.balanceOf(
      accounts[INDEX]
    );

    await pablockTokenInstance.requestToken(accounts[INDEX], 10);

    const res = await pablockNFTInstance.generateToken(1, "prova", {
      from: accounts[INDEX],
    });

    const numNFTAfter = await pablockNFTInstance.balanceOf(accounts[INDEX]);
    const tokenBalanceAfter = await pablockTokenInstance.balanceOf(
      accounts[INDEX]
    );

    truffleAssert.eventEmitted(res, "TokenGeneration");
    assert.notEqual(numNFTBefore, numNFTAfter, "NFT has not been minted");
    assert.notEqual(
      tokenBalanceBefore,
      tokenBalanceAfter,
      "Pablock token has not been paid"
    );
  });
  it("should be possible to transfer an NFT", async () => {
    const pablockNFTInstance = await PablockNFT.deployed();

    const tokenId = await pablockNFTInstance.tokenOfOwnerByIndex(
      accounts[INDEX],
      0
    );

    const res = await pablockNFTInstance.transferFrom(
      accounts[INDEX],
      accounts[INDEX + 1],
      tokenId,
      { from: accounts[INDEX] }
    );

    const recipientBalance = await pablockNFTInstance.balanceOf(
      accounts[INDEX + 1]
    );

    assert.equal(recipientBalance.toNumber(), 1, "NFT has not been transfered");
  });
});
