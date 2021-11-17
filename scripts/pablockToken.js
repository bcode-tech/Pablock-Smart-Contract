const fs = require("fs");
const { ethers } = require("ethers");

const infuraKey = fs.readFileSync(".infurakey.secret").toString().trim();
const maticMnemonic = fs.readFileSync(".mumbai.secret").toString().trim();

const PablockTokenJSON = require("../build/contracts/PablockToken.json");

const provider = new ethers.providers.JsonRpcProvider(
  `https://polygon-mumbai.infura.io/v3/${infuraKey}`
  // "http://127.0.0.1:7545"
);

// const contractOwner = new ethers.Wallet(maticMnemonic);
const contractOwner = new ethers.Wallet(
  // "0x52f6882af2362a0f3b9efc67e2521b6a698283e88ebb5428285168ea303fd15b", //LOCAL
  "0xe8bf741fada50a9a5d156631c5201c6d2c5dd38e168d246ea3cf1d313d9101bb" //MUMBAI
);

const contractAddress = "0x22D1389a75F6B038ea076125B8774545aC697551";

const pablockToken = new ethers.Contract(
  "0xa723fc1E105923a98a7FbdB8040296C8f118d883", //Mumbai
  // "0x2b9233683001657161db866c7405493Fc1d1C22d", //Local Legacy
  // "0x2F73D51b8813775D8CFB2a7147b516CB01EEb4C2", //LOCAL Permit enabled
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
