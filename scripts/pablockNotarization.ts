// @ts-ignore
const fs = require("fs");
const { ethers } = require("ethers");
const PablockNotarizationJSON = require("../artifacts/contracts/pablock/PablockNotarization.sol/PablockNotarization.json");

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

const pablockNotarization = new ethers.Contract(
  "0x537C625E694BE2d85dF0c0dF61C698a7772D1de3", // Mumbai
  PablockNotarizationJSON.abi,
  contractOwner.connect(provider),
);

(async () => {
  // Add contract to whitelist of already deployed PablockToken
  //   const tx = await pablockToken.addContractToWhitelist(contractAddress, 1, 3, {
  //     gasLimit: 300000,
  //     gasPrice: 1000000000,
  //   });
  //   console.log(await tx.wait());
  //   console.log(await pablockToken.getContractStatus(contractAddress));

  // Mint token
  // const tx2 = await pablockToken.requestToken(
  //   "0xcb72d5DA378A41Db60f094658b338fAE07EFDF3c",
  //   100,
  //   { gasPrice: 5000000000, gasLimit: 300000 },
  // );
  // console.log(await tx2.wait());

  // Add Payer
  const tx3 = await pablockNotarization.setPayer(
    "0x3160bc56318310d11FC410F21C8986E559d3380a",
    {
      gasPrice: 5000000000,
      gasLimit: 100000,
    },
  );
  await tx3.wait();

  // console.log((await pablockToken.balanceOf(contractOwner.address)).toString());
})();
