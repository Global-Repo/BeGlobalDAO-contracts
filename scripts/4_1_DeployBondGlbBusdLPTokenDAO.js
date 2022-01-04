const { ethers } = require("hardhat");
const { BigNumber } = require("@ethersproject/bignumber");
const {
    MULTISIG_ADDRESS,
    GLBD_ADDRESS,
    BUSD_ADDRESS,
    TREASURY_ADDRESS,
    GLB_BUSD_LP_ADDRESS,
    REDEEM_HELPER_ADDRESS,
    STAKING_HELPER_ADDRESS,
    BONDING_CALCULATOR_ADDRESS,
    ROUTER_BEGLOBAL_ADDRESS,
    DEPLOYER_ADDRESS
} = require("./addresses_testnet");

async function main() {

    const [deployer] = await ethers.getSigners();
    let busd;
    let treasury;
    let glbbusdLP;
    let glbbusdBond;
    let redeemHelper;
    let timeoutPeriod = 5000;

    // GLB-BUSD bond BCV
    const glbbusdBondBCV = '100';

    // Bond vesting length in blocks. 33110 ~ 5 days
    const bondVestingLength = '600';  // TODO Posar 144000 pel deploy a producció (5 dies)

    // Min bond price EN GLBD
    const minBondPrice = '500';

    // Max bond payout - 1% of totalSupply
    const maxBondPayout = '1000'

    // DAO fee for bond 10000 = 10%
    const bondFee = '20000';

    // Max debt bond can take on
    const maxGLBBUSDBondDebt = '120000000000000';

    // Initial Bond debt
    const intialGLBBUSDBondDebt = '6000000000000';

    let largeApproval = '100000000000000000000000000000000';

    console.log('[Deploying LP bond from ', DEPLOYER_ADDRESS,']');

    // Attach BUSD
    console.log("[Attaching BUSD SC]");
    const BUSD = await ethers.getContractFactory('BEP20Token');
    busd = await BUSD.attach(BUSD_ADDRESS);
    console.log("[BUSDt attached]: " + busd.address);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    const GLBBUSDLP = await ethers.getContractFactory('PancakeERC20');
    glbbusdLP = await GLBBUSDLP.attach(GLB_BUSD_LP_ADDRESS);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Attach Redeem helper
    console.log("[Attaching redeem helper]");
    const RedeemHelper = await ethers.getContractFactory('RedeemHelper');
    redeemHelper = await RedeemHelper.attach(REDEEM_HELPER_ADDRESS);
    console.log("[Redeem helper attached]: " + redeemHelper.address);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Attach treasury
    console.log("[Attaching Treasury SC]");
    const Treasury = await ethers.getContractFactory('GlobalDAOTreasury');
    treasury = await Treasury.attach(TREASURY_ADDRESS);
    console.log("[Treasury attached]: " + treasury.address);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Deploy bonding depository GLB-BUSD LP
    console.log("[Deploy bonding depository GLB-BUSD LP]");
    const GLBBUSDBond = await ethers.getContractFactory('GlobalDAOBondDepository');
    glbbusdBond = await GLBBUSDBond.deploy(GLBD_ADDRESS, GLB_BUSD_LP_ADDRESS, TREASURY_ADDRESS, MULTISIG_ADDRESS, BONDING_CALCULATOR_ADDRESS);
    console.log("[GlobalDAOBondDepository GLB-BUSD LP deployed]: " + glbbusdBond.address);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Setting GLB-BUSD LP Bond terms
    console.log('Setting GLB-BUSD LP Bond terms');
    await glbbusdBond.initializeBondTerms(glbbusdBondBCV, bondVestingLength, minBondPrice, maxBondPayout, bondFee, maxGLBBUSDBondDebt, intialGLBBUSDBondDebt);
    console.log("[Success]");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Setting staking for GLB-BUSD LP Bond
    console.log('Setting staking for GLB-BUSD LP Bond');
    await glbbusdBond.setStaking(STAKING_HELPER_ADDRESS, true);
    console.log("[Success]");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // SAdding Bond GLB-BUSD Bond to redeem helper
    console.log('Adding GLB-BUSD Bond to redeem helper');
    await redeemHelper.addBondContract(glbbusdBond.address);
    console.log("[Success]");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Queue LP Bond Depository as liquidity depositor
    console.log("[Queue LP Bond Depository as liquidity depositor]");
    await treasury.queue('4', glbbusdBond.address);
    console.log("[Success]");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Toggle LP Bond Depository as liquidity depositor
    console.log("[Toggle LP Bond Depository as liquidity depositor]");
    await treasury.toggle('4', glbbusdBond.address, BONDING_CALCULATOR_ADDRESS);
    console.log("[Success]");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Queue GLB_BUSD_LP as liquidity token
    console.log("[Queue GLB_BUSD_LP as liquidity token]");
    await treasury.queue('5', GLB_BUSD_LP_ADDRESS);
    console.log("[Success]");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Toggle GLB_BUSD_LP as liquidity token
    console.log("[Toggle GLB_BUSD_LP as liquidity token]");
    await treasury.toggle('5', GLB_BUSD_LP_ADDRESS, BONDING_CALCULATOR_ADDRESS);
    console.log("[Success]");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Queue GLB_BUSD_LP as liquidity token
    console.log("[Queue GLB_BUSD_LP as liquidity token]");
    await treasury.queue('5', GLB_BUSD_LP_ADDRESS);
    console.log("[Success]");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Toggle GLB_BUSD_LP as liquidity token
    console.log("[Toggle GLB_BUSD_LP as liquidity token]");
    await treasury.toggle('5', GLB_BUSD_LP_ADDRESS, BONDING_CALCULATOR_ADDRESS);
    console.log("[Success]");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Approve RouterBeGlobal as spender of LBD-BUSD LP for Deployer
    console.log("[Approve GLB-BUSD LP to be used in the BeGlobal router by the deployer]");
    await glbbusdLP.approve(ROUTER_BEGLOBAL_ADDRESS, largeApproval);
    console.log("[Success]");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    console.log("[LP bond deployed successfully]");
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
    })

