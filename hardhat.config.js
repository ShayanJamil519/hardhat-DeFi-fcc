require('@nomiclabs/hardhat-waffle')
require('@nomiclabs/hardhat-etherscan')
require('hardhat-deploy')
require('solidity-coverage')
require('hardhat-gas-reporter')
require('hardhat-contract-sizer')
require('dotenv').config()
    // ===========================

const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY
const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL
    // const COINMARKET_API_KEY = process.env.COINMARKET_API_KEY

module.exports = {
    defaultNetwork: 'hardhat',
    networks: {
        hardhat: {
            chainId: 31337,
            forking: {
                url: MAINNET_RPC_URL
            },
            blockConfirmations: 1,
        },
        localhost: {
            chainId: 31337,
        },
        goerli: {
            chainId: 5,
            blockConfirmations: 6,
            url: GOERLI_RPC_URL,
            accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
        },
    },
    gasReporter: {
        enabled: false,
        currency: 'USD',
        outputFile: 'gas-report.txt',
        noColors: true,
        // coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },

    contractSizer: {
        runOnCompile: false,
        only: ['OurToken'],
    },

    solidity: {
        compilers: [{
                version: '0.8.7',
            },
            {
                version: "0.6.6"
            },
            {
                version: "0.6.12"
            },
            {
                version: '0.4.19',
            },
        ],
    },
    namedAccounts: {
        deployer: {
            default: 0,
            1: 0,
        },
        user1: {
            default: 1,
        },
    },
    mocha: {
        timeout: 200000, // 200 sec max
    },
}