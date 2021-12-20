const { ethers } = require("hardhat");
const {
    GLBD_ADDRESS,
    SGLBD_ADDRESS,
    TREASURY_ADDRESS,
    DISTRIBUTOR_ADDRESS,
    STAKING_ADDRESS,
    STAKING_HELPER_ADDRESS,
    STAKING_WARMUP_ADDRESS,
    BONDING_CALCULATOR_ADDRESS,
    REDEEM_HELPER_ADDRESS,
    BUSD_ADDRESS,
    GLBD_BUSD_LP_ADDRESS
} = require("./addresses_testnet");

async function main() {

    const [deployer] = await ethers.getSigners();
    console.log('Verifying contracts with the account: ' + deployer.address);

    // First block epoch occurs
    const firstEpochBlock = '8961000'; //TODO pendent a posar el bloc del dia 23 (dia del arranque)

    // What epoch will be first epoch
    //const firstEpochNumber = '338';
    const firstEpochNumber = '6'; //TODO pendent a posar el bloc del dia 25 quan (comença a comptar el staking???)

    // How many blocks are in each epoch
    //const epochLengthInBlocks = '2200';
    const epochLengthInBlocks = '9600';

    /*await hre.run("verify:verify", {
        address: BUSD_ADDRESS,
        constructorArguments: [
        ],
    });
    console.log( "BUSD verified: " + BUSD_ADDRESS );


    await hre.run("verify:verify", {
        address: GLBD_ADDRESS,
        constructorArguments: [
        ],
    });
    console.log( "GLBD verified: " + GLBD_ADDRESS );

    await hre.run("verify:verify", {
        address: SGLBD_ADDRESS,
        constructorArguments: [
        ],
    });
    console.log( "SGLBD verified: " + SGLBD_ADDRESS );

    await hre.run("verify:verify", {
        address: TREASURY_ADDRESS,
        constructorArguments: [
            GLBD_ADDRESS,
            BUSD_ADDRESS,
            GLBD_BUSD_LP_ADDRESS,
            0
        ],
    });
    console.log( "TREASURY verified: " + TREASURY_ADDRESS );

    await hre.run("verify:verify", {
        address: DISTRIBUTOR_ADDRESS,
        constructorArguments: [
            TREASURY_ADDRESS,
            GLBD_ADDRESS,
            epochLengthInBlocks,
            firstEpochBlock
        ],
    });
    console.log( "DISTRIBUTOR verified: " + DISTRIBUTOR_ADDRESS );

    await hre.run("verify:verify", {
        address: STAKING_ADDRESS,
        constructorArguments: [
            GLBD_ADDRESS,
            SGLBD_ADDRESS,
            epochLengthInBlocks,
            firstEpochNumber,
            firstEpochBlock
        ],
    });
    console.log( "STAKING verified: " + STAKING_ADDRESS );

    await hre.run("verify:verify", {
        address: STAKING_HELPER_ADDRESS,
        constructorArguments: [
            STAKING_ADDRESS,
            GLBD_ADDRESS
        ],
    });
    console.log( "STAKING_HELPER verified: " + STAKING_HELPER_ADDRESS );

    await hre.run("verify:verify", {
        address: STAKING_WARMUP_ADDRESS,
        constructorArguments: [
            STAKING_ADDRESS,
            SGLBD_ADDRESS
        ],
    });
    console.log( "STAKING_WARMUP verified: " + STAKING_WARMUP_ADDRESS );

    await hre.run("verify:verify", {
        address: BONDING_CALCULATOR_ADDRESS,
        constructorArguments: [
            GLBD_ADDRESS
        ],
    });
    console.log( "BONDING_CALCULATOR verified: " + BONDING_CALCULATOR_ADDRESS );*/

    await hre.run("verify:verify", {
        address: REDEEM_HELPER_ADDRESS,
        constructorArguments: [
        ],
    });
    console.log( "REDEEM_HELPER verified: " + REDEEM_HELPER_ADDRESS );

    console.log("VERIFICATION SUCCESSFULLY FINISHED");
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})
