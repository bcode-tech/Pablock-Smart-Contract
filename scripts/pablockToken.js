const fs = require("fs");
const { ethers } = require("ethers");

const infuraKey = fs.readFileSync(".infurakey.secret").toString().trim();
const maticMnemonic = fs.readFileSync(".mumbai.secret").toString().trim();

const PablockTokenJSON = require("../build/contracts/PablockToken.json");

const provider = new ethers.providers.JsonRpcProvider(
  `https://polygon-mumbai.infura.io/v3/${infuraKey}`
);

const contractOwner = new ethers.Wallet(maticMnemonic);

const pablockToken = new ethers.Contract(
  "0x9D0d991c90112C2805F250cD7B5D399c5e834088",
  PablockTokenJSON.abi,
  contractOwner.connect(provider)
);

(async () => {
  //Add contract to whitelist of already deployed PablockToken
  let tx = await pablockToken.addContractToWhitelist(
    "0x65Bd5b3F45E00783bFfEe59c90e279b522b147e8"
  );
  console.log(await tx.wait());

  //Mint token
  // let tx2 = await pablockToken.requestToken(
  //   "0xf68ec20B5B40B657A32d17DABBbDf6E4FD1497df",
  //   100,
  //   { gasPrice: 5000000000, gasLimit: 300000 }
  // );
  // console.log(await tx2.wait());

  // console.log((await pablockToken.balanceOf(contractOwner.address)).toString());
})();
