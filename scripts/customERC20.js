const fs = require("fs");
const { ethers } = require("ethers");

const { getPermitDigest, sign } = require("../utility");

const infuraKey = fs.readFileSync(".infurakey.secret").toString().trim();
const maticMnemonic = fs.readFileSync(".mumbai.secret").toString().trim();

const CustomERC20JSON = require("../build/contracts/CustomERC20.json");

const provider = new ethers.providers.JsonRpcProvider(
  `https://polygon-mumbai.infura.io/v3/${infuraKey}`
);

const contractOwner = new ethers.Wallet(maticMnemonic);
const userWallet = new ethers.Wallet(
  "0x817156994badea01bf23ed377cf832ea6c4c8073f95750162814a5760a68c5c3"
);

const customERC20 = new ethers.Contract(
  "0x65Bd5b3F45E00783bFfEe59c90e279b522b147e8",
  CustomERC20JSON.abi,
  contractOwner.connect(provider)
);

async function requestPermit() {
  const value = 100;

  const approve = {
    owner: userWallet.address,
    spender: contractOwner.address,
    value,
  };

  const nonce = parseInt(
    (await customERC20.getNonces(approve.owner)).toString()
  );

  const digest = getPermitDigest(
    await customERC20.name(),
    customERC20.address,
    parseInt((await customERC20.getChainId()).toString()),
    approve,
    nonce,
    1657121546000
  );

  // Sign it
  // NOTE: Using web3.eth.sign will hash the message internally again which
  // we do not want, so we're manually signing here
  const { v, r, s } = sign(
    digest,
    Buffer.from(
      "817156994badea01bf23ed377cf832ea6c4c8073f95750162814a5760a68c5c3",
      "hex"
    )
  );

  let tx = await customERC20.populateTransaction.requestPermit(
    approve.owner,
    approve.spender,
    approve.value,
    1657121546000,
    v,
    r,
    s
  );
  let account = contractOwner.connect(provider);
  console.log(
    await account.sendTransaction({
      ...tx,
      gasPrice: 5000000000,
      gasLimit: 150000,
    })
  );
}

(async () => {
  //Add contract to whitelist of already deployed PablockToken
  // let tx = await pablockToken.addContractToWhitelist("");
  // console.log(await tx.wait());

  //Mint token
  let tx2 = await customERC20.mint(
    "0xf68ec20B5B40B657A32d17DABBbDf6E4FD1497df",
    10
  );
  console.log(await tx2.wait());

  //Transfer token
  let tx3 = await customERC20.transferFrom(
    contractOwner.address,
    "0x5a4654f393CBa1f8Aed8790E98435aEC057b353C",
    5,
    { gasPrice: 5000000000, gasLimit: 300000 }
  );
  console.log(await tx3.wait());

  console.log((await customERC20.balanceOf(contractOwner.address)).toString());
})();
