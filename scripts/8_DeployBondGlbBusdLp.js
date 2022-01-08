const { ethers } = require("hardhat");
const {
    BUSD_ADDRESS,
    GLB_BUSD_LP_ADDRESS,
    GLBD_ADDRESS, DEPLOYER_ADDRESS, ROUTER_BEGLOBAL_ADDRESS
} = require("./addresses_mainnet");
const {BigNumber} = require("@ethersproject/bignumber");

const TOKEN_DECIMALS_LITTLE = 9;
const BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_LITTLE = BigNumber.from(10).pow(TOKEN_DECIMALS_LITTLE);
const INITIAL_SUPPLY = BigNumber.from(60000).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_LITTLE);

async function main() {

    const [deployer] = await ethers.getSigners();

    let harvestTime = 300; //259200;
    let ratioLP = 200;
    let timeoutPeriod = 10000;
    let largeApproval = '1000000000000000000000000000000000000';

    console.log('Deploying contracts. Deployer account: ' + deployer.address);


    // Deploy GLBD
    const GLBDT = await ethers.getContractFactory('GlobalDAOToken');
    let GLBD = await GLBDT.deploy();
    console.log("const GLBD_ADDRESS = '" + GLBD.address + "';");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    console.log("[Set deployer as a vault for GLBD Token]");
    await GLBD.setVault(DEPLOYER_ADDRESS);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Mint GLBD
    console.log("[Deployer mints (extra?) 60000 GLBD]");
    await GLBD.mint(DEPLOYER_ADDRESS, INITIAL_SUPPLY);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    console.log("[Deploying Bond GLB-BUSD LP SC]");
    const BOND = await ethers.getContractFactory('BondDepositoryGlbBusdLP');
    let bond = await BOND.deploy(GLBD.address,BUSD_ADDRESS,GLB_BUSD_LP_ADDRESS,ROUTER_BEGLOBAL_ADDRESS,harvestTime,ratioLP);
    console.log("[Bond GLB-BUSD LP deployed]: " + bond.address);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    console.log("[Transfering GLBDs to bond]");
    await GLBD.transfer(bond.address,BigNumber.from(1000).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_LITTLE));
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    const PAIR = await ethers.getContractFactory('BondDepositoryGlbBusdLP');
    let pair = await PAIR.deploy(GLB_BUSD_LP_ADDRESS);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    console.log("[approving LP to bond]");
    await pair.approve(bond.address,largeApproval);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    try {
        console.log("VERIFYING GLBD: ", GLBD.address);
        //// Verify contract on bsc
        await hre.run("verify:verify", {
            address: GLBD.address,
            constructorArguments: [
            ],
        });
        console.log( "Verified GLBD: " + GLBD.address );
    } catch (err) {
        console.log(err.message);
    }

    try {
        console.log("VERIFYING Bond GLB-BUSD LP: ", bond.address);
        //// Verify contract on bsc
        await hre.run("verify:verify", {
            address: bond.address,
            constructorArguments: [
                GLBD.address,
                BUSD_ADDRESS,
                GLB_BUSD_LP_ADDRESS,
                ROUTER_BEGLOBAL_ADDRESS,
                harvestTime,
                ratioLP
            ],
        });
        console.log( "Verified Bond GLB-BUSD LP: " + bond.address );
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

