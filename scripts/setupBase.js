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
    BUSD_ADDRESS,
    GLBD_BUSD_LP_ADDRESS,
    ROUTER_BEGLOBAL_ADDRESS
} = require("./addresses_testnet");

async function main() {

    const [deployer, MockDAO] = await ethers.getSigners();
    console.log('Setting up contracts with the account: ' + deployer.address);

    let step = 1;
    const TOTAL_STEPS = 50;

    console.log('Setting up variables');
    // Initial mint for Frax and DAI (10,000,000) TODO pendent revisar
    const initialMint = '10000000000000000000000000';

    // Initial staking index
    const initialIndex = '10';

    // Initial reward rate for epoch
    const initialRewardRate = '1000'; //TODO revisar valor

    // Large number for approval for GLBD
    const largeApproval = '100000000000000000000000000000000';

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

    const StakingHelper = await ethers.getContractFactory('StakingHelper');
    const stakingHelper = await StakingHelper.attach(STAKING_HELPER_ADDRESS);

    const BUSD = await ethers.getContractFactory('BEP20Token');
    const busd = await BUSD.attach(BUSD_ADDRESS);

    const GLBDBUSDLP = await ethers.getContractFactory('PancakeERC20');
    const glbdbusdLP = await GLBDBUSDLP.attach(GLBD_BUSD_LP_ADDRESS);

    console.log('Setting up stuff');
    console.log(1,"/",TOTAL_STEPS);
    // Set treasury for GLBD token
    /*await glbd.setVault(TREASURY_ADDRESS);

    // Initialize sOHM and set the index
    console.log(2,"/",TOTAL_STEPS);
    await sGLBD.initialize(STAKING_ADDRESS);
    await sGLBD.setIndex(initialIndex);*/

    // queue and toggle deployer reserve depositor
    /*console.log(3,"/",TOTAL_STEPS);
    await treasury.queue('0', DEPLOYER_ADDRESS);
    await treasury.toggle('0', DEPLOYER_ADDRESS, BONDING_CALCULATOR_ADDRESS);

    // queue and toggle liquidity depositor
    console.log(4,"/",TOTAL_STEPS);
    await treasury.queue('4', deployer.address, );
    await treasury.toggle('4', deployer.address, BONDING_CALCULATOR_ADDRESS);

    // queue and toggle reward manager
    console.log(5,"/",TOTAL_STEPS);
    await treasury.queue('8', DISTRIBUTOR_ADDRESS);
    await treasury.toggle('8', DISTRIBUTOR_ADDRESS, DISTRIBUTOR_ADDRESS);

    // Add staking contract as distributor recipient
    console.log(6,"/",TOTAL_STEPS);
    await distributor.addRecipient(STAKING_ADDRESS, initialRewardRate);

    // set distributor contract and warmup contract
    console.log(7,"/",TOTAL_STEPS);
    await staking.setContract('0', DISTRIBUTOR_ADDRESS);
    await staking.setContract('1', STAKING_WARMUP_ADDRESS);

    console.log(8,"/",TOTAL_STEPS);
    await glbd.approve(ROUTER_BEGLOBAL_ADDRESS, largeApproval );
    await glbd.approve(STAKING_HELPER_ADDRESS, largeApproval );

    // Deposit 9,000,000 BUSD to treasury, 600,000 GLBD gets minted to deployer and 8,400,000 are in treasury as excesss reserves
    console.log(9,"/",TOTAL_STEPS);
    await busd.approve(TREASURY_ADDRESS, '200000000000000000000');
    console.log(10,"/",TOTAL_STEPS);
    await treasury.deposit('20000000000000000000', BUSD_ADDRESS, '0'); //TODO revisar
    console.log(11,"/",TOTAL_STEPS);
    await glbdbusdLP.approve(TREASURY_ADDRESS,'9000000000000000000');
    console.log(12,"/",TOTAL_STEPS);
    await treasury.deposit('900000000000000000', GLBD_BUSD_LP_ADDRESS, '0'); //TODO revisar*/

    // Stake GLBD through helper
    console.log(13,"/",TOTAL_STEPS);
    await glbd.approve(STAKING_HELPER_ADDRESS, '1000000000000');
    await stakingHelper.stake('1000000', deployer.address);

    console.log(14,"/",TOTAL_STEPS);
    await treasury.auditReserves();

    console.log(15,"/",TOTAL_STEPS);

    console.log("DEPLOYMENT SUCCESSFULLY FINISHED");
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})
