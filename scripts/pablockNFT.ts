// @ts-ignore
const fs = require("fs");
const { ethers } = require("ethers");
const PablockNotarizationJSON = require("../artifacts/contracts/pablock/PablockNFT.sol/PablockNFT.json");

const infuraKey = fs.readFileSync(".infurakey.secret").toString().trim();
const mumbaiSecret = fs.readFileSync(".mumbai.secret").toString().trim();
// const maticSecret = fs.readFileSync(".matic.secret").toString().trim();

const provider = new ethers.providers.JsonRpcProvider(
  `https://polygon-mumbai.infura.io/v3/${infuraKey}`,
  // "http://127.0.0.1:7545"
);

// const contractOwner = new ethers.Wallet(maticMnemonic);
const contractOwner = new ethers.Wallet(
  // "0x52f6882af2362a0f3b9efc67e2521b6a698283e88ebb5428285168ea303fd15b", //LOCAL
  mumbaiSecret, // MUMBAI
);

// const contractAddress = "0x2c7A6BF1CbDa1BFffB3573e45AE836eEcC6bcf5F";

const pablockNFT = new ethers.Contract(
  "0xfF8014328c7a9d699BCE98b2Ff9ACB94818046A5", // Mumbai
  PablockNotarizationJSON.abi,
  contractOwner.connect(provider),
);

(async () => {
  // Add contract to whitelist of already deployed PablockToken
  const tx = await pablockNFT.initialize(
    "0x4D47A9694389B1E42403FC5152E68d8D27803b14",
    { gasPrice: 5000000000, gasLimit: 2000000 },
  );

  console.log(await tx.wait());
})();
