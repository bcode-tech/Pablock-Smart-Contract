const { ethers } = require("ethers");
const { readFileSync } = require("fs");
const abiDecoder = require("abi-decoder");

const pablockNFTData = require("../build/contracts/PablockNFT.json");
const pablockTokenData = require("../build/contracts/PablockToken.json");
const pablockMultiSignFactoryData = require("../build/contracts/PablockMultiSignFactory.json");
const pablockMultiSignData = require("../build/contracts/PablockMultiSignNotarization.json");
const customERC20Data = require("../build/contracts/CustomERC20.json");

function loadSecret() {
  const secret = readFileSync(".secret").toString().trim();

  // console.log('Loaded Secret:', secret)
  return secret;
}

(async () => {
  const polygonProvider = new ethers.providers.JsonRpcProvider(
    "https://polygon-mumbai.infura.io/v3/49712e96334c4b22a2aa3d2a4c1224bb"
    // "http://127.0.0.1:7545"
  );
  //Mainnet
  const pablockWallet = new ethers.Wallet(
    // "topple bracket scissors frame adult begin observe invite doll kid earth behave" //Mainnet
    // "0xaadb9a97addac5e4910a3b8cdafbba5073cc68f8633a1de64254d23a6b53d3db" //Mumbai
    "0x4a233a438a7a26729b1c578d2c4832af4906d56fdcdb93e1f3e49326862ec528"
    // "divide west journey supply number poem loud surprise genuine verb warfare resemble"
  );

  // await pablockWallet.connect(polygonProvider).sendTransaction({
  //   to: "0xd0c1fc15Ab9160345A03091834C6b45280Bc6392",
  //   value: ethers.utils.parseEther("2"),
  //   gasPrice: 5000000000,
  //   gasLimit: 150000,
  // });

  const pablockToken = new ethers.Contract(
    // "0xbBE1aFaa82cF378AA124dcD6ab1c2B844F8944B4", //Mumbai
    "0x3cb9aF9F735dA855306781462Eb6D32458650e55",
    // "0x2b9233683001657161db866c7405493Fc1d1C22d", //Local
    // "0xfb7bADf75ea14F4d28FAac8D46BF867620a47f30",
    // "0xc1A4EEf2C26C1D757385f396411b8179b02c2B56", //Mainnet
    pablockTokenData.abi,
    pablockWallet.connect(polygonProvider)
  );
  let tx = await pablockToken.addContractToWhitelist(
    "0x8f69F7E01F89C303Ef2075EF5b36272bAc291923",
    { gasPrice: 5000000000, gasLimit: 5000000 }
  );
  console.log(tx);
  console.log(await tx.wait());

  // const pablockMultiSignNotarizationFactory = new ethers.Contract(
  //   // "0xf36835D6c58998880fA6A6BCC4f6A3E4a4230B00",
  //   "0x213272E0e8CfA59245b2E8AAAc52c9B2Ce053464",
  //   pablockMultiSignFactoryData.abi,
  //   wallet.connect(polygonProvider)
  // );

  // if ((await pablockToken.balanceOf(wallet.address)).toString() === "0") {
  // let tx = await pablockToken.requestToken(
  //   "0xd0c1fc15Ab9160345A03091834C6b45280Bc6392",
  //   25,
  //   { gasLimit: 100000 }
  // );
  // let tx2 = await pablockToken.requestToken(
  //   "0xf68ec20B5B40B657A32d17DABBbDf6E4FD1497df",
  //   25,
  //   { gasLimit: 100000 }
  // );
  // await tx.wait();
  // }

  // let newContract =
  //   await pablockMultiSignNotarizationFactory.createNewMultiSignNotarization(
  //     "0xb133a0c0e9bee3be20163d2ad31d6248db292aa6dcb1ee087a2aa50e0fc75ae2",
  //     ["0x4981BcdAf579f434665718623AAfb5E4168142cf", ownerWallet.address],
  //     "prova",
  //     100000
  //     // { gasPrice: 5000000000, gasLimit: 100000 }
  //   );

  // let receipt = await newContract.wait();

  // console.log(receipt);

  // console.log(await contract.getURI());

  // const abiCoder = ethers.utils.defaultAbiCoder;

  // const logs = await pablockMultiSignNotarizationFactory.queryFilter(
  //   pablockMultiSignNotarizationFactory.filters.NewPablockMultiSignNotarization(
  //     null
  //   )
  // );
  // console.log(receipt.logs);

  // const abiEncoded = abiCoder.decode(["address"], receipt.logs[1].data);

  // console.log(abiEncoded);

  // const pablockMultiSignNotarization = new ethers.Contract(
  //   // "0x0891c7c2900dd52fE5B0218A896631cc6340786E",
  //   receipt.events[0].address,
  //   pablockMultiSignData.abi,
  //   wallet.connect(polygonProvider)
  // );

  // console.log(await pablockMultiSignNotarization.getURI(), {});

  // console.log(logs);

  // logs.forEach((log) => console.log(log.decode(log.data, log.topics)));
})();
