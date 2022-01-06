const { ethers } = require("hardhat");
const { BigNumber } = require("@ethersproject/bignumber");
const {
    GLBD_ADDRESS,
    BUSD_ADDRESS,
    GLB_BUSD_LP_ADDRESS, BONDING_CALCULATOR_ADDRESS
} = require("./addresses_testnet");

async function main() {

    const [deployer] = await ethers.getSigners();
    let bondHarvestTime = 259200;
    let bondRatioLP = 200;
    let largeApproval = '100000000000000000000000000000000';

    let glbbusdBond;
    let glbbusdLP;

    let timeoutPeriod = 5000;

    // Deploy bonding depository GLB-BUSD LP
    console.log("[Deploy boji depository GLB-BUSD LP]");
    const GLBBUSDBond = await ethers.getContractFactory('BondDepositoryGlbBusdLP');
    glbbusdBond = await GLBBUSDBond.deploy(GLBD_ADDRESS, BUSD_ADDRESS, GLB_BUSD_LP_ADDRESS, bondHarvestTime, bondRatioLP);
    console.log("[GlobalDAOBondDepository GLB-BUSD LP deployed]: " + glbbusdBond.address);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    const GLBBUSDLP = await ethers.getContractFactory('Pair');
    glbbusdLP = await GLBBUSDLP.attach(GLB_BUSD_LP_ADDRESS);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Approve RouterBeGlobal as spender of LBD-BUSD LP for Deployer
    console.log("[Approve GLB-BUSD LP to be used in the BeGlobal router by the deployer]");
    await glbbusdLP.approve(glbbusdBond.address, largeApproval);
    console.log("[Success]");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    try {
        console.log("VERIFYING GlobalDAOBondDepository GLB-BUSD LP: ", glbbusdBond.address);
        //// Verify contract on bsc
        await hre.run("verify:verify", {
            address: glbbusdBond.address,
            constructorArguments: [
                GLBD_ADDRESS,
                BUSD_ADDRESS,
                GLB_BUSD_LP_ADDRESS,
                bondHarvestTime,
                bondRatioLP
            ],
        });
        console.log( "GlobalDAOBondDepository GLB-BUSD LP verified: " + glbbusdBond.address );
        console.log("Success");
    } catch (err) {
        console.log(err.message);
    }

    console.log("[LP bond deployed successfully]");
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
    })

