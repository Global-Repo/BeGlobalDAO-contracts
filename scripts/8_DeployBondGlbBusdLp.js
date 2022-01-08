const { ethers } = require("hardhat");
const {
    BUSD_ADDRESS,
    GLB_BUSD_LP_ADDRESS,
    GLBD_ADDRESS
} = require("./addresses_mainnet");

async function main() {

    const [deployer] = await ethers.getSigners();
    //259200 - 3 dies
    let harvestTime = 600;
    let ratioLP = 200;
    let timeoutPeriod = 20000;

    console.log('Deploying contracts. Deployer account: ' + deployer.address);
/*
    console.log("[Deploying Bond GLB-BUSD LP SC]");
    const BOND = await ethers.getContractFactory('BondDepositoryGlbBusdLP');
    bond = await BOND.deploy(GLBD_ADDRESS,BUSD_ADDRESS,GLB_BUSD_LP_ADDRESS,harvestTime,ratioLP);
    console.log("[Bond GLB-BUSD LP deployed]: " + bond.address);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));
*/
    try {
        console.log("VERIFYING Bond GLB-BUSD LP: ", '0x7940F3b5971212a25d858d4FfAd41E80de865F96');
        await hre.run("verify:verify", {
            address: '0x7940F3b5971212a25d858d4FfAd41E80de865F96',
            constructorArguments: [
                GLBD_ADDRESS,
                BUSD_ADDRESS,
                GLB_BUSD_LP_ADDRESS,
                harvestTime,
                ratioLP
            ],
        });
        console.log( "Verified Bond GLB-BUSD LP: " + '0x7940F3b5971212a25d858d4FfAd41E80de865F96' );
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

