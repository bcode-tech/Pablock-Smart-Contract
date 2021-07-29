const fs = require("fs");
const { ethers, BigNumber } = require("ethers");

const PablockToken = artifacts.require("./PablockToken.sol");
const CustomERC20 = artifacts.require("./CustomERC20.sol");

contract("ERC20Permit", async (accounts) => {
  it("should mint token", async () => {
    const pablockTokenInstance = await PablockToken.deployed();
    const customERC20Instance = await CustomERC20.deployed();

    await pablockTokenInstance.requestToken(accounts[1], 10);
    await pablockTokenInstance.addContractToWhitelist(
      customERC20Instance.address
    );

    await customERC20Instance.mint(accounts[2], 10);

    let balance = (
      await pablockTokenInstance.balanceOf(accounts[1])
    ).toString();

    assert.equal(parseInt(balance), 9, "Pablock token was spent correctly");
  });
});
