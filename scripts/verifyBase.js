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
    GLBD_BUSD_LP_ADDRESS,
    MULTISIG_ADDRESS,
    BUSD_BOND_ADDRESS,
    GLBD_BUSD_BOND_ADDRESS
} = require("./addresses_testnet");

async function main() {

    const [deployer] = await ethers.getSigners();
    console.log('Verifying contracts with the account: ' + deployer.address);

    // First block epoch occurs
    const firstEpochBlock = '15269252'; //TODO pendent a posar el bloc del dia 23 (dia del arranque)

    // What epoch will be first epoch
    //const firstEpochNumber = '338';
    const firstEpochNumber = '0'; //TODO pendent a posar el bloc del dia 25 quan (comença a comptar el staking???)

    // How many blocks are in each epoch
    //const epochLengthInBlocks = '2200';
    const epochLengthInBlocks = '20';

    try {
        console.log("VERIFYING BUSD: ", BUSD_ADDRESS);
        //// Verify contract on bsc
        await hre.run("verify:verify", {
            address: BUSD_ADDRESS,
            constructorArguments: [
            ],
        });
        console.log( "BUSD verified: " + BUSD_ADDRESS );
        console.log("Success");
    } catch (err) {
        console.log(err.message);
    }

    try {
        console.log("VERIFYING GLBD_ADDRESS: ", GLBD_ADDRESS);
        //// Verify contract on bsc
        await hre.run("verify:verify", {
            address: GLBD_ADDRESS,
            constructorArguments: [
            ],
        });
        console.log( "GLBD verified: " + GLBD_ADDRESS );
        console.log("Success");
    } catch (err) {
        console.log(err.message);
    }

    try {
        console.log("VERIFYING SGLBD_ADDRESS: ", SGLBD_ADDRESS);
        //// Verify contract on bsc
        await hre.run("verify:verify", {
            address: SGLBD_ADDRESS,
            constructorArguments: [
            ],
        });
        console.log( "SGLBD verified: " + SGLBD_ADDRESS );
        console.log("Success");
    } catch (err) {
        console.log(err.message);
    }

    try {
        console.log("VERIFYING TREASURY_ADDRESS: ", TREASURY_ADDRESS);
        //// Verify contract on bsc
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
        console.log("Success");
    } catch (err) {
        console.log(err.message);
    }

    try {
        console.log("VERIFYING DISTRIBUTOR_ADDRESS: ", DISTRIBUTOR_ADDRESS);
        //// Verify contract on bsc
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
        console.log("Success");
    } catch (err) {
        console.log(err.message);
    }

    try {
        console.log("VERIFYING STAKING_ADDRESS: ", STAKING_ADDRESS);
        //// Verify contract on bsc
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
        console.log("Success");
    } catch (err) {
        console.log(err.message);
    }

    try {
        console.log("VERIFYING STAKING_HELPER_ADDRESS: ", STAKING_HELPER_ADDRESS);
        //// Verify contract on bsc
        await hre.run("verify:verify", {
            address: STAKING_HELPER_ADDRESS,
            constructorArguments: [
                STAKING_ADDRESS,
                GLBD_ADDRESS
            ],
        });
        console.log( "STAKING_HELPER verified: " + STAKING_HELPER_ADDRESS );
        console.log("Success");
    } catch (err) {
        console.log(err.message);
    }

    try {
        console.log("VERIFYING STAKING_WARMUP_ADDRESS: ", STAKING_WARMUP_ADDRESS);
        //// Verify contract on bsc
        await hre.run("verify:verify", {
            address: STAKING_WARMUP_ADDRESS,
            constructorArguments: [
                STAKING_ADDRESS,
                SGLBD_ADDRESS
            ],
        });
        console.log( "STAKING_WARMUP verified: " + STAKING_WARMUP_ADDRESS );
        console.log("Success");
    } catch (err) {
        console.log(err.message);
    }

    try {
        console.log("VERIFYING BONDING_CALCULATOR_ADDRESS: ", BONDING_CALCULATOR_ADDRESS);
        //// Verify contract on bsc
        await hre.run("verify:verify", {
            address: BONDING_CALCULATOR_ADDRESS,
            constructorArguments: [
                GLBD_ADDRESS
            ],
        });
        console.log( "BONDING_CALCULATOR verified: " + BONDING_CALCULATOR_ADDRESS );
        console.log("Success");
    } catch (err) {
        console.log(err.message);
    }

    try {
        console.log("VERIFYING REDEEM_HELPER_ADDRESS: ", REDEEM_HELPER_ADDRESS);
        //// Verify contract on bsc
        await hre.run("verify:verify", {
            address: REDEEM_HELPER_ADDRESS,
            constructorArguments: [
            ],
        });
        console.log( "REDEEM_HELPER verified: " + REDEEM_HELPER_ADDRESS );
        console.log("Success");
    } catch (err) {
        console.log(err.message);
    }

    try {
        console.log("VERIFYING BUSD_BOND_ADDRESS: ", BUSD_BOND_ADDRESS);
        //// Verify contract on bsc
        await hre.run("verify:verify", {
            address: BUSD_BOND_ADDRESS,
            constructorArguments: [
                GLBD_ADDRESS,
                BUSD_ADDRESS,
                TREASURY_ADDRESS,
                MULTISIG_ADDRESS,
                BONDING_CALCULATOR_ADDRESS
            ],
        });
        console.log( "BUSD_BOND verified: " + BUSD_BOND_ADDRESS );
        console.log("Success");
    } catch (err) {
        console.log(err.message);
    }

    try {
        console.log("VERIFYING GLBD_BUSD_BOND_ADDRESS: ", GLBD_BUSD_BOND_ADDRESS);
        //// Verify contract on bsc
        await hre.run("verify:verify", {
            address: GLBD_BUSD_BOND_ADDRESS,
            constructorArguments: [
                GLBD_ADDRESS,
                GLBD_BUSD_LP_ADDRESS,
                TREASURY_ADDRESS,
                MULTISIG_ADDRESS,
                BONDING_CALCULATOR_ADDRESS
            ],
        });
        console.log( "GLBD_BUSD_BOND verified: " + GLBD_BUSD_BOND_ADDRESS );
        console.log("Success");
    } catch (err) {
        console.log(err.message);
    }

    console.log("VERIFICATION SUCCESSFULLY FINISHED");
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})
