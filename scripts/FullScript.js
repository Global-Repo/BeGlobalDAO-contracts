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
    TREASURY_SWAP_ADDRESS,
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
const INITIAL_SUPPLY = BigNumber.from(10).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER);

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
    let GLBDBUSDLPADDRESS = "";
    let stakingWarmup;
    let staking;
    let stakingHelper;
    let globalDAOBondingCalculator;
    let redeemHelper;
    let deploy = false;
    let SetGLBDVaultandMint10GLBD = true;
    let settersTestnet = true;
    let largeApproval = '100000000000000000000000000000000';

    const GLBDT = await ethers.getContractFactory('GlobalDAOToken');
    const sGLBDT = await ethers.getContractFactory('GlobalDAOToken');
    const BUSD = await ethers.getContractFactory('BEP20Token');

    // Quants blocs dura el epoch (staking)
    let epochLengthInBlocks = '20';

    // Quin bloc serà el primer que doni staking
    let firstBlockEpoch = await ethers.provider.getBlockNumber();

    console.log('Deploying contracts. Deployer account: ' + deployer.address + '. Multisig account: ' + MULTISIG_ADDRESS + '.');

    // SCs
    if (deploy) {
        // Testnet
        // Deploy GLBD
        console.log("[Deploying GLBD SC]");
        GLBD = await GLBDT.deploy();
        console.log("[GLBD deployed]: " + GLBD.address + ".");
        await new Promise(r => setTimeout(() => r(), 3000));

        // Deploy sGLBD
        console.log("[Deploying sGLBD SC]");
        sGLBD = await sGLBDT.deploy();
        console.log("[sGLBD deployed]: " + sGLBD.address + ".");
        await new Promise(r => setTimeout(() => r(), 3000));

        // Deploy factory
        console.log("[Deploying factory SC]");
        factory = await deployFactory(DEPLOYER_ADDRESS);
        console.log("[Factory deployed]: " + factory.address + ".");
        await new Promise(r => setTimeout(() => r(), 3000));

        // Set factory
        console.log("[Setting factory]");
        await factory.setFeeTo(TREASURY_SWAP_ADDRESS);
        console.log("[Factory set]");
        await new Promise(r => setTimeout(() => r(), 3000));

        // Deploy Router
        console.log("[Deploying Router SC]");
        router = await deployRouter(factory.address, WETH_ADDRESS); // Direcció WETH random només per tal de que funcioni el router.
        console.log("[Router deployed]: " + router.address + ".");
        await new Promise(r => setTimeout(() => r(), 3000));

        // Approve RouterBeGlobal as spender of GLB for Deployer
        console.log("[Approve GLBD to be used in the BeGlobal router by the deployer]");
        await GLBD.approve(router.address, largeApproval);
        console.log("[Success]");
        await new Promise(r => setTimeout(() => r(), 3000));

        // set deployer as GLBD vault and mint 10 GLBD.
        if (SetGLBDVaultandMint10GLBD)
            await setGLBDVaultandMint10GLBD(GLBD);

        // Deploy BUSD
        console.log("[Deploying BUSD SC]");
        busd = await BUSD.deploy();
        console.log("[BUSDt deployed]: " + busd.address + ".");

        // Deployer mints 100 BUSD
        console.log("[Deployer mints 100 BUSD]");
        await busd.mint(INITIAL_SUPPLY_B);
        await new Promise(r => setTimeout(() => r(), 3000));
        console.log("[Success]");

        // Approve BUSDt to be used in the BeGlobal router by the deployer
        console.log("[Approve BUSDt to be used in the BeGlobal router by the deployer]");
        await busd.approve(router.address, largeApproval);
        console.log("[Success]");
        await new Promise(r => setTimeout(() => r(), 3000));

        // AddLiquidity
        console.log("[Create and add liquidity GLBD-BUSD in BeGlobal router]");
        const addLiq = await router.addLiquidity(
            GLBD.address,
            busd.address,
            bep20Amount(1),
            bep20Amount_B(1),
            0,
            0,
            DEPLOYER_ADDRESS,
            (new Date()).setTime((new Date()).getTime())
        );
        await new Promise(r => setTimeout(() => r(), 3000));

        const r = await addLiq.wait();
        let LP = r.events[1].topics[2];
        GLBDBUSDLPADDRESS = LP.replace("000000000000000000000000","");
        console.log("[Success] GLBD-BUSD LP address: ", GLBDBUSDLPADDRESS, ".");

        // Deploy treasury
        console.log("[Deploying Treasury SC]");
        const Treasury = await ethers.getContractFactory('GlobalDAOTreasury');
        treasury = await Treasury.deploy( GLBD.address, busd.address, GLBDBUSDLPADDRESS, 0);
        console.log("[Treasury deployed]: " + treasury.address + ".");
        await new Promise(r => setTimeout(() => r(), 3000));

        // Deploy distributor
        console.log("[Deploying distributor SC]");
        const Distributor = await ethers.getContractFactory('Distributor');
        distributor = await Distributor.deploy(treasury.address, GLBD.address, epochLengthInBlocks, firstBlockEpoch); // 3r: número de blocs que dura epoch, 4rt: primer block que farà epoch (staking, no?)
        console.log("[Distributor deployed]: " + distributor.address + ".");
        await new Promise(r => setTimeout(() => r(), 3000));

        // Deploy Staking
        console.log("[Deploy Staking]");
        const Staking = await ethers.getContractFactory('GlobalDAOStaking');
        staking = await Staking.deploy( GLBD.address, sGLBD.address, epochLengthInBlocks, 0, firstBlockEpoch );
        console.log("[Staking deployed]: " + staking.address + ".");
        await new Promise(r => setTimeout(() => r(), 3000));

        // Deploy StakingHelper
        console.log("[Deploy StakingHelper]");
        const StakingHelper = await ethers.getContractFactory('StakingHelper');
        stakingHelper = await StakingHelper.deploy(staking.address, GLBD.address);
        console.log("[StakingHelper deployed]: " + stakingHelper.address + ".");
        await new Promise(r => setTimeout(() => r(), 3000));

        // Deploy StakingHelper
        console.log("[Deploy WarmUp]");
        const StakingWarmup = await ethers.getContractFactory('StakingWarmup');
        stakingWarmup = await StakingWarmup.deploy(staking.address, sGLBD.address);
        console.log("[WarmUp deployed]: " + stakingWarmup.address + ".");
        await new Promise(r => setTimeout(() => r(), 3000));

        // Deploy bonding calculator
        console.log("[Deploy bonding calculator]");
        const GlobalDAOBondingCalculator = await ethers.getContractFactory('GlobalDAOBondingCalculator');
        globalDAOBondingCalculator = await GlobalDAOBondingCalculator.deploy(GLBD.address);
        console.log("[GlobalDAOBondingCalculator deployed]: " + globalDAOBondingCalculator.address + ".");
        await new Promise(r => setTimeout(() => r(), 3000));

        // Redeem helper
        console.log("[Redeem helper]");
        const RedeemHelper = await ethers.getContractFactory('RedeemHelper');
        redeemHelper = await RedeemHelper.deploy();
        console.log("[Redeem helper deployed]: " + redeemHelper.address + ".");
        await new Promise(r => setTimeout(() => r(), 3000));
    } else {
        // Testnet

        // Attach GLBD
        console.log("[Attaching GLBD SC]");
        GLBD = await GLBDT.attach(GLBD_ADDRESS);
        console.log("[GLBD attached]: " + GLBD_ADDRESS + ".");
        await new Promise(r => setTimeout(() => r(), 1000));

        // Attach sGLBD
        console.log("[Attaching sGLBD SC]");
        sGLBD = await sGLBDT.attach(SGLBD_ADDRESS);
        console.log("[sGLBD attached]: " + SGLBD_ADDRESS + ".");
        await new Promise(r => setTimeout(() => r(), 1000));

        // Attach factory
        console.log("[Attaching factory SC]");
        const Factory = await ethers.getContractFactory("Factory");
        factory = await Factory.attach(FACTORY_ADDRESS);
        console.log("[Factory attached]: " + factory.address + ".");
        await new Promise(r => setTimeout(() => r(), 1000));

        // Attach Router
        console.log("[Attaching Router SC]");
        const Router = await ethers.getContractFactory("Router");
        router = await Router.attach(ROUTER_BEGLOBAL_ADDRESS);
        console.log("[Router attached]: " + router.address + ".");
        await new Promise(r => setTimeout(() => r(), 1000));

        // Approve RouterBeGlobal as spender of GLB for Deployer
        console.log("[Approve RouterBeGlobal as spender of GLB for Deployer] [D]");
        console.log("[Success]");
        await new Promise(r => setTimeout(() => r(), 1000));

        // Attach BUSD
        console.log("[Attaching BUSD SC]");
        busd = await BUSD.attach(BUSD_ADDRESS);
        console.log("[BUSDt attached]: " + busd.address + ".");

        // set deployer as GLBD vault and mint 10 GLBD - We don't know how many we have.
        if (SetGLBDVaultandMint10GLBD)
            await setGLBDVaultandMint10GLBD(GLBD);

        // Deployer mints 100 BUSD - We don't know how many we have.
        console.log("[Deployer mints 100 BUSD]");
        await busd.mint(INITIAL_SUPPLY_B);
        await new Promise(r => setTimeout(() => r(), 1000));
        console.log("[Success]");

        // Approve BUSDt to be used in the BeGlobal router by the deployer
        console.log("[Approve BUSDt to be used in the BeGlobal router by the deployer] [D]");
        console.log("[Success]");
        await new Promise(r => setTimeout(() => r(), 1000));

        // AddLiquidity
        console.log("[Create and add liquidity GLBD-BUSD in BeGlobal router] [D]");
        console.log("[Success] GLBD-BUSD LP address: ", GLBD_BUSD_LP_ADDRESS, ".");

        // Attach treasury
        console.log("[Attaching Treasury SC]");
        const Treasury = await ethers.getContractFactory('GlobalDAOTreasury');
        treasury = await Treasury.attach(TREASURY_ADDRESS);
        console.log("[Treasury attached]: " + treasury.address + ".");
        await new Promise(r => setTimeout(() => r(), 1000));

        // Attach distributor
        console.log("[Attaching distributor SC]");
        const Distributor = await ethers.getContractFactory('Distributor');
        distributor = await Distributor.attach(DISTRIBUTOR_ADDRESS);
        console.log("[Distributor attached]: " + distributor.address + ".");
        await new Promise(r => setTimeout(() => r(), 1000));

        // Attach Staking
        console.log("[Attaching Staking]");
        const Staking = await ethers.getContractFactory('GlobalDAOStaking');
        staking = await Staking.attach(STAKING_ADDRESS);
        console.log("[Staking attached]: " + staking.address + ".");
        await new Promise(r => setTimeout(() => r(), 1000));

        // Attach StakingHelper
        console.log("[Attaching StakingHelper]");
        const StakingHelper = await ethers.getContractFactory('StakingHelper');
        stakingHelper = await StakingHelper.attach(STAKING_HELPER_ADDRESS);
        console.log("[StakingHelper attached]: " + stakingHelper.address + ".");
        await new Promise(r => setTimeout(() => r(), 1000));

        // Attach StakingHelper
        console.log("[Attaching WarmUp]");
        const StakingWarmup = await ethers.getContractFactory('StakingWarmup');
        stakingWarmup = await StakingWarmup.attach(STAKING_WARMUP_ADDRESS);
        console.log("[WarmUp attached]: " + stakingWarmup.address + ".");
        await new Promise(r => setTimeout(() => r(), 1000));

        // Attach bonding calculator
        console.log("[Attaching bonding calculator]");
        const GlobalDAOBondingCalculator = await ethers.getContractFactory('GlobalDAOBondingCalculator');
        globalDAOBondingCalculator = await GlobalDAOBondingCalculator.attach(BONDING_CALCULATOR_ADDRESS);
        console.log("[GlobalDAOBondingCalculator attached]: " + globalDAOBondingCalculator.address + ".");
        await new Promise(r => setTimeout(() => r(), 1000));

        // Attach Redeem helper
        console.log("[Attaching redeem helper]");
        const RedeemHelper = await ethers.getContractFactory('RedeemHelper');
        redeemHelper = await RedeemHelper.attach(REDEEM_HELPER_ADDRESS);
        console.log("[Redeem helper attached]: " + redeemHelper.address + ".");
        await new Promise(r => setTimeout(() => r(), 1000));
    }

if (settersTestnet){
// QUEUE, TOGGLE-..
}

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
    await new Promise(r => setTimeout(() => r(), 3000));

    // Mint 10 GLBD
    console.log("[Deployer mints (extra?) 10 GLBD]");
    await GLBD.mint(DEPLOYER_ADDRESS, INITIAL_SUPPLY);
    console.log("[Success]");
    await new Promise(r => setTimeout(() => r(), 3000));
}


main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})

