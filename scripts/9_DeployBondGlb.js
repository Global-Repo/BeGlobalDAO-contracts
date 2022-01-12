const { ethers } = require("hardhat");
const {
    BUSD_ADDRESS,
    GLB_BUSD_LP_ADDRESS,
    GLBD_ADDRESS, DEPLOYER_ADDRESS, ROUTER_BEGLOBAL_ADDRESS, GLB_ADDRESS
} = require("./addresses_mainnet");
const {BigNumber} = require("@ethersproject/bignumber");

const TOKEN_DECIMALS_LITTLE = 9;
const BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_LITTLE = BigNumber.from(10).pow(TOKEN_DECIMALS_LITTLE);
const INITIAL_SUPPLY = BigNumber.from(60000).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_LITTLE);

const TOKEN_DECIMALS_BIG = 18;
const BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG = BigNumber.from(10).pow(TOKEN_DECIMALS_BIG);

async function main() {

    const [deployer] = await ethers.getSigners();

    let harvestTime = 28800; //259200;
    let ratio = 380;
    let timeoutPeriod = 15000;
    let maxDeposit = BigNumber.from(5000000).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG);
    let largeApproval = '1000000000000000000000000000000000000';

    console.log('Deploying contracts. Deployer account: ' + deployer.address);

/*
    // Deploy GLBD
    const GLBDT = await ethers.getContractFactory('GlobalDAOToken');
    let GLBD = await GLBDT.attach(GLBD_ADDRESS);
    /*let GLBD = await GLBDT.deploy();
    console.log("const GLBD_ADDRESS = '" + GLBD.address + "';");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    console.log("[Set deployer as a vault for GLBD Token]");
    await GLBD.setVault(DEPLOYER_ADDRESS);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Mint GLBD
    console.log("[Deployer mints (extra?) 60000 GLBD]");
    await GLBD.mint(DEPLOYER_ADDRESS, INITIAL_SUPPLY);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));
*/

    console.log("[Deploying Bond GLB SC]");
    const BOND = await ethers.getContractFactory('BondDepositoryGlb');
    let bond = await BOND.deploy(GLBD_ADDRESS, GLB_ADDRESS, harvestTime, ratio, maxDeposit);
    console.log("[Bond GLB deployed]: " + bond.address);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    /*
    console.log("[Transfering GLBDs to bond]");
    await GLBD.transfer(bond.address, BigNumber.from(50).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_LITTLE));
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));


    const GLB = await ethers.getContractFactory('NativeToken');
    let glb = await GLB.attach(GLB_ADDRESS);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    console.log("[approving GLB to bond]");
    await glb.approve(bond.address,largeApproval);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));
*/
    try {
        console.log("VERIFYING Bond GLB: ", bond.address);
        //// Verify contract on bsc
        await hre.run("verify:verify", {
            address: bond.address,
            constructorArguments: [
                GLBD_ADDRESS,
                GLB_ADDRESS,
                harvestTime,
                ratio,
                maxDeposit
            ],
        });
        console.log( "Verified Bond GLB: " + bond.address );
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

