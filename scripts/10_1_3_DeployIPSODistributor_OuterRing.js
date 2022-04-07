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

    console.log('Deploying contracts. Deployer account: ' + deployer.address);
    let busd;
    const BUSD = await ethers.getContractFactory('BEP20Token');
    /*
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

        try {
            console.log("VERIFYING BUSD: ", "0x542a4f784c95507cBa23d091cDe63A38492c2088");
            //// Verify contract on bsc
            await hre.run("verify:verify", {
                address: "0x542a4f784c95507cBa23d091cDe63A38492c2088",
                constructorArguments: [
                ],
            });
            console.log( "Verified BUSD: " + "0x542a4f784c95507cBa23d091cDe63A38492c2088" );
        } catch (err) {
            console.log(err.message);
        }
    } else {
        // Attach BUSD
        console.log("[Attaching BUSD SC]");
        busd = await BUSD.attach("0x5A05328D3E9505859b51bEc77122FCCCe18E3402");
        await busd.mint(INITIAL_SUPPLY_BIG);
        //await busd.transfer("0xa978688CE4721f0e28CF85c4C2b0f55d3186736f",INITIAL_SUPPLY_BIG);
        console.log("[BUSDt attached]: " + busd.address);
    }*/


    console.log("[Disperse statistics for OuterRing]");
    const IPSO = await ethers.getContractFactory('IPSO');
    let ipso = await IPSO.attach("0x8C4C9AfCC061c3422FA682c201FAEC14d85666fF");

    let user;
    let userAllocation;
    let amountToDistribute;
    const numUsers = await ipso.getAddressListLength();
    let raisingAmount = await ipso.raisingAmount();
    let totalAmountInvested = await ipso.totalAmountInvested();
    let amountInvested;

    for (let i = 0; i < numUsers; i++) {
        user = await ipso.addressList(i);
        [userAllocation,,,,,,] = await ipso.userInfo(user);
        userAllocation /= 1000000000000000000;
        //amountInvested = userAllocation * 0.91;
        amountInvested = userAllocation * raisingAmount / totalAmountInvested;
        console.log(amountInvested.toFixed(2), user);
    }

    console.log(numUsers);
    console.log(totalAmountInvested);


    console.log("DEPLOYMENT SUCCESSFULLY FINISHED");
}


main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})

