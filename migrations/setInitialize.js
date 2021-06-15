const { ethers } = require("ethers");
const { readFileSync } = require("fs");
const abiDecoder = require("abi-decoder");

const pablockNFTData = require("../build/contracts/PablockNFT.json");
const pablockTokenData = require("../build/contracts/PablockToken.json");
const pablockMultiSignFactoryData = require("../build/contracts/PablockMultiSignFactory.json");
const pablockMultiSignData = require("../build/contracts/PablockMultiSignNotarization.json");

function loadSecret() {
  const secret = readFileSync(".secret").toString().trim();

  // console.log('Loaded Secret:', secret)
  return secret;
}

(async () => {
  const polygonProvider = new ethers.providers.JsonRpcProvider(
    // "https://polygon-mainnet.infura.io/v3/49712e96334c4b22a2aa3d2a4c1224bb"
    "http://127.0.0.1:7545"
  );
  //Mainnet
  const ownerWallet = ethers.Wallet.fromMnemonic(
    // "topple bracket scissors frame adult begin observe invite doll kid earth behave" //Mainnet
    //     "0xaadb9a97addac5e4910a3b8cdafbba5073cc68f8633a1de64254d23a6b53d3db" //Mumbai
    "exit scorpion place harbor loan loan water body gallery copy tail awful"
  );

  const wallet = new ethers.Wallet(
    "0x89d2e2ea5b578cb3aa2ccbce9452b1454d2458d780a867d3493e4b5ccdbebe01"
  );

  const pablockToken = new ethers.Contract(
    // "0xbBE1aFaa82cF378AA124dcD6ab1c2B844F8944B4", //Mumbai
    // "0x0891c7c2900dd52fE5B0218A896631cc6340786E", //Local
    "0xfb7bADf75ea14F4d28FAac8D46BF867620a47f30",
    // "0xc1A4EEf2C26C1D757385f396411b8179b02c2B56", //Mainnet
    pablockTokenData.abi,
    ownerWallet.connect(polygonProvider)
  );

  const pablockMultiSignNotarizationFactory = new ethers.Contract(
    // "0xf36835D6c58998880fA6A6BCC4f6A3E4a4230B00",
    "0x213272E0e8CfA59245b2E8AAAc52c9B2Ce053464",
    pablockMultiSignFactoryData.abi,
    wallet.connect(polygonProvider)
  );

  // console.log(pablockMultiSignNotarizationFactory);

  // let tx = await pablockToken.requestToken(wallet.address, 5);
  // await tx.wait();

  console.log((await pablockToken.balanceOf(wallet.address)).toString());

  let newContract =
    await pablockMultiSignNotarizationFactory.createNewMultiSignNotarization(
      "0xb133a0c0e9bee3be20163d2ad31d6248db292aa6dcb1ee087a2aa50e0fc75ae2",
      ["0x4981BcdAf579f434665718623AAfb5E4168142cf", ownerWallet.address],
      "prova",
      100000,
      { gasPrice: 5000000000, gasLimit: 100000 }
    );

  let receipt = await newContract.wait();

  console.log(receipt);

  // console.log(
  //   pablockMultiSignNotarizationFactory.interface.parseLog(newReceipt.logs[0])
  // );

  // const logs = await pablockMultiSignNotarizationFactory.queryFilter(
  //   pablockMultiSignNotarizationFactory.filters.NewPablockMultiSignNotarization(),
  //   0,
  //   "latest"
  // );
  // console.log(logs);

  // const pablockMultiSignNotarization = new ethers.Contract(
  //   // "0x0891c7c2900dd52fE5B0218A896631cc6340786E",
  //   receipt.events[0].address,
  //   pablockMultiSignData.abi,
  //   wallet.connect(polygonProvider)
  // );

  // console.log(await pablockMultiSignNotarization.getURI(), {});

  // console.log(logs);

  // logs.forEach((log) =>
  //   console.log(log.decode(log.data, log.topics).tokenId.toString())
  // );
})();
