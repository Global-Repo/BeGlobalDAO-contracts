const { ethers } = require("hardhat");
const {
    BUSD_ADDRESS,
    GLBD_BUSD_LP_ADDRESS,
    GLBD_ADDRESS
} = require("./addresses_localhost");

async function main() {

    const [deployer] = await ethers.getSigners();
    let harvestTime = 259200;
    let ratioLP = 200;
    let timeoutPeriod = 10000;

    console.log('Deploying contracts. Deployer account: ' + deployer.address);

    console.log("[Deploying Bond GLB-BUSD LP SC]");
    const BOND = await ethers.getContractFactory('BondDepositoryGlbBusdLP');
    bond = await BOND.deploy(GLBD_ADDRESS,BUSD_ADDRESS,GLBD_BUSD_LP_ADDRESS,harvestTime,ratioLP);
    console.log("[Bond GLB-BUSD LP deployed]: " + bond.address);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    try {
        console.log("VERIFYING Bond GLB-BUSD LP: ", "0x2F0fE64673997Da277b979C41a7aF404fe9D4EC8");
        //// Verify contract on bsc
        await hre.run("verify:verify", {
            address: "0x2F0fE64673997Da277b979C41a7aF404fe9D4EC8",
            constructorArguments: [
                GLBD_ADDRESS,
                BUSD_ADDRESS,
                GLBD_BUSD_LP_ADDRESS,
                harvestTime,
                ratioLP
            ],
        });
        console.log( "Verified Bond GLB-BUSD LP: " + "0x2F0fE64673997Da277b979C41a7aF404fe9D4EC8" );
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

