const { ethers } = require("hardhat");
const { BigNumber } = require("@ethersproject/bignumber");
const {
    MULTISIG_ADDRESS,
    GLBD_ADDRESS,
    BUSD_ADDRESS,
    TREASURY_ADDRESS,
    REDEEM_HELPER_ADDRESS,
    BONDING_CALCULATOR_ADDRESS,
    STAKING_HELPER_ADDRESS, DEPLOYER_ADDRESS
} = require("./addresses_testnet");

async function main() {

    const [deployer] = await ethers.getSigners();
    let busd;
    let treasury;
    let busdBond;
    let redeemHelper;
    let timeoutPeriod = 10000;

    const BUSD = await ethers.getContractFactory('BEP20Token');

    // BUSD bond BCV
    const busdBondBCV = '40';

    // Bond vesting length in blocks. 33110 ~ 5 days
    const bondVestingLength = '144000';  // TODO Posar 144000 pel deploy a producció (5 dies)

    // Min bond price EN GLBD. 500 = 5$
    const minBondPrice = '1800';

    // Max 2% del supply (de GLBD)
    const maxBondPayout = '2000'

    const bondFee = '10000';

    // Max debt bond can take on
    const maxBUSDBondDebt = '1200000000000000';

    // Initial Bond debt
    const intialBUSDBondDebt = '20000000000000';

    console.log('[Deploying BUSD bond from ', DEPLOYER_ADDRESS,']');

    // Attach BUSD
    console.log("[Attaching BUSD SC]");
    busd = await BUSD.attach(BUSD_ADDRESS);
    console.log("[BUSDt attached]: " + busd.address);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Attach Redeem helper
    console.log("[Attaching redeem helper]");
    const RedeemHelper = await ethers.getContractFactory('RedeemHelper');
    redeemHelper = await RedeemHelper.attach(REDEEM_HELPER_ADDRESS);
    console.log("[Redeem helper attached]: " + redeemHelper.address);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    console.log("[Attaching Treasury SC]");
    const Treasury = await ethers.getContractFactory('GlobalDAOTreasury');
    treasury = await Treasury.attach(TREASURY_ADDRESS);
    console.log("[Treasury attached]: " + treasury.address);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Deploy bonding depository BUSD
    console.log("[Deploy bonding depository BUSD]");
    const BUSDBond = await ethers.getContractFactory('GlobalDAOBondDepository');
    busdBond = await BUSDBond.deploy(GLBD_ADDRESS, BUSD_ADDRESS, TREASURY_ADDRESS, MULTISIG_ADDRESS, '0x0000000000000000000000000000000000000000');
    console.log("[GlobalDAOBondDepository BUSD deployed]: " + busdBond.address);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Queue reserve depository
    console.log("[Queue busdBond as reserve depository]");
    await treasury.queue('0', busdBond.address);
    console.log("[Success]");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Toggle reserve depository
    console.log("[Toggle busdBond as reserve depository]");
    await treasury.toggle('0', busdBond.address, BONDING_CALCULATOR_ADDRESS);
    console.log("[Success]");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Setting BUSD Bond terms
    console.log('Setting BUSD Bond terms');
    await busdBond.initializeBondTerms(busdBondBCV, bondVestingLength, minBondPrice, maxBondPayout, bondFee, maxBUSDBondDebt, intialBUSDBondDebt);
    console.log("[Success]");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Setting staking for BUSD Bond
    console.log('Setting staking for BUSD Bond');
    await busdBond.setStaking(STAKING_HELPER_ADDRESS, true);
    console.log("[Success]");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Adding BUSD Bond to redeem helper
    console.log('Adding BUSD Bond to redeem helper');
    await redeemHelper.addBondContract(busdBond.address);
    console.log("[Success]");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Set adjustment to LP Bond
    console.log("[Set adjustment to BUSD Bond]");
    await busdBond.setAdjustment(false,'1','40','0');
    console.log("[Success]");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    console.log("[BUSD Bond deployed successfully]");
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
    })

