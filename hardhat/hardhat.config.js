require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("@openzeppelin/hardhat-upgrades");

/** @type import('hardhat/config').HardhatUserConfig */

module.exports = {
  solidity: "0.8.24",
  networks: {
    mumbai: {
      url: process.env.ALCHEMY_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 80001,
      gasPrice: "auto",
      gasLimit: 6000000, // Adjust as needed
      saveDeployments: true,
    },
    arbitrumSepolia: {
      url: process.env.ALCHEMY_ARBITRUM_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 421614,
      gasPrice: "auto",
      gasLimit: 6000000, // Adjust as needed
      saveDeployments: true,
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 11155111,
      gasPrice: "auto",
      // gas: 5000000,
      // timeout: 10000,
      confirmations: 2,
    },
  },
  etherscan: {
    apiKey: {
      polygonMumbai: process.env.POLYGON_API_KEY,
      arbitrumSepolia: process.env.ALCHEMY_ARBITRUM_API_KEY,
      sepolia: process.env.ETHERSCAN_API_KEY,
    },
  },
  sourcify: {
    enabled: true,
  },
  settings: {
    optimizer: {
      enabled: true,
      runs: 1000,
    },
  },
};
