const { ethers } = require("hardhat");
const {
    DEPLOYER_ADDRESS,
    GLBD_ADDRESS,
    SGLBD_ADDRESS,
    TREASURY_ADDRESS,
    DISTRIBUTOR_ADDRESS,
    STAKING_ADDRESS,
    STAKING_HELPER_ADDRESS,
    STAKING_WARMUP_ADDRESS,
    BONDING_CALCULATOR_ADDRESS,
    BUSD_BOND_ADDRESS,
    GLBD_BUSD_BOND_ADDRESS,
    REDEEM_HELPER_ADDRESS,
    BUSD_ADDRESS,
    GLBD_BUSD_LP_ADDRESS
} = require("./addresses_testnet");

async function main() {

    const [deployer, MockDAO] = await ethers.getSigners();
    console.log('Setting up contracts with the account: ' + deployer.address);

    console.log('Setting up variables');
    // Initial mint for Frax and DAI (10,000,000) TODO pendent revisar
    const initialMint = '10000000000000000000000000';

    // Initial staking index
    const initialIndex = '10';

    // Initial reward rate for epoch
    const initialRewardRate = '1000'; //TODO revisar valor

    // BUSD bond BCV
    const busdBondBCV = '300';
    const glbdbusdBondBCV = '200';

    // Bond vesting length in blocks. 33110 ~ 5 days
    const bondVestingLength = '144000';

    // Min bond price
    const minBondPrice = '2600';

    // Max bond payout
    const maxBondPayout = '50'

    // DAO fee for bond
    const bondFee = '20000';

    // Max debt bond can take on
    const maxBUSDBondDebt = '60000000000000';
    const maxGLBDBUSDBondDebt = '40000000000000';

    // Initial Bond debt
    const intialBUSDBondDebt = '6000000000000';
    const intialGLBDBUSDBondDebt = '4000000000000';


    console.log('Attaching contracts');
    const GLBD = await ethers.getContractFactory('GlobalDAOToken');
    const glbd = await GLBD.attach(GLBD_ADDRESS);

    const SGLBD = await ethers.getContractFactory('sGlobalDAOToken');
    const sGLBD = await SGLBD.attach(SGLBD_ADDRESS);

    const Treasury = await ethers.getContractFactory('GlobalDAOTreasury');
    const treasury = await Treasury.attach(TREASURY_ADDRESS);

    const Distributor = await ethers.getContractFactory('Distributor');
    const distributor = await Distributor.attach(DISTRIBUTOR_ADDRESS);

    const Staking = await ethers.getContractFactory('GlobalDAOStaking');
    const staking = await Staking.attach(STAKING_ADDRESS);

    const BUSDBond = await ethers.getContractFactory('GlobalDAOBondDepository');
    const busdBond = await BUSDBond.attach(BUSD_BOND_ADDRESS);

    const GLBDBUSDBond = await ethers.getContractFactory('GlobalDAOBondDepository');
    const glbdbusdBond = await GLBDBUSDBond.attach(GLBD_BUSD_BOND_ADDRESS);

    const RedeemHelper = await ethers.getContractFactory('RedeemHelper');
    const redeemHelper = await RedeemHelper.attach(REDEEM_HELPER_ADDRESS);


    console.log('Setting up stuff');
    // Set treasury for GLBD token
    await glbd.setVault(DEPLOYER_ADDRESS);
    // Mint 10,000,000 GLBD
    await glbd.mint( DEPLOYER_ADDRESS, initialMint );
    // Set treasury for GLBD token
    await glbd.setVault(TREASURY_ADDRESS);

    // Initialize sOHM and set the index
    await sGLBD.initialize(STAKING_ADDRESS);
    await sGLBD.setIndex(initialIndex);

    // queue and toggle deployer reserve depositor
    await treasury.queue('0', DEPLOYER_ADDRESS);
    await treasury.toggle('0', DEPLOYER_ADDRESS, BONDING_CALCULATOR_ADDRESS);

    // queue and toggle liquidity depositor
    await treasury.queue('4', deployer.address, );
    await treasury.toggle('4', deployer.address, BONDING_CALCULATOR_ADDRESS);

    // queue and toggle reward manager
    await treasury.queue('8', DISTRIBUTOR_ADDRESS);
    await treasury.toggle('8', DISTRIBUTOR_ADDRESS, DISTRIBUTOR_ADDRESS);

    // Add staking contract as distributor recipient
    await distributor.addRecipient(STAKING_ADDRESS, initialRewardRate);

    // set distributor contract and warmup contract
    await staking.setContract('0', DISTRIBUTOR_ADDRESS);
    await staking.setContract('1', STAKING_WARMUP_ADDRESS);

    await glbd.approve(ROUTER_BEGLOBAL_ADDRESS, largeApproval );
    await glbd.approve(STAKING_HELPER_ADDRESS, largeApproval );

    // Deposit 9,000,000 BUSD to treasury, 600,000 GLBD gets minted to deployer and 8,400,000 are in treasury as excesss reserves
    await treasury.deposit('20000000000000000000', BUSD_ADDRESS, '18000000000000000000'); //TODO revisar
    await treasury.deposit('20000000000000000000', GLBD_BUSD_LP_ADDRESS, '18000000000000000000'); //TODO revisar

    // Stake GLBD through helper
    await stakingHelper.stake('100000000000');

    await treasury.auditReserves();


    console.log('Setting BOND BUSD');
    // Set BUSD bond terms
    await busdBond.initializeBondTerms(busdBondBCV, bondVestingLength, minBondPrice, maxBondPayout, bondFee, maxBUSDBondDebt, intialBUSDBondDebt);
    // Set staking for BUSD bond
    await busdBond.setStaking(STAKING_HELPER_ADDRESS, true);
    // queue and toggle BUSD bond reserve depositor
    await treasury.queue('0', BUSD_BOND_ADDRESS);
    await treasury.toggle('0', BUSD_BOND_ADDRESS, BONDING_CALCULATOR_ADDRESS);
    await redeemHelper.addBondContract(BUSD_BOND_ADDRESS);
    //await busd.approve(ROUTER_BEGLOBAL_ADDRESS, largeApproval ); TODO BOJI busd approve
    //await busd.approve(TREASURY_ADDRESS, largeApproval ); TODO BOJI busd approve
    await busdBond.deposit('5000000000000','1000000000000000000000',DEPLOYER_ADDRESS); //TODO revisar
    //await busdBond.setAdjustment(false,'2','40','0');


    console.log('Setting BOND GLBD-BUSD');
    // Set GLBD-BUSD bond terms
    await glbdbusdBond.initializeBondTerms(glbdbusdBondBCV, bondVestingLength, minBondPrice, maxBondPayout, bondFee, maxGLBDBUSDBondDebt, intialGLBDBUSDBondDebt);
    // Set staking for GLBD-BUSD bond
    await glbdbusdBond.setStaking(STAKING_HELPER_ADDRESS, true);
    await treasury.queue('4', GLBD_BUSD_BOND_ADDRESS);
    await treasury.toggle('4', GLBD_BUSD_BOND_ADDRESS, BONDING_CALCULATOR_ADDRESS);
    await treasury.queue('5', GLBD_BUSD_LP_ADDRESS);
    await treasury.toggle('5', GLBD_BUSD_LP_ADDRESS, BONDING_CALCULATOR_ADDRESS);
    await redeemHelper.addBondContract(GLBD_BUSD_BOND_ADDRESS);
    //await glbdbusdLP.approve(ROUTER_BEGLOBAL_ADDRESS, largeApproval ); TODO BOJI glbd-busd LP approve
    //await glbdbusdLP.approve(TREASURY_ADDRESS, largeApproval ); TODO BOJI glbd-busd LP approve
    await glbdbusdBond.deposit('20000000000000000','2613',DEPLOYER_ADDRESS); //TODO revisar
    await glbdbusdBond.setAdjustment(false,'2','40','0');


    console.log("DEPLOYMENT SUCCESSFULLY FINISHED");
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})
