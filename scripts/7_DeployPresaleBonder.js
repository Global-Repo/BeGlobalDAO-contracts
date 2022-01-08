const { ethers } = require("hardhat");
const {
    GLBD_BUSD_BOND_ADDRESS,DEPLOYER_ADDRESS, BUSD_ADDRESS, PRESALEBONDER, GLBD_BUSD_LP_ADDRESS,
    PRESALE
} = require("./addresses_mainnet");

const {BigNumber} = require("@ethersproject/bignumber");


const TOKEN_DECIMALS = 9;
const BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER = BigNumber.from(10).pow(TOKEN_DECIMALS);
const INITIAL_SUPPLY = BigNumber.from(100000).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER);

const TOKEN_DECIMALS_B = 18;
const BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_B = BigNumber.from(10).pow(TOKEN_DECIMALS_B);
const INITIAL_SUPPLY_B = BigNumber.from(100).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_B);

let bep20Amount = function (amount) {
    return BigNumber.from(amount).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER);
}

let bep20Amount_B = function (amount) {
    return BigNumber.from(amount).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_B);
}

async function main() {

    const [deployer] = await ethers.getSigners();
    const BUSD = await ethers.getContractFactory('BEP20Token');
    const BondDepository = await ethers.getContractFactory('GlobalDAOBondDepository');
    const GLBDBUSDLP = await ethers.getContractFactory('PancakeERC20');
    const PresaleBonder = await ethers.getContractFactory('PresaleBonder');
    let amount = 0;
    let timeoutPeriod = 10000;
    let busd;

    let bondDepository = await BondDepository.attach(GLBD_BUSD_BOND_ADDRESS);
    console.log("[bondDepository attached]: " + bondDepository.address);

    glbdbusdLP = await GLBDBUSDLP.attach(GLBD_BUSD_LP_ADDRESS);
    console.log("[GLBD-BUSD LP attached]: " + glbdbusdLP.address);

    busd = await BUSD.attach(BUSD_ADDRESS);
    console.log("[BUSDt attached]: " + busd.address);

    presaleBonder = await PresaleBonder.deploy(BUSD_ADDRESS, GLBD_BUSD_LP_ADDRESS, PRESALE, GLBD_BUSD_BOND_ADDRESS);
    console.log("[PresaleBonder deployed]: " + presaleBonder.address);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    amount = await glbdbusdLP.balanceOf(DEPLOYER_ADDRESS);
    console.log("[GLBD-BUSD LP Balance of deployer]: " + amount.toString());
    await glbdbusdLP.transfer(presaleBonder.address, amount);
    console.log("[GLBD-BUSD LPs transferred to presalebonder]");

    let amountA = await glbdbusdLP.balanceOf(presaleBonder.address);
    console.log("[GLBD-BUSD LP Balance of PresaleBonder]: " + amount.toString());
    console.log("[BondPrice in USD: " + (await bondDepository.bondPriceInUSD()).toString() + "]");
    console.log("[BondPrice: " + (await bondDepository.bondPrice()).toString() + "]");

    try {
        console.log("VERIFYING presaleBonder: ", presaleBonder.address);
        //// Verify contract on bsc
        await hre.run("verify:verify", {
            address: presaleBonder.address,
            constructorArguments: [
                BUSD_ADDRESS,
                GLBD_BUSD_LP_ADDRESS,
                PRESALE,
                GLBD_BUSD_BOND_ADDRESS
            ],
        });
        console.log( "[PresaleBonder verified]");
    } catch (err) {
        console.log(err.message);
    }

    console.log("[You can start using the presaleBonder and launch]");
}


main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
    })

