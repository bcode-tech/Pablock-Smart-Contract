const { ethers } = require("ethers");
const { range } = require("lodash");

const pablockNFTData = require("../build/contracts/PablockNFT.json");
const pablockTokenData = require("../build/contracts/PablockToken.json");

const PRIVATE_KEY =
  "0x7c365fb812d9bdc928df13cbe9779794b8ae01c794fc4f7cf9ed402c6f986107";
const RECEIVER = "0x1969a974699d717c6B084eBD5dDA2E8773b2BEAE";

(async () => {
  const polygonProvider = new ethers.providers.JsonRpcProvider(
    "https://polygon-mumbai.infura.io/v3/49712e96334c4b22a2aa3d2a4c1224bb"
    // "http://127.0.0.1:7545"
  );

  const ownerWallet = new ethers.Wallet(
    "0xaadb9a97addac5e4910a3b8cdafbba5073cc68f8633a1de64254d23a6b53d3db" //Mumbai
  );

  // const ownerWallet = ethers.Wallet.fromMnemonic(
  // "divide west journey supply number poem loud surprise genuine verb warfare resemble"
  // );

  const wallet = new ethers.Wallet(PRIVATE_KEY);

  const pablockToken = new ethers.Contract(
    "0xbBE1aFaa82cF378AA124dcD6ab1c2B844F8944B4", //Mumbai
    // "0xAdEB4cEA8E4A28E2C6f83d1820DAB686929Fbf9A",
    pablockTokenData.abi,
    ownerWallet.connect(polygonProvider)
  );

  // let tx = await pablockToken.addContractToWhitelist(
  //   "0x2C6ED63706fe6AB797B1fE03122b016c3602d9b0",
  //   {
  //     // gasPrice: 5000000000,
  //     gasLimit: 600000,
  //   }
  // );

  // console.log(tx);

  // console.log(await pablockToken.getVersion());

  // const pablockNFT = new ethers.Contract(
  //   "0xb63Dd4d2148CC6CB10eE98D4A63189895d45f101",
  //   // "0xCCC684EF47B4de5142383ED353d083DcdDE007ec",
  //   pablockNFTData.abi,
  //   wallet.connect(polygonProvider)
  // );

  //   console.log((await pablockToken.balanceOf(wallet.address)).toString());

  //   let balance = parseInt(
  //     (await pablockNFT.balanceOf(wallet.address)).toString()
  //   );

  //   console.log(balance);

  //   for (const i of range(balance)) {
  //     const token = (
  //       await pablockNFT.tokenOfOwnerByIndex(wallet.address, i)
  //     ).toString();
  //     console.log(token);
  //   }

  //   let tx = await pablockNFT.approve(wallet.address, 1, {
  //     gasPrice: 5000000000,
  //     gasLimit: 300000,
  //   });

  //   console.log(await tx.wait());

  //   console.log(await pablockNFT.ownerOf(0), wallet.address);

  // let tx2 = await pablockNFT.transferNFT(wallet.address, RECEIVER, 49, {
  //   gasPrice: 5000000000,
  //   //   gasLimit: 3000000,
  // });

  // console.log(await tx2.wait());

  let tx = await pablockToken.requestToken(
    "0xC76618D3bAC95770BC02187ef2E22c6Fe602B86c",
    25
    // { gasPrice: 5000000000, gasLimit: 100000 }
  );
  await tx.wait();
})();
