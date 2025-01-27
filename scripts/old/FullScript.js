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
    WETH_ADDRESS,
    STAKING_ADDRESS,
    FACTORY_ADDRESS,
    GLBD_BUSD_LP_ADDRESS,
    DISTRIBUTOR_ADDRESS,
    STAKING_HELPER_ADDRESS,
    STAKING_WARMUP_ADDRESS,
    BONDING_CALCULATOR_ADDRESS,
    REDEEM_HELPER_ADDRESS,
    BUSD_BOND_ADDRESS,
    GLBD_BUSD_BOND_ADDRESS
} = require("../addresses_testnet");

const TOKEN_DECIMALS = 9;
const BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER = BigNumber.from(10).pow(TOKEN_DECIMALS);
const INITIAL_SUPPLY = BigNumber.from(100000).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER);

const TOKEN_DECIMALS_B = 18;
const BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_B = BigNumber.from(10).pow(TOKEN_DECIMALS_B);
const INITIAL_SUPPLY_B = BigNumber.from(100).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_B);

let bep20Amount = function (amount) {
    return BigNumber.from(amount).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER);
}

let bep20Amount_B = function (amount) {
    return BigNumber.from(amount).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_B);
}

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
    let glbdbusdBond;
    let redeemHelper;
    let deploy = true;
    let deployBUSD = true;
    let originalAMM = false;
    let SetGLBDVaultandMint10GLBD = true;
    let timeoutPeriod = 5000;
    let largeApproval = '100000000000000000000000000000000';

    const GLBDT = await ethers.getContractFactory('GlobalDAOToken');
    const sGLBDT = await ethers.getContractFactory('sGlobalDAOToken');
    const BUSD = await ethers.getContractFactory('BEP20Token');

    // Quants blocs dura el epoch (staking): 12h.
    let epochLengthInBlocks = '600'; // 30' pels testos

    // BUSD bond BCV
    const busdBondBCV = '100';

    // GLBD-BUSD bond BCV
    const glbdbusdBondBCV = '100';

    // Bond vesting length in blocks. 33110 ~ 5 days
    const bondVestingLength = '144000';

    // Min bond price EN GLBD
    const minBondPrice = '500';

    // Max bond payout - 1% of totalSupply
    const maxBondPayout = '1000'

    // DAO fee for bond 10000 = 10%
    const bondFee = '20000';

    // Max debt bond can take on
    const maxBUSDBondDebt = '120000000000000';

    // Max debt bond can take on
    const maxGLBDBUSDBondDebt = '120000000000000';

    // Initial Bond debt
    const intialBUSDBondDebt = '6000000000000';

    // Initial Bond debt
    const intialGLBDBUSDBondDebt = '10000000000000';

    // Quin bloc serà el primer que doni staking
    let firstBlockEpoch = '15496563';

    // Initial reward rate for epoch. 5000 = 0.5%. Used for staking.
    let initialRewardRateForEpoch = '1250'; //META ho te a 435 en un inici

    // Initial staking index
    const initialIndex = '10';

    // SETUP AMM ENVIRONMENT
    if (deploy && !originalAMM) {
        // Deploy factory
        console.log("[Deploying factory SC]");
        factory = await deployFactory(DEPLOYER_ADDRESS);
        console.log("[Factory deployed]: " + factory.address);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));
    } else {
        // Attach factory
        console.log("[Attaching factory SC]");
        const Factory = await ethers.getContractFactory("Factory");
        factory = await Factory.attach(FACTORY_ADDRESS);
        console.log("[Factory attached]: " + factory.address);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));
    }

    if (deploy && !originalAMM) {
        // Deploy Router
        console.log("[Deploying Router SC]");
        router = await deployRouter(factory.address, WETH_ADDRESS); // Direcció WETH random només per tal de que funcioni el router.
        console.log("[Router deployed]: " + router.address);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));
    } else {
        // Attach Router
        console.log("[Attaching Router SC]");
        const Router = await ethers.getContractFactory("Router");
        router = await Router.attach(ROUTER_BEGLOBAL_ADDRESS);
        console.log("[Router attached]: " + router.address);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));
    }

    if (deployBUSD) {
        // Deploy BUSD
        console.log("[Deploying BUSD SC]");
        busd = await BUSD.deploy();
        console.log("[BUSDt deployed]: " + busd.address);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));
    } else {
        // Attach BUSD
        console.log("[Attaching BUSD SC]");
        busd = await BUSD.attach(BUSD_ADDRESS);
        console.log("[BUSDt attached]: " + busd.address);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));
    }

    if (deployBUSD) {
        // Deployer mints 100 BUSD
        console.log("[Deployer mints 100 BUSD]");
        await busd.mint(INITIAL_SUPPLY_B);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));
        console.log("[Success]");
    }

    console.log('Deploying contracts. Deployer account: ' + deployer.address + '. Multisig account: ' + MULTISIG_ADDRESS + '.');

    if (deploy) {
        // Deploy GLBD
        console.log("[Deploying GLBD SC]");
        GLBD = await GLBDT.deploy();
        console.log("[GLBD deployed]: " + GLBD.address);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));
    } else {
        // Attach GLBD
        console.log("[Attaching GLBD SC]");
        GLBD = await GLBDT.attach(GLBD_ADDRESS);
        console.log("[GLBD attached]: " + GLBD_ADDRESS);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));
    }

    if (deploy) {
        // Deploy sGLBD
        console.log("[Deploying sGLBD SC]");
        sGLBD = await sGLBDT.deploy();
        console.log("[sGLBD deployed]: " + sGLBD.address);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));
    } else {
        // Attach sGLBD
        console.log("[Attaching sGLBD SC]");
        sGLBD = await sGLBDT.attach(SGLBD_ADDRESS);
        console.log("[sGLBD attached]: " + SGLBD_ADDRESS);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));
    }

    if (deploy) {
        // Create GLBD-BUSD pair
        console.log("[Create GLBD-BUSD pair]");
        const createPair = await factory.createPair(GLBD.address, busd.address);
        const createP = await createPair.wait();
        const lpAddress = createP.events[0].args.pair;
        console.log("[Success, pair created]: " + lpAddress);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));

        const GLBDBUSDLP = await ethers.getContractFactory('PancakeERC20');
        glbdbusdLP = await GLBDBUSDLP.attach(lpAddress);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));
    }
    else
    {
        const GLBDBUSDLP = await ethers.getContractFactory('PancakeERC20');
        glbdbusdLP = await GLBDBUSDLP.attach(GLBD_BUSD_LP_ADDRESS);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));
    }

    if (deploy) {
        // Deploy treasury
        console.log("[Deploying Treasury SC]");
        const Treasury = await ethers.getContractFactory('GlobalDAOTreasury');
        treasury = await Treasury.deploy(GLBD.address, busd.address, glbdbusdLP.address, 0);
        console.log("[Treasury deployed]: " + treasury.address);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));
    } else {
        // Attach treasury
        console.log("[Attaching Treasury SC]");
        const Treasury = await ethers.getContractFactory('GlobalDAOTreasury');
        treasury = await Treasury.attach(TREASURY_ADDRESS);
        console.log("[Treasury attached]: " + treasury.address);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));
    }

    if (deploy) {
        // Deploy bonding calculator
        console.log("[Deploy bonding calculator]");
        const GlobalDAOBondingCalculator = await ethers.getContractFactory('GlobalDAOBondingCalculator');
        globalDAOBondingCalculator = await GlobalDAOBondingCalculator.deploy(GLBD.address);
        console.log("[GlobalDAOBondingCalculator deployed]: " + globalDAOBondingCalculator.address);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));
    } else {
        // Attach bonding calculator
        console.log("[Attaching bonding calculator]");
        const GlobalDAOBondingCalculator = await ethers.getContractFactory('GlobalDAOBondingCalculator');
        globalDAOBondingCalculator = await GlobalDAOBondingCalculator.attach(BONDING_CALCULATOR_ADDRESS);
        console.log("[GlobalDAOBondingCalculator attached]: " + globalDAOBondingCalculator.address);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));
    }

    if (deploy) {
        // Deploy bonding depository BUSD
        console.log("[Deploy bonding depository BUSD]");
        const BUSDBond = await ethers.getContractFactory('GlobalDAOBondDepository');
        busdBond = await BUSDBond.deploy(GLBD.address, busd.address, treasury.address, MULTISIG_ADDRESS, '0x0000000000000000000000000000000000000000');
        console.log("[GlobalDAOBondDepository BUSD deployed]: " + busdBond.address);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));
    } else {
        // Attach bonding depository BUSD
        console.log("[Attaching bonding depository BUSD]");
        const BUSDBond = await ethers.getContractFactory('GlobalDAOBondDepository');
        busdBond = await BUSDBond.attach(BUSD_BOND_ADDRESS);
        console.log("[GlobalDAOBondDepository BUSD attached]: " + BUSD_BOND_ADDRESS);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));
    }

    if (deploy) {
        // Deploy bonding depository GLBD-BUSD LP
        console.log("[Deploy bonding depository GLBD-BUSD LP]");
        const GLBDBUSDBond = await ethers.getContractFactory('GlobalDAOBondDepository');
        glbdbusdBond = await GLBDBUSDBond.deploy(GLBD.address, glbdbusdLP.address, treasury.address, MULTISIG_ADDRESS, globalDAOBondingCalculator.address);
        console.log("[GlobalDAOBondDepository GLBD-BUSD LP deployed]: " + glbdbusdBond.address);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));
    } else {
        // Attach bonding depository GLBD-BUSD LP
        console.log("[Attaching bonding depository GLBD-BUSD LP]");
        const GLBDBUSDBond = await ethers.getContractFactory('GlobalDAOBondDepository');
        glbdbusdBond = await GLBDBUSDBond.attach(GLBD_BUSD_BOND_ADDRESS);
        console.log("[GlobalDAOBondDepository GLBD-BUSD LP attached]: " + GLBD_BUSD_BOND_ADDRESS);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));
    }

    if (deploy) {
        // Redeem helper
        console.log("[Redeem helper]");
        const RedeemHelper = await ethers.getContractFactory('RedeemHelper');
        redeemHelper = await RedeemHelper.deploy();
        console.log("[Redeem helper deployed]: " + redeemHelper.address);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));
    } else {
        // Attach Redeem helper
        console.log("[Attaching redeem helper]");
        const RedeemHelper = await ethers.getContractFactory('RedeemHelper');
        redeemHelper = await RedeemHelper.attach(REDEEM_HELPER_ADDRESS);
        console.log("[Redeem helper attached]: " + redeemHelper.address);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));
    }

    if (deploy) {
        // Deploy distributor
        console.log("[Deploying distributor SC]");
        const Distributor = await ethers.getContractFactory('Distributor');
        distributor = await Distributor.deploy(treasury.address, GLBD.address, epochLengthInBlocks, firstBlockEpoch); // 3r: número de blocs que dura epoch, posem 12h, 4rt: primer block que farà staking
        console.log("[Distributor deployed]: " + distributor.address);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));
    } else {
        // Attach distributor
        console.log("[Attaching distributor SC]");
        const Distributor = await ethers.getContractFactory('Distributor');
        distributor = await Distributor.attach(DISTRIBUTOR_ADDRESS);
        console.log("[Distributor attached]: " + distributor.address);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));
    }

    if (deploy) {
        // Deploy Staking
        console.log("[Deploy Staking]");
        const Staking = await ethers.getContractFactory('GlobalDAOStaking');
        staking = await Staking.deploy(GLBD.address, sGLBD.address, epochLengthInBlocks, 0, firstBlockEpoch);
        console.log("[Staking deployed]: " + staking.address);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    } else {
        // Attach Staking
        console.log("[Attaching Staking]");
        const Staking = await ethers.getContractFactory('GlobalDAOStaking');
        staking = await Staking.attach(STAKING_ADDRESS);
        console.log("[Staking attached]: " + staking.address);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));
    }

    if (deploy) {
        // Deploy StakingHelper
        console.log("[Deploy StakingHelper]");
        const StakingHelper = await ethers.getContractFactory('StakingHelper');
        stakingHelper = await StakingHelper.deploy(staking.address, GLBD.address);
        console.log("[StakingHelper deployed]: " + stakingHelper.address);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));
    } else {
        // Attach StakingHelper
        console.log("[Attaching StakingHelper]");
        const StakingHelper = await ethers.getContractFactory('StakingHelper');
        stakingHelper = await StakingHelper.attach(STAKING_HELPER_ADDRESS);
        console.log("[StakingHelper attached]: " + stakingHelper.address);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));
    }

    if (deploy) {
        // Deploy WarmUp
        console.log("[Deploy WarmUp]");
        const StakingWarmup = await ethers.getContractFactory('StakingWarmup');
        stakingWarmup = await StakingWarmup.deploy(staking.address, sGLBD.address);
        console.log("[WarmUp deployed]: " + stakingWarmup.address);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));
    } else {
        // Attach WarmUp
        console.log("[Attaching WarmUp]");
        const StakingWarmup = await ethers.getContractFactory('StakingWarmup');
        stakingWarmup = await StakingWarmup.attach(STAKING_WARMUP_ADDRESS);
        console.log("[WarmUp attached]: " + stakingWarmup.address);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));
    }

    // set warmup to unstake rewards
    staking.setWarmup(0); // TODO revisar per definitiu
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

    // Setting BUSD Bond terms
    console.log('Setting BUSD Bond terms');
    await busdBond.initializeBondTerms(busdBondBCV, bondVestingLength, minBondPrice, maxBondPayout, bondFee, maxBUSDBondDebt, intialBUSDBondDebt);
    console.log("[Success]");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Setting staking for BUSD Bond
    console.log('Setting staking for BUSD Bond');
    await busdBond.setStaking(stakingHelper.address, true);
    console.log("[Success]");
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

    // Adding BUSD Bond to redeem helper
    console.log('Adding BUSD Bond to redeem helper');
    await redeemHelper.addBondContract(busdBond.address);
    console.log("[Success]");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // SAdding Bond GLBD-BUSD Bond to redeem helper
    console.log('Adding GLBD-BUSD Bond to redeem helper');
    await redeemHelper.addBondContract(glbdbusdBond.address);
    console.log("[Success]");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Approve treasury as spender of busd for Deployer
    console.log("[Approve treasury as spender of busd for Deployer]");
    await busd.approve(treasury.address, largeApproval);
    console.log("[Success]");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Approve RouterBeGlobal as spender of GLB for Deployer
    console.log("[Approve GLBD to be used in the BeGlobal router by the deployer]");
    await GLBD.approve(router.address, largeApproval);
    console.log("[Success]");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Approve RouterBeGlobal as spender of LBD-BUSD LP for Deployer
    console.log("[Approve GLBD-BUSD LP to be used in the BeGlobal router by the deployer]");
    await glbdbusdLP.approve(router.address, largeApproval);
    console.log("[Success]");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Approve BUSDt to be used in the BeGlobal router by the deployer
    console.log("[Approve BUSDt to be used in the BeGlobal router by the deployer]");
    await busd.approve(router.address, largeApproval);
    console.log("[Success]");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // AddLiquidity
    console.log("[Create and add liquidity GLBD-BUSD in BeGlobal router]");
    const addLiq = await router.addLiquidity(
        GLBD.address,
        busd.address,
        bep20Amount(10000),
        bep20Amount_B(200000),
        bep20Amount(10000),
        bep20Amount_B(200000),
        DEPLOYER_ADDRESS,
        (new Date()).setTime((new Date()).getTime())
    );
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Set Treasury as GLBD vault
    console.log("[Set Treasury as GLBD vault]");
    await GLBD.setVault(treasury.address);
    console.log("[Success]");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    /*
    // TODO
    // Deposit 5$ to treasury, profit 4.5$ -- el 2n número ha de tenir 9 zeros menys!!!
    // Això hauria de ser DESDE EL BOND.
    console.log("[Deposit 5$ to treasury, profit 4.5$ -- el 2n número ha de tenir 9 zeros menys!]");
    await treasury.deposit(bep20Amount_B(200000), busd.address, bep20Amount(200000)); // La diferencia és el que s'ha cobrat de comisió
    console.log("[Success]");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Approve GLBD-BUSD LP to be used in the GLBD-BUSD LP Bond by the deployer
    console.log("[Approve GLBD-BUSD LP to be used in the GLBD-BUSD LP Bond by the deployer]");
    await glbdbusdLP.approve(glbdbusdBond.address,largeApproval);
    console.log("[Success]");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // todo script apart per fer bond de part dels presalers.
    // Deposit GLBD-BUSD LP to the GLBD-BUSD LP Bond by the deployer
    console.log("[Deposit GLBD-BUSD LP to the GLBD-BUSD LP Bond by the deployer]");
    await glbdbusdBond.deposit('5000000000000','1000000000000000000000',DEPLOYER_ADDRESS);
    console.log("[Success]");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));
*/
    // Approve StakingHelper as spender of GLBD for Deployer
    console.log("[Approve StakingHelper as spender of GLBD for Deployer]");
    await GLBD.approve(stakingHelper.address, largeApproval );
    console.log("[Success]");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Deposit GLBD-BUSD LP to the GLBD-BUSD LP Bond by the deployer
    //console.log("[Deposit GLBD-BUSD LP to the GLBD-BUSD LP Bond by the deployer]");
    //await glbdbusdLP.deposit('140000000000000000','2613',DEPLOYER_ADDRESS);
    //console.log("[Success]");
    //await new Promise(r => setTimeout(() => r(), 1000));

    // Approve treasury as spender of glbdbusdLP for Deployer
    console.log("[Approve GLB_BUSD_LP as liquidity token]");
    await glbdbusdLP.approve(treasury.address,largeApproval);
    console.log("[Success]");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Queue deployer as liquidity depositor
    console.log("[Queue deployer as liquidity depositor]");
    await treasury.queue('4', deployer.address);
    console.log("[Success]");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Toggle deployer as liquidity depositor
    console.log("[Toggle deployer as liquidity depositor]");
    await treasury.toggle('4', deployer.address, globalDAOBondingCalculator.address);
    console.log("[Success]");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Deposit GLBD_BUSD_LP to treasury
    // Això hauria de ser DESDE EL BOND.

    // Té pinta de test.
    console.log("[Deposit GLBD_BUSD_LP to treasury -- el 2n número ha de tenir 9 zeros menys!]");
    await treasury.deposit('500000000000000000', glbdbusdLP.address, '400000000');
    console.log("[Success]");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Audit Reserves
    console.log("[Audit Reserves]");
    await treasury.auditReserves();
    console.log("[Success]");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Set adjustment to LP Bond
    console.log("[Set adjustment to LP Bond]");
    await glbdbusdBond.setAdjustment(false,'2','40','0');
    console.log("[Success]");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    console.log("DEPLOYMENT SUCCESSFULLY FINISHED -> copy BUSD, GLBD & sGLBD addresses and addLiquidity to the router");
}
let deployFactory = async function (feeSetter) {
    const Factory = await ethers.getContractFactory("Factory");
    const factory = await Factory.deploy(feeSetter);
    await factory.deployed();
    return factory;
};
let deployRouter = async function (factory, weth) {
    const Router = await ethers.getContractFactory("Router");
    const router = await Router.deploy(factory, weth);
    await router.deployed();
    return router;
};
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

