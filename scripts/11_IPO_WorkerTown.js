const hre = require("hardhat");
require("@nomiclabs/hardhat-ethers");

const {
    DEV_POWER_ADDRESS,
} = require("./addresses");

const {
    deployVaultLocked,
} = require("../test/helpers/singleDeploys");

const { timestampNHours, timestampNDays, bep20Amount } = require("../test/helpers/utils.js");

const VAULT_LOCKED_DISTRIBUTE_GLOBAL_INTERVAL = timestampNHours(12); // 12h, Hours to distribute Globals from last distribution event.

let CURRENT_BLOCK;
let ipo;

async function main() {
    console.log("Starting deploy");

    [deployer] = await hre.ethers.getSigners();

    CURRENT_BLOCK = await ethers.provider.getBlockNumber();
    console.log("Current block is:", CURRENT_BLOCK);

    // Attach
    const IPO = await ethers.getContractFactory("IPO");
    /*ipo = await IPO.attach(
        "0x1f993896a6e00BF0c2a5Fe6a9d6ACB991FD955dA"
    );
    let prova = await ipo.userInfo("0x6063130f5Ba259ee9d51F62c16ABFe1B4b91610B")
    console.log(prova.toString());*/

    ipo = await IPO.deploy(
        "0xe9e7cea3dedca5984780bafc599bd69add087d56", //_investmentToken
        31620, //_startWhitelist
        31620, //_endWhitelist
        31620, //_startPublicSale
        31620, //_startClaim
        31620, //_endClaim
        31620, //_ratioNumWhitelist
        31620, //_ratioDenumWhitelist
        31620, //_maxInvestmentWhitelist
        31620, //_raisingAmountWhitelist
        31620, //_ratioNumPublicSale
        31620, //_ratioDenumPublicSale
        31620, //_maxInvestmentPublicSale
        31620 //_raisingAmountPublicSale
    );

    await ipo.deployed();
    console.log("IPO deployed to:", ipo.address);
    await new Promise(r => setTimeout(() => r(), 10000));

    // Verify
    await hre.run("verify:verify", {
        address: ipo.address, //ipo.address,
        constructorArguments: [
            "0xe9e7cea3dedca5984780bafc599bd69add087d56", //_investmentToken
            31620, //_startWhitelist
            31620, //_endWhitelist
            31620, //_startPublicSale
            31620, //_startClaim
            31620, //_endClaim
            31620, //_ratioNumWhitelist
            31620, //_ratioDenumWhitelist
            31620, //_maxInvestmentWhitelist
            31620, //_raisingAmountWhitelist
            31620, //_ratioNumPublicSale
            31620, //_ratioDenumPublicSale
            31620, //_maxInvestmentPublicSale
            31620 //_raisingAmountPublicSale
        ],
    });

    console.log("Deploy finished");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
