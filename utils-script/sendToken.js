const { ethers } = require("ethers");

const PablockToken = require("../build/contracts/PablockToken.json");

const privateKey = "";
const address = "0x7E3b7eb0677b96eaa80f56a219f8f717c1D3eED6";
const pablockTokenAddress = "";

const polygonProvider = ethers.providers.JsonRpcProvider(
  "http://127.0.0.1:7545"
);
const wallet = new ethers.Wallet(privateKey);
const account = wallet.connect(polygonProvider);

(async () => {
  let pablockToken = new ethers.Contract(
    pablockTokenAddress,
    PablockToken.abi,
    account
  );

  await pablockToken.requestToken(address, 10, {
    gasPrice: 5000000000,
    gasLimit: 150000,
  });

  await account.sendTransaction({
    to: address,
    value: ethers.utils.parseEther("0.02"),
    // value: ethers.utils.parseEther("0.5"),
    gasPrice: 5000000000,
    gasLimit: 150000,
  });
})();
