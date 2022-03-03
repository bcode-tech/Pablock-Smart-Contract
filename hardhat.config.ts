import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";

import { NetworkUserConfig } from "hardhat/types";

dotenv.config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

function getNetworks() {
  const networks: { [any: string]: NetworkUserConfig } = {
    local: {
      url: "http://127.0.0.1:7545",
      blockGasLimit: 100000000000,
    },
  };

  if (process.env.MATIC_MAINNET_RPC && process.env.MATIC_MAINNET_PRIVATE_KEY) {
    networks.matic = {
      url: process.env.MATIC_MAINNET_RPC,
      accounts: [process.env.MATIC_MAINNET_PRIVATE_KEY],
    };
  }

  if (process.env.MATIC_MUMBAI_RPC && process.env.MATIC_MUMBAI_PRIVATE_KEY) {
    networks.mumbai = {
      url: process.env.MATIC_MUMBAI_RPC,
      accounts: [process.env.MATIC_MUMBAI_PRIVATE_KEY],
    };
  }

  if (process.env.VELAS_TESTNET_RPC && process.env.VELAS_TESTNET_PRIVATE_KEY) {
    networks.vtestnet = {
      url: process.env.VELAS_TESTNET_RPC,
      accounts: [process.env.VELAS_TESTNET_PRIVATE_KEY],
      timeout: 120000,
    };
  }

  return networks;
}

const config: HardhatUserConfig = {
  solidity: "0.8.9",
  networks: getNetworks(),
  gasReporter: {
    enabled: !!process.env.REPORT_GAS,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
