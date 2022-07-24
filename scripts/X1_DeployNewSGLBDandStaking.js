const { ethers } = require("hardhat");
const {
    GLBD_ADDRESS,
    BUSD_ADDRESS,
    FEE_ADDRESS,
    EPOCLENGHTINBLOCKS,
    FIRSTBLOCKEPOCH,
    FIRSTEPOCHNUMBER,
    DEPLOYER_ADDRESS,
    STAKING_WITH_FEE_ADDRESS
} = require("./addresses_testnet");

async function main() {

    const [deployer] = await ethers.getSigners();
    let GLBD;
    let sGLBD;
    let busd;
    let stakingWarmup;
    let staking;
    let stakingHelper;
    let deployBUSD = false;
    let deployGLBD = false;
    let deploysGLBD = true;
    let deployStaking = true;
    let deployWarmUp = true;
    let deployStakingHelper = true;
    let timeoutPeriod = 3000;

    const GLBDT = await ethers.getContractFactory('GlobalDAOToken');
    const sGLBDT = await ethers.getContractFactory('sGlobalDAOToken');
    const BUSD = await ethers.getContractFactory('BEP20Token');
    const stakingT = await ethers.getContractFactory('StakingWithEarlyPenaltyFee');
    const stakingHelperT = await ethers.getContractFactory('StakingHelper');
    const stakingWarmupT = await ethers.getContractFactory('StakingWarmup');

    console.log("[Deploying from " + DEPLOYER_ADDRESS.toString() + "]");

    if (deployBUSD) {
        // Deploy BUSD
        busd = await BUSD.deploy();
        console.log("[BUSD_ADDRESS]:'" + busd.address);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));
    } else {
        // Attach BUSD
        busd = await BUSD.attach(BUSD_ADDRESS);
        console.log("[BUSD attached]: " + busd.address);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));
    }

    console.log("[BUSD balance]: " + await busd.balanceOf(DEPLOYER_ADDRESS));

    if (deployGLBD) {
        // Deploy GLBD
        GLBD = await GLBDT.deploy();
        console.log("[GLBD deployed]: '" + GLBD.address);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));
    } else {
        // Attach GLBD
        GLBD = await GLBDT.attach(GLBD_ADDRESS);
        console.log("[GLBD attached]: " + GLBD.address);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));
    }
    console.log("[GLBD balance]: " + await GLBD.balanceOf(DEPLOYER_ADDRESS));

    if (deploysGLBD) {
        // Deploy sGLBD
        sGLBD = await sGLBDT.deploy();
        console.log("[sGLBD deployed]: " + sGLBD.address);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));
    } else {
        // Attach sGLBD
        sGLBD = await sGLBDT.attach(SGLBD_ADDRESS_V2);
        console.log("[sGLBD attached]: " + sGLBD.address);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));
    }
    console.log("[sGLBD balance]: " + await sGLBD.balanceOf(DEPLOYER_ADDRESS));

    if (deployStaking) {
        // Deploy Staking
        staking = await stakingT.deploy(GLBD.address, sGLBD.address, FEE_ADDRESS, EPOCLENGHTINBLOCKS, FIRSTEPOCHNUMBER, FIRSTBLOCKEPOCH);
        console.log("[Staking deployed]: " + staking.address);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));
    } else {
        // Attach Staking
        staking = await stakingT.attach(STAKING_WITH_FEE_ADDRESS);
        console.log("[Staking attached]: " + staking.address);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));
    }

    if (deployStakingHelper) {
        // Deploy StakingHelper
        stakingHelper = await stakingHelperT.deploy(staking.address, GLBD.address);
        console.log("[StakingHelper deployed]: " + stakingHelper.address);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));
    } else {
        // Attach StakingHelper
        stakingHelper = await stakingHelperT.attach(STAKING_HELPER_ADDRESS_V2);
        console.log("[StakingHelper attached]: " + stakingHelper.address);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));
    }

    if (deployWarmUp) {
        // Deploy WarmUp
        stakingWarmup = await stakingWarmupT.deploy(staking.address, sGLBD.address);
        console.log("[StakingWarmup deployed]: " + stakingWarmup.address);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));
    } else {
        // Attach WarmUp
        stakingWarmup = await stakingWarmupT.attach(STAKING_WARMUP_ADDRESS_V2);
        console.log("[StakingWarmup attached]: " + stakingWarmup.address);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));
    }

    console.log("    // FALTA FER QUE PUGUIN TREURE LA PASTA I ENVIARLI A UN ALTRE LLOC!!!!!!!!! SENSE PAGAR FEE!!!!!!! CMO HO FEM?!?!?!?!?! I FER QUE EL BOND PUGUI ANAR PER SOTA DE 1$!!!");
    console.log("    // Pq amb un redeploy modificant alguna cosa pq no sigui un contracte exacte funciona i amb el mateix no funciona?");
    console.log("[Deploy sucessfull]");
}


main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
    })

