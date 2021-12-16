const fs = require("fs");
const { ethers } = require("ethers");

const infuraKey = fs.readFileSync(".infurakey.secret").toString().trim();
const mumbaiSecret = fs.readFileSync(".mumbai.secret").toString().trim();

const PablockTokenJSON = require("../build/contracts/PablockToken.json");

const provider = new ethers.providers.JsonRpcProvider(
  `https://polygon-mumbai.infura.io/v3/${infuraKey}`,
  // "http://127.0.0.1:7545"
);

// const contractOwner = new ethers.Wallet(maticMnemonic);
const contractOwner = new ethers.Wallet(
  // "0x52f6882af2362a0f3b9efc67e2521b6a698283e88ebb5428285168ea303fd15b", //LOCAL
  // mumbaiSecret, // MUMBAI
  maticSecret,
);

const contractAddress = "0x2c7A6BF1CbDa1BFffB3573e45AE836eEcC6bcf5F";

const pablockToken = new ethers.Contract(
  "0x70b2b8c820d62e7bd95e296dcb8de6a18ad2bca5", // Mumbai
  // "0x2b9233683001657161db866c7405493Fc1d1C22d", //Local Legacy
  // "0x2F73D51b8813775D8CFB2a7147b516CB01EEb4C2", //LOCAL Permit enabled
  PablockTokenJSON.abi,
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
  const tx2 = await pablockToken.requestToken(
    "0xcb72d5DA378A41Db60f094658b338fAE07EFDF3c",
    100,
    { gasPrice: 5000000000, gasLimit: 300000 },
  );
  console.log(await tx2.wait());

  // console.log((await pablockToken.balanceOf(contractOwner.address)).toString());
})();
