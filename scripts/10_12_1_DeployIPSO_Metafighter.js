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

    /*
    console.log('Deploying contracts. Deployer account: ' + deployer.address);
    let busd;
    let deployBUSD = true;
    const BUSD = await ethers.getContractFactory('BEP20Token');
    if (deployBUSD) {
        // Deploy BUSD
        console.log("[Deploying BUSD SC]");
        busd = await BUSD.deploy();
        console.log("[BUSDt deployed]: " + busd.address);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));

        // Deployer mints 100 BUSD
        console.log("[Deployer mints 100 BUSD]");
        await busd.mint(INITIAL_SUPPLY_BIG);
        //await busd.transfer("0xa978688CE4721f0e28CF85c4C2b0f55d3186736f",INITIAL_SUPPLY);
        console.log("[Success]");
    } else {
        // Attach BUSD
        console.log("[Attaching BUSD SC]");
        busd = await BUSD.attach("0x5A05328D3E9505859b51bEc77122FCCCe18E3402");
        await busd.mint(INITIAL_SUPPLY_BIG);
        //await busd.transfer("0xa978688CE4721f0e28CF85c4C2b0f55d3186736f",INITIAL_SUPPLY_BIG);
        console.log("[BUSDt attached]: " + busd.address);
    }*/

    let startWhitelist = 1649440800;
    let endWhitelist = 1649527200;
    let startPublicSale = 1649527200;
    let endPublicSale = 1649613600;
    let startVesting = 1649613600;
    let endVesting = 1652637600;
    let ratioRequiredWGLBDNum = 2;
    let ratioRequiredWGLBDDenum = 1;
    let amountForWhitelisted = 300;
    let minInvestment = 300;
    let maxInvestment = 10000;
    let raisingAmount = 10990;
    let hardCap = 10990;

    //MAINNET
    console.log("[Deploying IPSO6 SC]");
    const IPSO = await ethers.getContractFactory('IPSO6');
    let ipso = await IPSO.attach("0x00A0c8970A79b3D205B9c1c27a0Ce6CB93f10583");
    /*let ipso = await IPSO.deploy(
        "0xbe7cbd94060f237ca06596a92c60b728ee891ab6", //"0x5Cb0be00673Cc760f87Fa9E8f4Ea01e672cF7f15",
        "0xe9e7cea3dedca5984780bafc599bd69add087d56", //"0x5eF57C527D360cfcAe8FE801b2bbB931f492b92b",
        startWhitelist,
        endWhitelist,
        startPublicSale,
        endPublicSale,
        startVesting,
        endVesting,
        ratioRequiredWGLBDNum,
        ratioRequiredWGLBDDenum,
        BigNumber.from(amountForWhitelisted).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG),
        BigNumber.from(minInvestment).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG),
        BigNumber.from(maxInvestment).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG),
        BigNumber.from(raisingAmount).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG),
        BigNumber.from(hardCap).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG)
    );*/
    console.log("[IPSO deployed]: " + ipso.address);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    //await ipso.setWhitelist("0xa978688CE4721f0e28CF85c4C2b0f55d3186736f");
    //await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    try {
        console.log("VERIFYING IPSO: ", ipso.address);
        //// Verify contract on bsc
        await hre.run("verify:verify", {
            address: ipso.address,
            constructorArguments: [
                "0xbe7cbd94060f237ca06596a92c60b728ee891ab6", //"0x5Cb0be00673Cc760f87Fa9E8f4Ea01e672cF7f15",
                "0xe9e7cea3dedca5984780bafc599bd69add087d56", //"0x5eF57C527D360cfcAe8FE801b2bbB931f492b92b",
                startWhitelist,
                endWhitelist,
                startPublicSale,
                endPublicSale,
                startVesting,
                endVesting,
                ratioRequiredWGLBDNum,
                ratioRequiredWGLBDDenum,
                BigNumber.from(amountForWhitelisted).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG),
                BigNumber.from(minInvestment).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG),
                BigNumber.from(maxInvestment).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG),
                BigNumber.from(raisingAmount).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG),
                BigNumber.from(hardCap).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG)
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

