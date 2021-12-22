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
} = require("./addresses_mainnet");

async function main() {

    const [deployer, MockDAO] = await ethers.getSigners();
    console.log("*** DEPLOYMENT STARTED ***");
    console.log('Setting up contracts with the account: ' + deployer.address);

    const TOTAL_STEPS = 22;

    console.log('Setting up variables');
    // Initial mint for Frax and DAI (10,000,000) TODO pendent revisar
    //const initialMint = '10000000000000000000000000';

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
/*
    // Set Treasury as GLBD vault
    console.log(1,"/",TOTAL_STEPS, ". Set Treasury as GLBD vault.");
    await glbd.setVault(TREASURY_ADDRESS);
    await new Promise(r => setTimeout(() => r(), 5000));

    // Initialize sOHM
    console.log(2,"/",TOTAL_STEPS, ". Initialize sOHM.");
    await sGLBD.initialize(STAKING_ADDRESS);
    await new Promise(r => setTimeout(() => r(), 5000));

    // Set index
    console.log(3,"/",TOTAL_STEPS, ". Set index.");
    await sGLBD.setIndex(initialIndex);
    await new Promise(r => setTimeout(() => r(), 5000));

    // Queue deployer as reserve depositor
    console.log(4,"/",TOTAL_STEPS, ". Queue deployer as reserve depositor.");
    await treasury.queue('0', DEPLOYER_ADDRESS);
    await new Promise(r => setTimeout(() => r(), 5000));

    // Toggle deployer as reserve depositor
    console.log(5,"/",TOTAL_STEPS, ". Toggle deployer as reserve depositor.");
    await treasury.toggle('0', DEPLOYER_ADDRESS, BONDING_CALCULATOR_ADDRESS);
    await new Promise(r => setTimeout(() => r(), 5000));

    // Queue deployer as liquidity depositor
    console.log(6,"/",TOTAL_STEPS, ". Queue deployer as liquidity depositor.");
    await treasury.queue('4', DEPLOYER_ADDRESS);
    await new Promise(r => setTimeout(() => r(), 5000));

    // Toggle deployer as liquidity depositor
    console.log(7,"/",TOTAL_STEPS, ". Toggle deployer as liquidity depositor.");
    await treasury.toggle('4', DEPLOYER_ADDRESS, BONDING_CALCULATOR_ADDRESS);
    await new Promise(r => setTimeout(() => r(), 5000));

    // Queue reward manager
    console.log(8,"/",TOTAL_STEPS, ". Queue reward manager.");
    await treasury.queue('8', DISTRIBUTOR_ADDRESS);
    await new Promise(r => setTimeout(() => r(), 5000));

    // Toggle reward manager
    console.log(9,"/",TOTAL_STEPS, ". Toggle reward manager.");
    await treasury.toggle('8', DISTRIBUTOR_ADDRESS, DISTRIBUTOR_ADDRESS);
    await new Promise(r => setTimeout(() => r(), 5000));

    // Add staking contract as distributor recipient
    console.log(10,"/",TOTAL_STEPS, ". Add staking contract as distributor recipient.");
    await distributor.addRecipient(STAKING_ADDRESS, initialRewardRate);
    await new Promise(r => setTimeout(() => r(), 5000));

    // Staking SetContract to distributor
    console.log(11,"/",TOTAL_STEPS, ". Staking SetContract to distributor.");
    await staking.setContract('0', DISTRIBUTOR_ADDRESS);
    await new Promise(r => setTimeout(() => r(), 5000));


    // Staking SetContract to StakingWarmUp
    console.log(12,"/",TOTAL_STEPS, ". Staking SetContract to StakingWarmUp.");
    await staking.setContract('1', STAKING_WARMUP_ADDRESS);
    await new Promise(r => setTimeout(() => r(), 5000));


    // Queue GLB_BUSD_LP as liquidity token
    console.log(13,"/",TOTAL_STEPS, ". Queue GLB_BUSD_LP as liquidity token.");
    await treasury.queue('5', GLBD_BUSD_LP_ADDRESS);
    await new Promise(r => setTimeout(() => r(), 5000));

    // Toggle GLB_BUSD_LP as liquidity token
    console.log(14,"/",TOTAL_STEPS, ". Toggle GLB_BUSD_LP as liquidity token.");
    await treasury.toggle('5', GLBD_BUSD_LP_ADDRESS, BONDING_CALCULATOR_ADDRESS);
    await new Promise(r => setTimeout(() => r(), 5000));

    // Approve RouterBeGlobal as spender of GLB for Deployer
    console.log(15,"/",TOTAL_STEPS, ". Approve RouterBeGlobal as spender of GLB for Deployer.");
    await glbd.approve(ROUTER_BEGLOBAL_ADDRESS, largeApproval );
    await new Promise(r => setTimeout(() => r(), 5000));

    // Approve StakingHelper as spender of GLBD for Deployer
    console.log(16,"/",TOTAL_STEPS, ". Approve StakingHelper as spender of GLBD for Deployer.");
    await glbd.approve(STAKING_HELPER_ADDRESS, largeApproval );
    await new Promise(r => setTimeout(() => r(), 5000));

    // Approve treasury as spender of busd for Deployer
    console.log(17,"/",TOTAL_STEPS, ". Approve treasury as spender of busd for Deployer.");
    await busd.approve(TREASURY_ADDRESS, '500000000000000000000');
    await new Promise(r => setTimeout(() => r(), 5000));

    // Approve treasury as spender of glbdbusdLP for Deployer
    console.log(18,"/",TOTAL_STEPS, ". Approve treasury as spender of glbdbusdLP for Deployer.");
    await glbdbusdLP.approve(TREASURY_ADDRESS,'500000000000000000000');
    await new Promise(r => setTimeout(() => r(), 5000));

    // Deposit 5$ to treasury, profit 4.5$ -- el 2n número ha de tenir 9 zeros menys!!!
    console.log(19,"/",TOTAL_STEPS, ". Deposit 5$ to treasury, profit 4.5$.");
    await treasury.deposit('2000000000000000000', BUSD_ADDRESS, '2000000000');
    await new Promise(r => setTimeout(() => r(), 5000));


    // Deposit GLBD_BUSD_LP to treasury
    console.log(20,"/",TOTAL_STEPS, ". Deposit GLBD_BUSD_LP to treasury.");
    await treasury.deposit('3162277660068', GLBD_BUSD_LP_ADDRESS, '0');
    await new Promise(r => setTimeout(() => r(), 5000));


    // Audit Reserves
    console.log(22,"/",TOTAL_STEPS, ". Audit Reserves.");
    await treasury.auditReserves();
*/
    // Stake GLBD through helper
    console.log(21,"/",TOTAL_STEPS, ". Stake GLBD through helper.");
    await stakingHelper.stake('1000000', DEPLOYER_ADDRESS);
    await new Promise(r => setTimeout(() => r(), 5000));

    // Audit Reserves
    console.log(22,"/",TOTAL_STEPS, ". Audit Reserves.");
    await treasury.auditReserves();

    console.log("*** DEPLOYMENT SUCCESSFULLY FINISHED ***");
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})
