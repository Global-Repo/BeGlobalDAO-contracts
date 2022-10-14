const { ethers } = require("hardhat");
const { BigNumber } = require("@ethersproject/bignumber");
const {
    SGLBD_ADDRESS_NOU,
    STAKING_ADDRESS_NOU,
    STAKING_ADDRESS,
    DISTRIBUTOR_ADDRESS,
    STAKING_WARMUP_ADDRESS_NOU
} = require("./addresses_mainnet");

async function main() {

    const [deployer] = await ethers.getSigners();
    let sGLBD;
    let distributor;
    let staking;
    let timeoutPeriod = 3000;

    const sGLBDT = await ethers.getContractFactory('sGlobalDAOToken');

    // Initial reward rate for epoch. 5000 = 0.5%. Used for staking.
    let initialRewardRateForEpoch = '50'; //META ho te a 435 en un inici

    // Initial staking index
    const initialIndex = '31';

    console.log("[Set up]");

    // Attach sGLBD
    sGLBD = await sGLBDT.attach(SGLBD_ADDRESS_NOU);
    console.log("[sGLBD attached]: " + SGLBD_ADDRESS_NOU);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Attach distributor
    const Distributor = await ethers.getContractFactory('Distributor');
    distributor = await Distributor.attach(DISTRIBUTOR_ADDRESS);
    console.log("[Distributor attached]: " + distributor.address);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Attach Staking
    const Staking = await ethers.getContractFactory('StakingWithEarlyPenaltyFee');
    staking = await Staking.attach(STAKING_ADDRESS_NOU);
    console.log("[Staking attached]: " + staking.address);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    /*
    // set warmup to unstake rewards
    await staking.setWarmup(0);
    console.log("[WarmUp set to 0 epochs]");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));


    // Initialize sOHM
    console.log("[Initialize sOHM]");
    await sGLBD.initialize(STAKING_ADDRESS_NOU);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Set index
    console.log("[Set index]");
    await sGLBD.setIndex(initialIndex);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    console.log("[Add staking contract as distributor recipient]");
    await distributor.addRecipient(STAKING_ADDRESS_NOU, initialRewardRateForEpoch);
    console.log("[Success] InitialRewardRateForEpoch: ", initialRewardRateForEpoch, ".");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    console.log("[Add staking contract as distributor recipient]");
    await distributor.removeRecipient(0, STAKING_ADDRESS);
    console.log("[Success] removeRecipient: "+STAKING_ADDRESS);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Staking SetContract to distributor. Set who to call to Rebase()
    console.log("[Staking SetContract to distributor. Set who to call to Rebase()]");
    await staking.setContract('0', DISTRIBUTOR_ADDRESS);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));
*/
    // Staking SetContract to StakingWarmUp
    console.log("[Staking SetContract to StakingWarmUp]");
    await staking.setContract('1', STAKING_WARMUP_ADDRESS_NOU);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));
 /*
    console.log("[Set up successful]");
    */
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
    })

