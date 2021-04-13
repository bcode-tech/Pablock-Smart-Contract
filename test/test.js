// Import the contract
const PablockGSN = artifacts.require("PablockGSN");
const PablockToken = artifacts.require("PablockToken");

// Entry point for tests
// Accounts variable is an array with
// all the ethereum accounts that have been generated
// for test purposes
contract("PablockToken", (accounts) => {
  // Single test
  // 1st parameter: test name
  // 2nd parameter: testing function
  it("very", async () => {
    // Get the contract instance
    // basically the same as
    // web3.eth.contract(contractAbi).at(contractAddress)
    // but wrapped in a container that uses promises
    // instead of callbacks (like ethersjs)
    const pablockGSN = await PablockToken.deployed();
    const pablockToken = await PablockToken.deployed(10000);
    // await testInstance.mint({ from: accounts[1] });

    let balance1 = await pablockGSN.balanceOf(accounts[1]);

    // assert.equal(balance1.valueOf(), 10000, "10 wasn't in the second account");

    // await testInstance.transfer(accounts[0], 10000, { from: accounts[1] });

    let balance0 = await pablockGSN.balanceOf(accounts[0]);

    // assert.equal(balance0.valueOf(), 20000, "10 wasn't in the first account");

    await pablockToken.requestToken(accounts[1]);

    let pablockBalance = await pablockToken.balanceOf(accounts[1]);

    console.log(
      // balance0.toString(),
      // balance1.toString(),
      pablockBalance.toString()
    );
    // console.log(ethBalance0.toString(), ethBalance1.toString());

    // assert.equal(0, 0, "EVERYTHING ok");
  });
});
