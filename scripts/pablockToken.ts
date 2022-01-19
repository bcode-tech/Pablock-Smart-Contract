const fs = require("fs");
const { ethers } = require("ethers");
const PablockTokenJSON = require("../artifacts/contracts/PablockToken.sol/PablockToken.json");

const infuraKey = fs.readFileSync(".infurakey.secret").toString().trim();
const mumbaiSecret = fs.readFileSync(".mumbai.secret").toString().trim();
const maticSecret = fs.readFileSync(".matic.secret").toString().trim();

const provider = new ethers.providers.JsonRpcProvider(
  // `https://polygon-mainnet.infura.io/v3/${infuraKey}`,
  "https://polygon-mumbai.g.alchemy.com/v2/erULaYO44vemYJ5PyiWPGSpt_cbDQMbi",
  // "http://127.0.0.1:7545",
);

// const contractOwner = new ethers.Wallet(maticMnemonic);
const contractOwner = new ethers.Wallet(
  // "0x52f6882af2362a0f3b9efc67e2521b6a698283e88ebb5428285168ea303fd15b", //LOCAL
  mumbaiSecret, // MUMBAI
  // maticSecret,
  // "0xf1fa270cdd472bc777ae728c98a0dd5603f2936f015545c39c88842df10a1c00",
);

const contractAddress = "0x29b93cF5d9B3Eb2811da49157d2aF75CE2F5ccA7";

const pablockToken = new ethers.Contract(
  "0x4D47A9694389B1E42403FC5152E68d8D27803b14", // Mumbai
  // "0x284a7eF2ADD52890980E0173469FDE45d172bABD", // Mainnet
  // "0x9e0296fDfaB97c428507e36f077177EbDC4e5Faf", // Local
  PablockTokenJSON.abi,
  contractOwner.connect(provider),
);

(async () => {
  // Add contract to whitelist of already deployed PablockToken
  // const tx = await pablockToken.addContractToWhitelist(contractAddress, 1, 1, {
  //   gasLimit: 300000,
  //   gasPrice: 60000000000,
  // });
  // console.log(await tx.wait());
  // console.log(await pablockToken.getContractStatus(contractAddress));
  console.log(contractOwner.address);

  // Mint token
  const tx2 = await pablockToken.requestToken(
    "0x127A707A5aA9a149981b7C146500F375734154f6",
    10,
    { gasPrice: 50000000000, gasLimit: 300000 },
  );
  console.log(await tx2.wait());

  // await contractOwner.sendTransaction({
  //   to: "0xc3A4Bf664C883a515eEA9e0D87C58B601283B41d",
  //   value: ethers.utils.parseEther("0.2"),
  //   gasPrice: 300000000000,
  //   gasLimit: 150000,
  // });

  // Add Payer
  // const tx3 = await pablockToken.setPayer(
  //   "0x3160bc56318310d11FC410F21C8986E559d3380a",
  //   {
  //     gasPrice: 5000000000,
  //     gasLimit: 100000,
  //   },
  // );
  // await tx3.wait();
})();
