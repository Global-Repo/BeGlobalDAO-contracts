const { ethers } = require("hardhat");
const {
    BUSD_ADDRESS,
    GLBD_ADDRESS,
    DEPLOYER_ADDRESS,
    GLB_ADDRESS,
    SGLBD_ADDRESS
} = require("./addresses_testnet");
const {BigNumber} = require("@ethersproject/bignumber");

const TOKEN_DECIMALS_LITTLE = 9;
const BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_LITTLE = BigNumber.from(10).pow(TOKEN_DECIMALS_LITTLE);
const INITIAL_SUPPLY = BigNumber.from(60000).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_LITTLE);

const TOKEN_DECIMALS_BIG = 18;
const BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG = BigNumber.from(10).pow(TOKEN_DECIMALS_BIG);
const INITIAL_SUPPLY_BIG = BigNumber.from(60000).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG);

async function main() {

    const [deployer] = await ethers.getSigners();
    let timeoutPeriod = 10000;


    let startSale = 1663617600;
    let endSale = 1663963200;
    let endClaim = 1669928400;
    let ratioRequiredWGLBDNum = 1;
    let ratioRequiredWGLBDDenum = 5000000;
    let amountForWhitelisted = 500;
    let minInvestment = 500000000;
    let maxInvestment = 180000;
    let raisingAmount = 45000;

    //MAINNET
    console.log("[Deploying IPSO5 SC]");
    const IPSO = await ethers.getContractFactory('IPSO5');
    //let ipso = await IPSO.attach("0x71AcCEE97a220da6D06E4470F640230806345FBd");
    let ipso = await IPSO.deploy(
        "0xbe7cbd94060f237ca06596a92c60b728ee891ab6", //"0x5Cb0be00673Cc760f87Fa9E8f4Ea01e672cF7f15",
        "0xe9e7cea3dedca5984780bafc599bd69add087d56", //"0x5eF57C527D360cfcAe8FE801b2bbB931f492b92b",
        startSale,
        endSale,
        endClaim,
        ratioRequiredWGLBDNum,
        ratioRequiredWGLBDDenum,
        BigNumber.from(amountForWhitelisted).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG),
        BigNumber.from(minInvestment).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG),
        BigNumber.from(maxInvestment).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG),
        BigNumber.from(raisingAmount).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG)
    );
    console.log("[IPSO deployed]: " + ipso.address);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    await ipso.pushManagement("0xF386A7d8eB28a4e507553760c92E8B4D9D1D0eEf");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    try {
        console.log("VERIFYING IPSO: ", ipso.address);
        //// Verify contract on bsc
        await hre.run("verify:verify", {
            address: ipso.address,
            constructorArguments: [
                "0xbe7cbd94060f237ca06596a92c60b728ee891ab6", //"0x5Cb0be00673Cc760f87Fa9E8f4Ea01e672cF7f15",
                "0xe9e7cea3dedca5984780bafc599bd69add087d56", //"0x5eF57C527D360cfcAe8FE801b2bbB931f492b92b",
                startSale,
                endSale,
                endClaim,
                ratioRequiredWGLBDNum,
                ratioRequiredWGLBDDenum,
                BigNumber.from(amountForWhitelisted).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG),
                BigNumber.from(minInvestment).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG),
                BigNumber.from(maxInvestment).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG),
                BigNumber.from(raisingAmount).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG)
            ],
        });
        console.log( "Verified IPSO: " + ipso.address );
    } catch (err) {
        console.log(err.message);
    }

    console.log("DEPLOYMENT SUCCESSFULLY FINISHED");
}


main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
    })

