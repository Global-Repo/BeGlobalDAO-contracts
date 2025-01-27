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

    let harvestTime = 6480000; //2.5 mesos
    let ratio = 380;
    let timeoutPeriod = 10000;
    let maxDeposit = BigNumber.from(500000).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG);
    let deployBUSD = true;
    let largeApproval = '1000000000000000000000000000000000000';

    /*
    console.log('Deploying contracts. Deployer account: ' + deployer.address);
    let busd;
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


    //MAINNET
    console.log("[Deploying IPSO3 SC]");
    const IPSO = await ethers.getContractFactory('IPSO3');
    let startTime = Math.round(new Date().getTime()/1000);
    console.log("startTime = '" + startTime + "';");
    //let ipso = await IPSO.attach("0x37Cb9C9Bf6EF1Cf44A46b3f1eeD555B1EE3618BD");
    let ipso = await IPSO.deploy(
        "0xbe7cbd94060f237ca06596a92c60b728ee891ab6",//WGLBD.address,
        "0xe9e7cea3dedca5984780bafc599bd69add087d56",//busd.address,
        1647900000, //start sale
        1648072800, //end sale
        1651438800, //end claim
        275, // _ratioRequiredWGLBDNum 275
        4761904761, // _ratioRequiredWGLBDDen 4761904761.904761904761904761
        BigNumber.from(275).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG), // _amountForWhitelisted
        BigNumber.from(4761904761).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG), // _minInvestment
        BigNumber.from(275).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG), // _maxInvestment
        BigNumber.from(4125).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG) // _raisingAmount
    );
    console.log("[IPSO deployed]: " + ipso.address);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    try {
        console.log("VERIFYING IPSO: ", ipso.address);
        //// Verify contract on bsc
        await hre.run("verify:verify", {
            address: ipso.address,
            constructorArguments: [
                "0xbe7cbd94060f237ca06596a92c60b728ee891ab6",//WGLBD.address,
                "0xe9e7cea3dedca5984780bafc599bd69add087d56",//busd.address,
                1647900000,
                1648072800,
                1651438800,
                275,
                4761904761,
                BigNumber.from(275).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG),
                BigNumber.from(4761904761).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG),
                BigNumber.from(275).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG),
                BigNumber.from(4125).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG)
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

