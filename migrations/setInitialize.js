const { ethers } = require("ethers");
const { readFileSync } = require("fs");

const pablockNFTData = require("../build/contracts/PablockNFT.json");
const pablockTokenData = require("../build/contracts/PablockToken.json");
const pablockMultiSignfactoryData = require("../build/contracts/PablockMultiSignFactory.json");
const pablockMultiSignData = require("../build/contracts/PablockMultiSignNotarization.json");

function loadSecret() {
  const secret = readFileSync(".secret").toString().trim();

  // console.log('Loaded Secret:', secret)
  return secret;
}

(async () => {
  const polygonProvider = new ethers.providers.JsonRpcProvider(
    "https://polygon-mainnet.infura.io/v3/49712e96334c4b22a2aa3d2a4c1224bb"
  );
  //Mainnet
  const ownerWallet = ethers.Wallet.fromMnemonic(
    "topple bracket scissors frame adult begin observe invite doll kid earth behave"
  );

  //Mumbai
  //   const ownerWallet = new ethers.Wallet(
  //     "0xaadb9a97addac5e4910a3b8cdafbba5073cc68f8633a1de64254d23a6b53d3db"
  //   );

  // const wallet = new ethers.Wallet(
  //   "0xe8bf741fada50a9a5d156631c5201c6d2c5dd38e168d246ea3cf1d313d9101bb"
  // );

  const pablockToken = new ethers.Contract(
    // "0xbBE1aFaa82cF378AA124dcD6ab1c2B844F8944B4",
    "0xc1A4EEf2C26C1D757385f396411b8179b02c2B56",
    pablockTokenData.abi,
    ownerWallet.connect(polygonProvider)
  );

  // const pablockNFT = new ethers.Contract(
  //   // "0x006f6207344B65786099150f8e8cE98829785F7B",
  //   "0xb63Dd4d2148CC6CB10eE98D4A63189895d45f101",
  //   pablockNFTData.abi,
  //   wallet.connect(polygonProvider)
  // );

  // let tx = await pablockToken.requestToken(
  //   "0x6b45a8D9e2b7C58D0D52ECe72848Ac2670365ad1",
  //   5
  // );

  // console.log(await tx.wait());

  console.log(
    (
      await pablockToken.balanceOf("0x6b45a8D9e2b7C58D0D52ECe72848Ac2670365ad1")
    ).toString()
  );

  // const logs = await pablockNFT.queryFilter(
  //   pablockNFT.filters.Transfer(null, wallet.address),
  //   15517826,
  //   "latest"
  // );

  // console.log(logs);

  // let tokenIds = [];

  // logs.forEach((log) =>
  //   tokenIds.push(parseInt(log.decode(log.data, log.topics).tokenId.toString()))
  // );
  // console.log(tokenIds);
})();
