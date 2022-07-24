const { ethers } = require("hardhat");
const {
    GLBD_ADDRESS,
    BUSD_ADDRESS,
    FEE_ADDRESS,
    EPOCLENGHTINBLOCKS,
    FIRSTBLOCKEPOCH,
    FIRSTEPOCHNUMBER,
    INIT_INDEX,
    DEPLOYER_ADDRESS,
    SGLBD_ADDRESS_V2,
    STAKING_WITH_FEE_ADDRESS,
    STAKING_HELPER_ADDRESS_V2,
    STAKING_WARMUP_ADDRESS_V2
} = require("./addresses_testnet");

async function main() {

    const [deployer] = await ethers.getSigners();
    let sGLBD;
    let timeoutPeriod = 3000;

    console.log("[Setting stuff up from " + DEPLOYER_ADDRESS.toString() + "]"); // MODIFICAR PEL REAL!!!!!!!!!!!!!!!!!!!!!

    const sGLBDT = await ethers.getContractFactory('sGlobalDAOToken');

    console.log("[Initializing sGLBD]");

    // Attach sGLBD
    sGLBD = await sGLBDT.attach(SGLBD_ADDRESS_V2);
    console.log("[sGLBD attached]: " + sGLBD.address);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    await sGLBD.initialize(STAKING_WITH_FEE_ADDRESS);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    console.log("[Setting index up]");
    await sGLBD.setIndex(INIT_INDEX);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    console.log("[Verifying contracts]");

    try {
        console.log("[[V] BUSD] ", BUSD_ADDRESS);
        await hre.run("verify:verify", {
            address: BUSD_ADDRESS,
            constructorArguments: [
            ],
        });
        console.log("Success");
    } catch (err) {
        console.log(err.message);
    }

    try {
        console.log("[[V] GLBD] ", GLBD_ADDRESS);
        await hre.run("verify:verify", {
            address: GLBD_ADDRESS,
            constructorArguments: [
            ],
        });
        console.log("Success");
    } catch (err) {
        console.log(err.message);
    }

    try {
        console.log("[[V] SGLBD] ", SGLBD_ADDRESS_V2);
        await hre.run("verify:verify", {
            address: SGLBD_ADDRESS_V2,
            constructorArguments: [
            ],
        });
        console.log("Success");
    } catch (err) {
        console.log(err.message);
    }

    try {
        console.log("[[V] Staking] ", STAKING_WITH_FEE_ADDRESS);
        await hre.run("verify:verify", {
            address: STAKING_WITH_FEE_ADDRESS,
            constructorArguments: [
                GLBD_ADDRESS,
                SGLBD_ADDRESS_V2,
                FEE_ADDRESS,
                EPOCLENGHTINBLOCKS,
                FIRSTEPOCHNUMBER,
                FIRSTBLOCKEPOCH
            ],
        });
        console.log("Success");
    } catch (err) {
        console.log(err.message);
    }

    try {
        console.log("[[V] Staking Helper] ", STAKING_HELPER_ADDRESS_V2);
        await hre.run("verify:verify", {
            address: STAKING_HELPER_ADDRESS_V2,
            constructorArguments: [
                STAKING_WITH_FEE_ADDRESS,
                GLBD_ADDRESS
            ],
        });
        console.log("Success");
    } catch (err) {
        console.log(err.message);
    }

    try {
        console.log("[[V] Staking Warm up] ", STAKING_WARMUP_ADDRESS_V2);
        await hre.run("verify:verify", {
            address: STAKING_WARMUP_ADDRESS_V2,
            constructorArguments: [
                STAKING_WITH_FEE_ADDRESS,
                SGLBD_ADDRESS_V2
            ],
        });
        console.log("Success");
    } catch (err) {
        console.log(err.message);
    }

    console.log("[Verification sucessfull]");
}


main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
    })

