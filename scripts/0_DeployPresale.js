const { ethers } = require("hardhat");
const { BigNumber } = require("@ethersproject/bignumber");
const {
    BUSD_ADDRESS
} = require("./addresses_testnet");

const TOKEN_DECIMALS = 18;
const BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER = BigNumber.from(10).pow(TOKEN_DECIMALS);
const INITIAL_SUPPLY = BigNumber.from(100000).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER);

let bep20Amount = function (amount) {
    return BigNumber.from(amount).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER);
}

async function main() {

    const [deployer] = await ethers.getSigners();
    let presale;
    let busd;
    let deployBUSD = false;
    let deployPresale = true;
    let timeoutPeriod = 2000;
    let largeApproval = '100000000000000000000000000000000';

    const BUSD = await ethers.getContractFactory('BEP20');

    // Presale period
    let presaleBegins = (await ethers.provider.getBlock(await ethers.provider.getBlockNumber())).timestamp;
    let presaleEnds = presaleBegins+7200;

    if (deployBUSD) {
        // Deploy BUSD
        console.log("[Deploying BUSD SC]");
        busd = await BUSD.deploy("BUSD","BUSD");
        console.log("[BUSDt deployed]: " + busd.address);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));

        // Deployer mints 100 BUSD
        console.log("[Deployer mints 100 BUSD]");
        await busd.mint(INITIAL_SUPPLY);
        console.log("[Success]");
    } else {
        // Attach BUSD
        console.log("[Attaching BUSD SC]");
        busd = await BUSD.attach(BUSD_ADDRESS);
        console.log("[BUSDt attached]: " + busd.address);
    }
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    console.log('Deploying contracts. Deployer account: ' + deployer.address);

    if (deployPresale) {
        // Deploy Presale
        console.log("[Deploying Presale]");
        const Presale = await ethers.getContractFactory('Presale');
        presale = await Presale.deploy(busd.address, presaleBegins, presaleEnds);
        console.log("[Presale deployed]: " + presale.address);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));

        // Approve presale as spender of busd for Deployer
        console.log("[Approve presale as spender of busd for Deployer]");
        await busd.approve(presale.address, largeApproval);
        console.log("[Success]");
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));
    } else {
        // Attach Presale
        console.log("[Attaching Presale]");
        const Presale = await ethers.getContractFactory('Presale');
        presale = await Presale.attach("");
        console.log("[Presale attached]: " + presale.address);
    }
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    //await presale.addAddressToWhitelist(deployer.address);
    await presale.addAddressToWhitelist("0xa978688CE4721f0e28CF85c4C2b0f55d3186736f");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));
    console.log("[Success]");
/*
    // Buy some tokens with BUSD
    console.log("[Buy some tokens with BUSD]");
    await presale.buyTokens(bep20Amount(10), deployer.address);
    console.log("[Success]");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    await presale.buyTokens(bep20Amount(390), deployer.address);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));
    console.log("[Success]");

    try {
        console.log("VERIFYING BUSD: ", busd.address);
        //// Verify contract on bsc
        await hre.run("verify:verify", {
            address: busd.address,
            constructorArguments: [
                "BUSD",
                "BUSD"
            ],
        });
        console.log( "BUSD verified: " + busd.address );
        console.log("Success");
    } catch (err) {
        console.log(err.message);
    }
*/
    try {
        console.log("VERIFYING Presale: ", presale.address);
        //// Verify contract on bsc
        await hre.run("verify:verify", {
            address: presale.address,
            constructorArguments: [
                busd.address,
                presaleBegins,
                presaleEnds
            ],
        });
        console.log( "Presale verified: " + presale.address );
        console.log("Success");
    } catch (err) {
        console.log(err.message);
    }

    console.log("DEPLOYMENT SUCCESSFULLY FINISHED -> copy BUSD, GLBD & sGLBD addresses and addLiquidity to the router");
}


main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})

