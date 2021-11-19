const currentEnv = process.env.ENV || "LOCAL";

const fs = require("fs");
const { ethers } = require("ethers");

const infuraKey = fs.readFileSync(".infurakey.secret").toString().trim();
const privateKey = fs.readFileSync(`.${currentEnv}.secret`).toString().trim();

const PablockTokenJSON = require("../build/contracts/PablockToken.json");

const provider = new ethers.providers.JsonRpcProvider(
  `https://polygon-mumbai.infura.io/v3/${infuraKey}`
  // "http://127.0.0.1:7545"
);

// const contractOwner = new ethers.Wallet(maticMnemonic);
const contractOwner = new ethers.Wallet(privateKey);

const contractAddress = "0x22D1389a75F6B038ea076125B8774545aC697551";

const pablockToken = new ethers.Contract(
  "0xa723fc1E105923a98a7FbdB8040296C8f118d883", //Mumbai
  PablockTokenJSON.abi,
  contractOwner.connect(provider)
);

(async () => {
  //Add contract to whitelist of already deployed PablockToken
  let tx = await pablockToken.addContractToWhitelist(contractAddress, 1, 3, {
    gasLimit: 300000,
    gasPrice: 1000000000,
  });
  console.log(await tx.wait());

  //Mint token
  // let tx2 = await pablockToken.requestToken(
  //   "0x2b61353f31063D007F13eF207cc0cF412648FDF6",
  //   5,
  //   { gasPrice: 5000000000, gasLimit: 300000 }
  // );
  // console.log(await tx2.wait());

  //Contract status
  console.log(await pablockToken.getContractStatus(contractAddress));

  // console.log((await pablockToken.balanceOf(contractOwner.address)).toString());
})();
