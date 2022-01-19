import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import fs from "fs";

dotenv.config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

const isCI = process.env.CI;

let infuraKey = "";
let maticPrivate = "";
let mumbaiPrivate = "";
let goerliPrivate = "";
let ropstenPrivate = "";

if (!isCI) {
  infuraKey = fs.readFileSync(".infurakey.secret").toString().trim();
  maticPrivate = fs.readFileSync(".matic.secret").toString().trim();
  mumbaiPrivate = fs.readFileSync(".mumbai.secret").toString().trim();
  goerliPrivate = fs.readFileSync(".goerli.secret").toString().trim();
  ropstenPrivate = fs.readFileSync(".ropsten.secret").toString().trim();
}

const config: HardhatUserConfig = {
  solidity: "0.8.9",
  networks: {
    local: {
      url: "http://127.0.0.1:7545",
      blockGasLimit: 100000000000,
    },
    matic: {
      url: `https://polygon-mainnet.infura.io/v3/${infuraKey}`,
      accounts: [maticPrivate],
      gasPrice: 50000000000,
    },
    mumbai: {
      url: `https://polygon-mumbai.infura.io/v3/${infuraKey}`,
      accounts: [mumbaiPrivate],
      gasPrice: 5000000000,
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${infuraKey}`,
      accounts: [goerliPrivate],
    },
    ropsten: {
      url: `https://ropsten.infura.io/v3/${infuraKey}`,
      accounts: [ropstenPrivate],
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
