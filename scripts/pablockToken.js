const currentEnv = process.env.ENV || "LOCAL";

const fs = require("fs");
const {ethers} = require("ethers");

const infuraKey = fs.readFileSync(".infurakey.secret").toString().trim();
const privateKey = fs
  .readFileSync(`.${currentEnv.toLocaleLowerCase()}.secret`)
  .toString()
  .trim();

const PablockTokenJSON = require("../build/contracts/PablockToken.json");

const provider = new ethers.providers.JsonRpcProvider(
  `https://polygon-mumbai.infura.io/v3/${infuraKey}`
  // "http://127.0.0.1:7545"
);

// const contractOwner = new ethers.Wallet(maticMnemonic);
const contractOwner = new ethers.Wallet(privateKey);

const contracts = [
  "0x3FEecd6269D880Fff83bA82ddA90639062377FB3",
  "0xbC7D6EDc1d6c4c80d508b35a0eACB1E59DdE7369",
  "0x176761fc94b8370849B1314e5e0E4A27D766258D",
  "0x1474D0B6AD27Bd0343e2bB23781036282FF8ec90",
];

const pablockToken = new ethers.Contract(
  "0xFDF84B11382343FbCe877277aEC42091F34bA25D", //Mumbai
  PablockTokenJSON.abi,
  contractOwner.connect(provider)
);

(async () => {
  //Add contract to whitelist of already deployed PablockToken
  for (const addr of contracts) {
    let tx = await pablockToken.addContractToWhitelist(addr, 1, 3, {
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
    console.log(await pablockToken.getContractStatus(addr));

    // console.log((await pablockToken.balanceOf(contractOwner.address)).toString());
  }
})();
