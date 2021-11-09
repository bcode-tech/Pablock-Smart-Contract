const { assert } = require("chai");
const truffleAssert = require("truffle-assertions");

const PablockToken = artifacts.require("./PablockToken.sol");
const PablockNFT = artifacts.require("./PablockNFT.sol");

const INDEX = 1;

let tokenId = null;

let pablockNFTInstance = null;
let pablockTokenInstance = null;

contract("PablockNFT", function (accounts) {
  it("should not mint an NFT", async () => {
    pablockTokenInstance = await PablockToken.deployed();
    pablockNFTInstance = await PablockNFT.deployed();

    try {
      const res = await pablockNFTInstance.mintToken(
        accounts[INDEX],
        1,
        "prova",
        {
          from: accounts[INDEX],
        }
      );
    } catch (error) {
      assert(error, "Expected an error but did not get one");
    }
  });
  it("should be possible to mint an NFT", async () => {
    const numNFTBefore = await pablockNFTInstance.balanceOf(accounts[INDEX]);
    const tokenBalanceBefore = await pablockTokenInstance.balanceOf(
      accounts[INDEX]
    );

    await pablockTokenInstance.requestToken(accounts[INDEX], 10);

    const res = await pablockNFTInstance.mintToken(
      accounts[INDEX],
      1,
      "prova",
      {
        from: accounts[INDEX],
      }
    );

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
  it("should unlock token", async () => {
    tokenId = await pablockNFTInstance.tokenOfOwnerByIndex(accounts[INDEX], 0);

    const res = await pablockNFTInstance.unlockToken(tokenId, {
      from: accounts[INDEX],
    });
    const isUnlocked = await pablockNFTInstance.isUnlocked(tokenId);

    assert.equal(isUnlocked, true, "NFT os unlocked");
  });
  it("should be possible to transfer an NFT", async () => {
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
