require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");

const fs = require('fs');
const secretsDeployer = fs.readFileSync(".secret_deployer").toString().trim().split(/\n/);
const mnemonicDeployer = secretsDeployer[0].trim();
const apiKeyBSC = secretsDeployer[1].trim();

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    hardhat: {
      allowUnlimitedContractSize: true
    },
    testnet: {
      allowUnlimitedContractSize: true,
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      chainId: 97,
      gasPrice: 20000000000,
      accounts: {mnemonic: mnemonicDeployer},
    },
    mainnet: {
      allowUnlimitedContractSize: true,
      url: "https://bsc-dataseed.binance.org/",
      chainId: 56,
      gasPrice: 20000000000,
      accounts: {mnemonic: mnemonicDeployer}
    }
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://bscscan.com/
    apiKey: apiKeyBSC
  },
  solidity: {
    compilers: [
      {
        version: "0.7.5",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      }
    ]
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 20000
  }
}