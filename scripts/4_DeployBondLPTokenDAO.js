const { ethers } = require("hardhat");
const { BigNumber } = require("@ethersproject/bignumber");
const {
    MULTISIG_ADDRESS,
    GLBD_ADDRESS,
    SGLBD_ADDRESS,
    BUSD_ADDRESS,
    TREASURY_ADDRESS,
    GLBD_BUSD_LP_ADDRESS,
    REDEEM_HELPER_ADDRESS, BONDING_CALCULATOR_ADDRESS
} = require("./addresses_testnet");

const TOKEN_DECIMALS = 9;
const BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER = BigNumber.from(10).pow(TOKEN_DECIMALS);

async function main() {

    const [deployer] = await ethers.getSigners();
    let GLBD;
    let sGLBD;
    let busd;
    let treasury;
    let glbdbusdLP;
    let stakingHelper;
    let globalDAOBondingCalculator;
    let busdBond;
    let glbdbusdBond;
    let redeemHelper;
    let timeoutPeriod = 5000;

    const GLBDT = await ethers.getContractFactory('GlobalDAOToken');
    const sGLBDT = await ethers.getContractFactory('sGlobalDAOToken');
    const BUSD = await ethers.getContractFactory('BEP20Token');

    // GLBD-BUSD bond BCV
    const glbdbusdBondBCV = '100';

    // Bond vesting length in blocks. 33110 ~ 5 days
    const bondVestingLength = '600';  // TODO Posar 144000 pel deploy a producció (5 dies)

    // Min bond price EN GLBD
    const minBondPrice = '500';

    // Max bond payout - 1% of totalSupply
    const maxBondPayout = '1000'

    // DAO fee for bond 10000 = 10%
    const bondFee = '20000';

    // Max debt bond can take on
    const maxGLBDBUSDBondDebt = '120000000000000';

    // Initial Bond debt
    const intialGLBDBUSDBondDebt = '6000000000000';

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

    // Attach bonding calculator
    console.log("[Attaching bonding calculator]");
    const GlobalDAOBondingCalculator = await ethers.getContractFactory('GlobalDAOBondingCalculator');
    globalDAOBondingCalculator = await GlobalDAOBondingCalculator.attach(BONDING_CALCULATOR_ADDRESS);
    console.log("[GlobalDAOBondingCalculator attached]: " + globalDAOBondingCalculator.address);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Deploy bonding depository BUSD
    console.log("[Deploy bonding depository BUSD]");
    const BUSDBond = await ethers.getContractFactory('GlobalDAOBondDepository');
    busdBond = await BUSDBond.deploy(GLBD.address, busd.address, treasury.address, MULTISIG_ADDRESS, '0x0000000000000000000000000000000000000000');
    console.log("[GlobalDAOBondDepository BUSD deployed]: " + busdBond.address);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Deploy bonding depository GLBD-BUSD LP
    console.log("[Deploy bonding depository GLBD-BUSD LP]");
    const GLBDBUSDBond = await ethers.getContractFactory('GlobalDAOBondDepository');
    glbdbusdBond = await GLBDBUSDBond.deploy(GLBD.address, glbdbusdLP.address, treasury.address, MULTISIG_ADDRESS, globalDAOBondingCalculator.address);
    console.log("[GlobalDAOBondDepository GLBD-BUSD LP deployed]: " + glbdbusdBond.address);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Setting GLBD-BUSD LP Bond terms
    console.log('Setting GLBD-BUSD LP Bond terms');
    await glbdbusdBond.initializeBondTerms(glbdbusdBondBCV, bondVestingLength, minBondPrice, maxBondPayout, bondFee, maxGLBDBUSDBondDebt, intialGLBDBUSDBondDebt);
    console.log("[Success]");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Setting staking for GLBD-BUSD LP Bond
    console.log('Setting staking for GLBD-BUSD LP Bond');
    await glbdbusdBond.setStaking(stakingHelper.address, true);
    console.log("[Success]");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // SAdding Bond GLBD-BUSD Bond to redeem helper
    console.log('Adding GLBD-BUSD Bond to redeem helper');
    await redeemHelper.addBondContract(glbdbusdBond.address);
    console.log("[Success]");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));


    // Queue LP Bond Depository as liquidity depositor
    console.log("[Queue LP Bond Depository as liquidity depositor]");
    await treasury.queue('4', glbdbusdBond.address);
    console.log("[Success]");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Toggle LP Bond Depository as liquidity depositor
    console.log("[Toggle LP Bond Depository as liquidity depositor]");
    await treasury.toggle('4', glbdbusdBond.address, globalDAOBondingCalculator.address);
    console.log("[Success]");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Queue GLBD_BUSD_LP as liquidity token
    console.log("[Queue GLBD_BUSD_LP as liquidity token]");
    await treasury.queue('5', glbdbusdLP.address);
    console.log("[Success]");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Toggle GLBD_BUSD_LP as liquidity token
    console.log("[Toggle GLBD_BUSD_LP as liquidity token]");
    await treasury.toggle('5', glbdbusdLP.address, globalDAOBondingCalculator.address);
    console.log("[Success]");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Queue GLBD_BUSD_LP as liquidity token
    console.log("[Queue GLBD_BUSD_LP as liquidity token]");
    await treasury.queue('5', glbdbusdLP.address);
    console.log("[Success]");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Toggle GLBD_BUSD_LP as liquidity token
    console.log("[Toggle GLBD_BUSD_LP as liquidity token]");
    await treasury.toggle('5', glbdbusdLP.address, globalDAOBondingCalculator.address);
    console.log("[Success]");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Approve RouterBeGlobal as spender of LBD-BUSD LP for Deployer
    console.log("[Approve GLBD-BUSD LP to be used in the BeGlobal router by the deployer]");
    await glbdbusdLP.approve(router.address, largeApproval);
    console.log("[Success]");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    console.log("DEPLOYMENT SUCCESSFULLY FINISHED -> copy BUSD, GLBD & sGLBD addresses and addLiquidity to the router");
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
    })

