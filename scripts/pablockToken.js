const fs = require("fs");
const { ethers } = require("ethers");

const infuraKey = fs.readFileSync(".infurakey.secret").toString().trim();
const maticMnemonic = fs.readFileSync(".mumbai.secret").toString().trim();

const PablockTokenJSON = require("../build/contracts/PablockToken.json");

const provider = new ethers.providers.JsonRpcProvider(
  // `https://polygon-mumbai.infura.io/v3/${infuraKey}`
  "http://127.0.0.1:7545"
);

// const contractOwner = new ethers.Wallet(maticMnemonic);
const contractOwner = new ethers.Wallet(
  "0x52f6882af2362a0f3b9efc67e2521b6a698283e88ebb5428285168ea303fd15b"
);

const contractAddress = "0x8Dc4E4CBd83e5939EF82f6e2347b7476206610f3";

const pablockToken = new ethers.Contract(
  // "0x9D0d991c90112C2805F250cD7B5D399c5e834088", //Mumbai
  // "0x2b9233683001657161db866c7405493Fc1d1C22d", //Local Legacy
  "0x2F73D51b8813775D8CFB2a7147b516CB01EEb4C2", //LOCAL Permit enabled
  PablockTokenJSON.abi,
  contractOwner.connect(provider)
);

(async () => {
  //Add contract to whitelist of already deployed PablockToken
  let tx = await pablockToken.addContractToWhitelist(contractAddress, {
    gasLimit: 50000,
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
