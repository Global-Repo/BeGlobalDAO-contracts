const { ethers } = require("hardhat");
const { BigNumber } = require("@ethersproject/bignumber");
const {
    MULTISIG_ADDRESS,
    ROUTER_BEGLOBAL_ADDRESS, DEPLOYER_ADDRESS, GLBD_ADDRESS, SGLBD_ADDRESS, BUSD_ADDRESS, TREASURY_ADDRESS, WETH_ADDRESS, TREASURY_SWAP_ADDRESS
} = require("./addresses_testnet");
const {DISTRIBUTOR_ADDRESS, STAKING_ADDRESS} = require("./addresses_mainnet");


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
    let deployOrAttach = true;
    let deployAndSetTokens = true;
    let setGLBDVault = true;
    let mint10GLBD = true;
    let settersTestnet = true;
    let largeApproval = '100000000000000000000000000000000';
    let GLBDBUSDLPADDRESS = "";
    let StakingWarmup;
    let staking;
    let StakingHelper;
    let GlobalDAOBondingCalculator;
    let RedeemHelper;

    const Router = await ethers.getContractFactory("Router");
    const BUSD = await ethers.getContractFactory('BEP20Token');

    // Quants blocs dura el epoch (staking)
    let epochLengthInBlocks = '20';

    // Quin bloc serà el primer que doni staking
    let firstBlockEpoch = await ethers.provider.getBlockNumber();

    console.log('Deploying contracts. Deployer account: ' + deployer.address + '. Multisig account: ' + MULTISIG_ADDRESS + '.');

    // Deploy GLBD
    console.log("[Deploying GLBD SC]");
    const GLBDT = await ethers.getContractFactory('GlobalDAOToken');
    if (deployOrAttach) {
        GLBD = await GLBDT.deploy();
        console.log("[GLBD deployed]: " + GLBD.address + ".");
    } else {
        GLBD = await GLBDT.attach(GLBD_ADDRESS);
        console.log("[GLBD attached]: " + GLBD_ADDRESS + ".");
    }
    await new Promise(r => setTimeout(() => r(), 3000));

    // Deploy sGLBD
    console.log("[Deploying sGLBD SC]");
    const sGLBDT = await ethers.getContractFactory('GlobalDAOToken');
    if (deployOrAttach) {
        sGLBD = await sGLBDT.deploy();
        console.log("[sGLBD deployed]: " + sGLBD.address + ".");
    } else {
        sGLBD = await sGLBDT.attach(sGLBD_ADDRESS);
        console.log("[sGLBD attached]: " + sGLBD_ADDRESS + ".");
    }
    await new Promise(r => setTimeout(() => r(), 3000));

    // Set deployer as a vault for GLBD Token
    if (setGLBDVault) {
        console.log("[Set deployer as a vault for GLBD Token]");
        await GLBD.setVault(DEPLOYER_ADDRESS);
        console.log("[Success]");
        await new Promise(r => setTimeout(() => r(), 3000));
    }

    // Mint 10 GLBD
    if (mint10GLBD) {
        console.log("[Deployer mints (extra?) 10 GLBD]");
        await GLBD.mint(DEPLOYER_ADDRESS, INITIAL_SUPPLY);
        console.log("[Success]");
        await new Promise(r => setTimeout(() => r(), 3000));
    }

    // SCs
    if (deployOrAttach) {
        // Testnet
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

        // Deploy BUSD
        console.log("[Deploying BUSD SC]");
        busd = await BUSD.deploy();
        console.log("[BUSDt deployed]: " + busd.address + ".");

        // Deployer mints 10 BUSD
        console.log("[Deployer mints 10 BUSD]");
        await busd.mint(INITIAL_SUPPLY);
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

    }

if (settersTestnet){
    // Set Treasury as GLBD vault
    console.log(1,"/",TOTAL_STEPS, ". Set Treasury as GLBD vault.");
    await glbd.setVault(TREASURY_ADDRESS);
    await new Promise(r => setTimeout(() => r(), 5000));
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

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})


/*

    const BUSD = await ethers.getContractFactory('BEP20Token');
    //const busd = await BUSD.deploy();
    const busd = await BUSD.attach(BUSD_ADDRESS);
    //await busd.mint(INITIAL_SUPPLY);
    //console.log( "BUSD: " + busd.address );
    await busd.approve(ROUTER_BEGLOBAL_ADDRESS, INITIAL_SUPPLY_B);
    console.log( "BUSD approved.");
    await new Promise(r => setTimeout(() => r(), 10000));


        let date = new Date();
const timestamp = date.setTime(date.getTime());

//await glbd.approve(ROUTER_BEGLOBAL_ADDRESS, INITIAL_SUPPLY);
//console.log( "GLBD approved.");

*/