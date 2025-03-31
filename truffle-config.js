/**
 * Truffle configuration file
 */
require('dotenv').config();
const HDWalletProvider = require('@truffle/hdwallet-provider');

// If you don't have these environment variables, create a .env file
// MNEMONIC is your wallet seed phrase
// INFURA_API_KEY is your Infura project ID
const mnemonic = process.env.MNEMONIC || "";
const infuraApiKey = process.env.INFURA_API_KEY || "";

module.exports = {
  networks: {
    // Development network for local testing
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*" // Match any network id
    },
    
    // Testnet configuration (Goerli)
    goerli: {
      provider: () => new HDWalletProvider(
        mnemonic,
        `https://goerli.infura.io/v3/${infuraApiKey}`
      ),
      network_id: 5,
      gas: 5500000,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true
    },
    
    // Mainnet configuration
    mainnet: {
      provider: () => new HDWalletProvider(
        mnemonic,
        `https://mainnet.infura.io/v3/${infuraApiKey}`
      ),
      network_id: 1,
      gas: 5500000,
      gasPrice: 20000000000, // 20 gwei
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true
    }
  },
  
  // Configure compilers
  compilers: {
    solc: {
      version: "0.8.17",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }
  },
  
  // Configure plugins
  plugins: [
    'truffle-plugin-verify'
  ],
  
  // Contract verification configuration
  api_keys: {
    etherscan: process.env.ETHERSCAN_API_KEY
  }
};