const { ethers } = require("hardhat");
const { BigNumber } = require("@ethersproject/bignumber");
const {
    MULTISIG_ADDRESS,
    GLBD_ADDRESS,
    BUSD_ADDRESS,
    TREASURY_ADDRESS,
    GLBD_BUSD_LP_ADDRESS,
    REDEEM_HELPER_ADDRESS,
    STAKING_HELPER_ADDRESS,
    BONDING_CALCULATOR_ADDRESS,
    ROUTER_BEGLOBAL_ADDRESS,
    DEPLOYER_ADDRESS
} = require("./addresses_localhost");

async function main() {

    const [deployer] = await ethers.getSigners();
    let busd;
    let treasury;
    let glbdbusdLP;
    let busdBond;
    let glbdbusdBond;
    let redeemHelper;
    let timeoutPeriod = 0;

    const BUSD = await ethers.getContractFactory('BEP20Token');

    // GLBD-BUSD bond BCV
    const glbdbusdBondBCV = '75';

    // Bond vesting length in blocks. 33110 ~ 5 days
    const bondVestingLength = '144000';  // TODO Posar 144000 pel deploy a producció (5 dies)

    // Min bond price EN GLBD
    const minBondPrice = '400';

    // Max 2% del supply (de GLBD)
    const maxBondPayout = '2000'

    // DAO fee for bond 10000 = 10%
    const bondFee = '10000';

    // Max debt bond can take on
    const maxGLBDBUSDBondDebt = '120000000000000';

    // Initial Bond debt
    const intialGLBDBUSDBondDebt = '1131577472670';

    let largeApproval = '100000000000000000000000000000000';

    console.log('[Deploying LP bond from ', DEPLOYER_ADDRESS,']');

    // Attach BUSD
    console.log("[Attaching BUSD SC]");
    busd = await BUSD.attach(BUSD_ADDRESS);
    console.log("[BUSDt attached]: " + busd.address);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Attach LP
    const GLBDBUSDLP = await ethers.getContractFactory('PancakeERC20');
    glbdbusdLP = await GLBDBUSDLP.attach(GLBD_BUSD_LP_ADDRESS);
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

    // Deploy bonding depository GLBD-BUSD LP
    console.log("[Deploy bonding depository GLBD-BUSD LP]");
    const GLBDBUSDBond = await ethers.getContractFactory('GlobalDAOBondDepository');
    glbdbusdBond = await GLBDBUSDBond.deploy(GLBD_ADDRESS, GLBD_BUSD_LP_ADDRESS, TREASURY_ADDRESS, MULTISIG_ADDRESS, BONDING_CALCULATOR_ADDRESS);
    console.log("[GlobalDAOBondDepository GLBD-BUSD LP deployed]: " + glbdbusdBond.address);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Setting GLBD-BUSD LP Bond terms
    console.log('Setting GLBD-BUSD LP Bond terms');
    await glbdbusdBond.initializeBondTerms(glbdbusdBondBCV, bondVestingLength, minBondPrice, maxBondPayout, bondFee, maxGLBDBUSDBondDebt, intialGLBDBUSDBondDebt);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Setting staking for GLBD-BUSD LP Bond
    console.log('Setting staking for GLBD-BUSD LP Bond');
    await glbdbusdBond.setStaking(STAKING_HELPER_ADDRESS, true);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // SAdding Bond GLBD-BUSD Bond to redeem helper
    console.log('Adding GLBD-BUSD Bond to redeem helper');
    await redeemHelper.addBondContract(glbdbusdBond.address);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Queue LP Bond Depository as liquidity depositor
    console.log("[Queue LP Bond Depository as liquidity depositor]");
    await treasury.queue('4', glbdbusdBond.address);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Toggle LP Bond Depository as liquidity depositor
    console.log("[Toggle LP Bond Depository as liquidity depositor]");
    await treasury.toggle('4', glbdbusdBond.address, BONDING_CALCULATOR_ADDRESS);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Queue GLBD_BUSD_LP as liquidity token
    console.log("[Queue GLBD_BUSD_LP as liquidity token]");
    await treasury.queue('5', GLBD_BUSD_LP_ADDRESS);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Toggle GLBD_BUSD_LP as liquidity token
    console.log("[Toggle GLBD_BUSD_LP as liquidity token]");
    await treasury.toggle('5', GLBD_BUSD_LP_ADDRESS, BONDING_CALCULATOR_ADDRESS);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Queue GLBD_BUSD_LP as liquidity token
    console.log("[Queue GLBD_BUSD_LP as liquidity token]");
    await treasury.queue('5', GLBD_BUSD_LP_ADDRESS);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Toggle GLBD_BUSD_LP as liquidity token
    console.log("[Toggle GLBD_BUSD_LP as liquidity token]");
    await treasury.toggle('5', GLBD_BUSD_LP_ADDRESS, BONDING_CALCULATOR_ADDRESS);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Approve RouterBeGlobal as spender of LBD-BUSD LP for Deployer
    console.log("[Approve GLBD-BUSD LP to be used in the BeGlobal router by the deployer]");
    await glbdbusdLP.approve(ROUTER_BEGLOBAL_ADDRESS, largeApproval);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Set adjustment to LP Bond
    console.log("[Set adjustment to LP Bond]");
    await glbdbusdBond.setAdjustment(false,'2','40','0');
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    console.log("[LP bond deployed successfully]");
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
    })

