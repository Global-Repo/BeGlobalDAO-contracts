const { ethers } = require("hardhat");
const { BigNumber } = require("@ethersproject/bignumber");
const {
    ROUTER_BEGLOBAL_ADDRESS,
    DEPLOYER_ADDRESS,
    GLBD_ADDRESS,
    SGLBD_ADDRESS_NOU,
    BUSD_ADDRESS,
    TREASURY_ADDRESS,
    STAKING_ADDRESS_NOU,
    DISTRIBUTOR_ADDRESS,
    STAKING_WARMUP_ADDRESS_NOU,
    BONDING_CALCULATOR_ADDRESS
} = require("./addresses_testnet");

const TOKEN_DECIMALS_LITTLE = 9;
const BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_LITTLE = BigNumber.from(10).pow(TOKEN_DECIMALS_LITTLE);

const TOKEN_DECIMALS_BIG = 18;
const BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG = BigNumber.from(10).pow(TOKEN_DECIMALS_BIG);

let bep20Amount_LITTLE = function (amount) {
    return BigNumber.from(amount).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_LITTLE);
}

let bep20Amount_BIG = function (amount) {
    return BigNumber.from(amount).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG);
}

const INITIAL_SUPPLY = BigNumber.from(60000).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_LITTLE);

async function main() {

    const [deployer] = await ethers.getSigners();
    let GLBD;
    let sGLBD;
    let busd;
    let treasury;
    let distributor;
    let staking;
    let timeoutPeriod = 3000;
    let largeApproval = '1000000000000000000000000000000000000';

    const GLBDT = await ethers.getContractFactory('GlobalDAOToken');
    const sGLBDT = await ethers.getContractFactory('sGlobalDAOToken');
    const BUSD = await ethers.getContractFactory('BEP20Token');

    // Initial reward rate for epoch. 5000 = 0.5%. Used for staking.
    let initialRewardRateForEpoch = '50'; //META ho te a 435 en un inici

    // Initial staking index
    const initialIndex = '31';

    console.log("[Set up]");
/*
    // Attach BUSD
    busd = await BUSD.attach(BUSD_ADDRESS);
    console.log("[BUSDt attached]: " + busd.address);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Attach GLBD
    GLBD = await GLBDT.attach(GLBD_ADDRESS);
    console.log("[GLBD attached]: " + GLBD_ADDRESS);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));
*/
    // Attach sGLBD
    sGLBD = await sGLBDT.attach(SGLBD_ADDRESS_NOU);
    console.log("[sGLBD attached]: " + SGLBD_ADDRESS_NOU);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));
/*
    // Attach treasury
    const Treasury = await ethers.getContractFactory('GlobalDAOTreasury');
    treasury = await Treasury.attach(TREASURY_ADDRESS);
    console.log("[Treasury attached]: " + treasury.address);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));
*/
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

    // set warmup to unstake rewards
    await staking.setWarmup(0);
    console.log("[WarmUp set to 2 epochs]");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));
/*
    console.log("[Set deployer as a vault for GLBD Token]");
    await GLBD.setVault(DEPLOYER_ADDRESS);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Mint GLBD
    console.log("[Deployer mints (extra?) 60000 GLBD]");
    await GLBD.mint(DEPLOYER_ADDRESS, INITIAL_SUPPLY);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));
*/
    // Initialize sOHM
    console.log("[Initialize sOHM]");
    await sGLBD.initialize(STAKING_ADDRESS_NOU);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));
/*
    // Set Treasury as GLBD vault
    console.log("[Set Treasury as GLBD vault]");
    await GLBD.setVault(TREASURY_ADDRESS);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Approve treasury as spender of GLB for Deployer
    console.log("[Approve GLBD to be used in the treasury by the deployer]");
    await GLBD.approve(TREASURY_ADDRESS, largeApproval);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Toggle deployer as reserve depositor
    console.log("[Queue deployer as reserve depositor]");
    await treasury.queue('0', DEPLOYER_ADDRESS);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Toggle deployer as reserve depositor
    console.log("[Toggle deployer as reserve depositor]");
    await treasury.toggle('0', DEPLOYER_ADDRESS, DEPLOYER_ADDRESS);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Approve BUSDt to be used in the treasury by the deployer
    console.log("[Approve BUSDt to be used in the treasury by the deployer]");
    await busd.approve(TREASURY_ADDRESS, largeApproval);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Depositing in the treasury from the deployer
    console.log("[Deposit 35.000 BUSD to treasury]");
    await treasury.deposit(bep20Amount_BIG(10000), BUSD_ADDRESS, bep20Amount_LITTLE(10000));
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));
*/
    // Set index
    console.log("[Set index]");
    await sGLBD.setIndex(initialIndex);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));
/*
    // Queue reward manager
    console.log("[Queue reward manager]");
    await treasury.queue('8', DISTRIBUTOR_ADDRESS);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Toggle reward manager
    console.log("[Toggle reward manager]");
    await treasury.toggle('8', DISTRIBUTOR_ADDRESS, BONDING_CALCULATOR_ADDRESS);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));
*/
    console.log("[Add staking contract as distributor recipient]");
    await distributor.addRecipient(STAKING_ADDRESS, initialRewardRateForEpoch);
    console.log("[Success] InitialRewardRateForEpoch: ", initialRewardRateForEpoch, ".");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    console.log("[Add staking contract as distributor recipient]");
    await distributor.removeRecipient(0, "0xA4dCD9B6842b7B9B8e5bC430070468D811CF722E");
    console.log("[Success] removeRecipient: 0xA4dCD9B6842b7B9B8e5bC430070468D811CF722E");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Staking SetContract to distributor. Set who to call to Rebase()
    console.log("[Staking SetContract to distributor. Set who to call to Rebase()]");
    await staking.setContract('0', DISTRIBUTOR_ADDRESS);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Staking SetContract to StakingWarmUp
    console.log("[Staking SetContract to StakingWarmUp]");
    await staking.setContract('1', STAKING_WARMUP_ADDRESS_NOU);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));
/*
    // Approve RouterBeGlobal as spender of GLB for Deployer
    console.log("[Approve GLBD to be used in the BeGlobal router by the deployer]");
    await GLBD.approve(ROUTER_BEGLOBAL_ADDRESS, largeApproval);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Approve BUSDt to be used in the BeGlobal router by the deployer
    console.log("[Approve BUSDt to be used in the BeGlobal router by the deployer]");
    await busd.approve(ROUTER_BEGLOBAL_ADDRESS, largeApproval);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));
*/
    console.log("[Set up successful]");
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
    })

