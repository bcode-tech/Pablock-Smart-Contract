const { ethers } = require("ethers");
const { readFileSync } = require("fs");

const pablockTokenData = require("../build/contracts/PablockToken.json");
const pablockMultiSignFactoryData = require("../build/contracts/PablockMultiSignFactory.json");
const pablockMultiSignData = require("../build/contracts/PablockMultiSignNotarization.json");

function loadSecret(filename, log = false) {
  const secret = readFileSync(filename).toString().trim();
  log && console.log("Loaded Secret:", secret);
  return secret;
}

function accountByIndex(
  mnemonic,
  index = 0,
  providerURL = "http://127.0.0.1:7545"
) {
  const provider = new ethers.providers.JsonRpcProvider(providerURL);
  const wallet = ethers.Wallet.fromMnemonic(
    mnemonic,
    `m/44'/60'/0'/0/${index}`
  );
  const account = wallet.connect(provider);

  return account;
}

(async () => {
  // const infuraKey = loadSecret(".infurakey.secret");
  // const polygonProvider = new ethers.providers.JsonRpcProvider(
  //   `https://polygon-mainnet.infura.io/v3/${infuraKey}`
  // );

  //   const mnemonic = loadSecret(".mumbai.secret");
  const mnemonic =
    "divide west journey supply number poem loud surprise genuine verb warfare resemble";
  const ownerAccount = accountByIndex(mnemonic, 0, "http://127.0.0.1:7545");

  const provider = new ethers.providers.JsonRpcProvider(
    "http://127.0.0.1:7545"
  );

  const pablockAccount = new ethers.Wallet(
    "0xa5be2a383078efe8487077a19d4a1602ab4ceae15ff66a2765e1f96cc00734f5"
  );

  const pablockToken = new ethers.Contract(
    "0x2b9233683001657161db866c7405493Fc1d1C22d",
    pablockTokenData.abi,
    ownerAccount
  );
  console.log(
    await pablockToken.addContractToWhitelist(
      "0x6DbCe6dD23e6d8Be63ca9Ba11C3cc8d14e21cb3D"
    )
  );

  console.log(
    await pablockToken.getContractStatus(
      "0x6DbCe6dD23e6d8Be63ca9Ba11C3cc8d14e21cb3D"
    )
  );

  //   await pablockToken.requestToken(pablockAccount.address, 10);

  //   const multiSignFactory = new ethers.Contract(
  //     "0x3EDCA10Df9E81A812ccf79ff10baAC67337680D6",
  //     pablockMultiSignFactoryData.abi,
  //     pablockAccount.connect(provider)
  //   );

  //   const tx = await multiSignFactory.createNewMultiSignNotarization(
  //     "0xb133a0c0e9bee3be20163d2ad31d6248db292aa6dcb1ee087a2aa50e0fc75ae2",
  //     ["0xf68ec20B5B40B657A32d17DABBbDf6E4FD1497df"],
  //     "prova",
  //     100000
  //   );

  //   console.log(tx);

  //   const receipt = await tx.wait();

  //   console.log("Multisign generation result:", receipt);
})();
