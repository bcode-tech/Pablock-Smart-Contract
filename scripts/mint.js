const { ethers } = require("ethers");
const { readFileSync } = require("fs");

const { abi: pablockNFTabi } = require("../build/contracts/PablockNFT.json");
const {
  abi: pablockTokenabi,
} = require("../build/contracts/PablockToken.json");

const currentEnv = "mumbai";

const infuraKey = readFileSync(".infurakey.secret").toString().trim();
const privateKey = readFileSync(`.${currentEnv}.secret`).toString().trim();

(async () => {
  const provider = new ethers.providers.JsonRpcProvider(
    `https://polygon-mumbai.infura.io/v3/${infuraKey}`
  );

  const pablockAccount = new ethers.Wallet(privateKey).connect(provider);

  const pablockNFT = new ethers.Contract(
    "0xfF8014328c7a9d699BCE98b2Ff9ACB94818046A5",
    pablockNFTabi,
    pablockAccount
  );

  const pablockToken = new ethers.Contract(
    "0xa723fc1E105923a98a7FbdB8040296C8f118d883",
    pablockTokenabi,
    pablockAccount
  );

  // await pablockToken.requestToken(
  //   "0xa83726b0d7Dc2d927b5F9E79b280FD8CcC37A154",
  //   1
  // );

  // console.log(
  //   "First Balance:",
  //   (await pablockToken.balanceOf(pablockAccount.address)).toString()
  // );

  // const tx = await pablockNFT.mintToken(
  //   pablockAccount.address,
  //   1,
  //   "https://gateway.pinata.cloud/ipfs/QmU2cbt1hzJ9q1P4ccPHqRKLHpYfiQ7D2y61yZvZkfcknr",
  //   {
  //     gasLimit: 600000,
  //   }
  // );

  // await tx.wait();

  // let tx2 = await pablockNFT.unlockToken(1);
  // await tx2.wait();

  console.log(
    (
      await pablockToken.balanceOf("0xa83726b0d7Dc2d927b5F9E79b280FD8CcC37A154")
    ).toString()
  );
})();
