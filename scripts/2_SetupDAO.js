const { ethers } = require("hardhat");
const { BigNumber } = require("@ethersproject/bignumber");
const {
    MULTISIG_ADDRESS,
    ROUTER_BEGLOBAL_ADDRESS,
    DEPLOYER_ADDRESS,
    GLBD_ADDRESS,
    SGLBD_ADDRESS,
    BUSD_ADDRESS,
    TREASURY_ADDRESS,
    STAKING_ADDRESS,
    FACTORY_ADDRESS,
    GLBD_BUSD_LP_ADDRESS,
    DISTRIBUTOR_ADDRESS,
    STAKING_HELPER_ADDRESS,
    STAKING_WARMUP_ADDRESS,
    BONDING_CALCULATOR_ADDRESS,
    REDEEM_HELPER_ADDRESS
} = require("./addresses_testnet");

const TOKEN_DECIMALS = 9;
const BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER = BigNumber.from(10).pow(TOKEN_DECIMALS);
const INITIAL_SUPPLY = BigNumber.from(100000).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER);

async function main() {

    const [deployer] = await ethers.getSigners();
    let GLBD;
    let sGLBD;
    let busd;
    let factory;
    let router;
    let treasury;
    let distributor;
    let glbdbusdLP;
    let stakingWarmup;
    let staking;
    let stakingHelper;
    let globalDAOBondingCalculator;
    let busdBond;
    let redeemHelper;
    let SetGLBDVaultandMint10GLBD = true;
    let timeoutPeriod = 5000;
    let largeApproval = '100000000000000000000000000000000';

    const GLBDT = await ethers.getContractFactory('GlobalDAOToken');
    const sGLBDT = await ethers.getContractFactory('sGlobalDAOToken');
    const BUSD = await ethers.getContractFactory('BEP20Token');

    // Initial reward rate for epoch. 5000 = 0.5%. Used for staking.
    let initialRewardRateForEpoch = '1250'; //META ho te a 435 en un inici

    // Initial staking index
    const initialIndex = '10';

    // Attach factory
    console.log("[Attaching factory SC]");
    const Factory = await ethers.getContractFactory("Factory");
    factory = await Factory.attach(FACTORY_ADDRESS);
    console.log("[Factory attached]: " + factory.address);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Attach Router
    console.log("[Attaching Router SC]");
    const Router = await ethers.getContractFactory("Router");
    router = await Router.attach(ROUTER_BEGLOBAL_ADDRESS);
    console.log("[Router attached]: " + router.address);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Attach BUSD
    console.log("[Attaching BUSD SC]");
    busd = await BUSD.attach(BUSD_ADDRESS);
    console.log("[BUSDt attached]: " + busd.address);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    console.log('Deploying contracts. Deployer account: ' + deployer.address + '. Multisig account: ' + MULTISIG_ADDRESS + '.');

    // Attach GLBD
    console.log("[Attaching GLBD SC]");
    GLBD = await GLBDT.attach(GLBD_ADDRESS);
    console.log("[GLBD attached]: " + GLBD_ADDRESS);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Attach sGLBD
    console.log("[Attaching sGLBD SC]");
    sGLBD = await sGLBDT.attach(SGLBD_ADDRESS);
    console.log("[sGLBD attached]: " + SGLBD_ADDRESS);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    const GLBDBUSDLP = await ethers.getContractFactory('PancakeERC20');
    glbdbusdLP = await GLBDBUSDLP.attach(GLBD_BUSD_LP_ADDRESS);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Attach treasury
    console.log("[Attaching Treasury SC]");
    const Treasury = await ethers.getContractFactory('GlobalDAOTreasury');
    treasury = await Treasury.attach(TREASURY_ADDRESS);
    console.log("[Treasury attached]: " + treasury.address);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Attach bonding calculator
    console.log("[Attaching bonding calculator]");
    const GlobalDAOBondingCalculator = await ethers.getContractFactory('GlobalDAOBondingCalculator');
    globalDAOBondingCalculator = await GlobalDAOBondingCalculator.attach(BONDING_CALCULATOR_ADDRESS);
    console.log("[GlobalDAOBondingCalculator attached]: " + globalDAOBondingCalculator.address);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Attach Redeem helper
    console.log("[Attaching redeem helper]");
    const RedeemHelper = await ethers.getContractFactory('RedeemHelper');
    redeemHelper = await RedeemHelper.attach(REDEEM_HELPER_ADDRESS);
    console.log("[Redeem helper attached]: " + redeemHelper.address);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Attach distributor
    console.log("[Attaching distributor SC]");
    const Distributor = await ethers.getContractFactory('Distributor');
    distributor = await Distributor.attach(DISTRIBUTOR_ADDRESS);
    console.log("[Distributor attached]: " + distributor.address);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Attach Staking
    console.log("[Attaching Staking]");
    const Staking = await ethers.getContractFactory('GlobalDAOStaking');
    staking = await Staking.attach(STAKING_ADDRESS);
    console.log("[Staking attached]: " + staking.address);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Attach StakingHelper
    console.log("[Attaching StakingHelper]");
    const StakingHelper = await ethers.getContractFactory('StakingHelper');
    stakingHelper = await StakingHelper.attach(STAKING_HELPER_ADDRESS);
    console.log("[StakingHelper attached]: " + stakingHelper.address);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Attach WarmUp
    console.log("[Attaching WarmUp]");
    const StakingWarmup = await ethers.getContractFactory('StakingWarmup');
    stakingWarmup = await StakingWarmup.attach(STAKING_WARMUP_ADDRESS);
    console.log("[WarmUp attached]: " + stakingWarmup.address);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // set warmup to unstake rewards
    staking.setWarmup(0); // TODO, posar un 2 per deploy a mainnet final
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // set deployer as GLBD vault and mint 10 GLBD.
    if (SetGLBDVaultandMint10GLBD)
        await setGLBDVaultandMint10GLBD(GLBD);

    // Initialize sOHM
    console.log("[Initialize sOHM]");
    await sGLBD.initialize(staking.address);
    console.log("[Success]");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Set index
    console.log("[Set index]");
    await sGLBD.setIndex(initialIndex);
    console.log("[Success]");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Queue reward manager
    console.log("[Queue reward manager]");
    await treasury.queue('8', distributor.address);
    console.log("[Success]");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Toggle reward manager
    console.log("[Toggle reward manager]");
    await treasury.toggle('8', distributor.address, globalDAOBondingCalculator.address);
    console.log("[Success]");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Queue reserve depository
    console.log("[Queue busdBond as reserve depository]");
    await treasury.queue('0', busdBond.address);
    console.log("[Success]");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Toggle reserve depository
    console.log("[Toggle busdBond as reserve depository]");
    await treasury.toggle('0', busdBond.address, globalDAOBondingCalculator.address);
    console.log("[Success]");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Queue deployer as reserve depositor
    console.log("[Queue deployer as reserve depositor]");
    await treasury.queue('0', deployer.address);
    console.log("[Success]");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Toggle deployer as reserve depositor
    console.log("[Toggle deployer as reserve depositor]");
    await treasury.toggle('0', deployer.address, globalDAOBondingCalculator.address);
    console.log("[Success]");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Add staking contract as distributor recipient. Show rebase/epoch. 5000 = 0.5%.
    console.log("[Add staking contract as distributor recipient. Show rebase/epoch. 5000 = 0.5%]");
    await distributor.addRecipient(staking.address, initialRewardRateForEpoch);
    console.log("[Success] InitialRewardRateForEpoch: ", initialRewardRateForEpoch, ".");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Staking SetContract to distributor. Set who to call to Rebase()
    console.log("[Staking SetContract to distributor. Set who to call to Rebase()]");
    await staking.setContract('0', distributor.address);
    console.log("[Success]");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Staking SetContract to StakingWarmUp
    console.log("[Staking SetContract to StakingWarmUp]");
    await staking.setContract('1', stakingWarmup.address);
    console.log("[Success]");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Approve RouterBeGlobal as spender of GLB for Deployer
    console.log("[Approve GLBD to be used in the BeGlobal router by the deployer]");
    await GLBD.approve(router.address, largeApproval);
    console.log("[Success]");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Approve BUSDt to be used in the BeGlobal router by the deployer
    console.log("[Approve BUSDt to be used in the BeGlobal router by the deployer]");
    await busd.approve(router.address, largeApproval);
    console.log("[Success]");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    console.log("DEPLOYMENT SUCCESSFULLY FINISHED -> copy BUSD, GLBD & sGLBD addresses and addLiquidity to the router");
}

let setGLBDVaultandMint10GLBD = async function (GLBD){
    // Set deployer as a vault for GLBD Token
    console.log("[Set deployer as a vault for GLBD Token]");
    await GLBD.setVault(DEPLOYER_ADDRESS);
    console.log("[Success]");
    await new Promise(r => setTimeout(() => r(), 5000));

    console.log(await GLBD.vault())

    // Mint 100000 GLBD
    console.log("[Deployer mints (extra?) 200000 GLBD]");
    await GLBD.mint(DEPLOYER_ADDRESS, INITIAL_SUPPLY);
    console.log("[Success]");
    await new Promise(r => setTimeout(() => r(), 5000));
}


main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
    })

