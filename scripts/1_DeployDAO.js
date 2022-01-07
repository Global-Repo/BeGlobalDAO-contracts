const { ethers } = require("hardhat");
const {
    ROUTER_BEGLOBAL_ADDRESS,
    DEPLOYER_ADDRESS,
    BUSD_ADDRESS,
    WETH_ADDRESS,
    FACTORY_ADDRESS,
} = require("./addresses_localhost");

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
    let redeemHelper;
    let deployBUSD = true;
    let originalAMM = false;
    let timeoutPeriod = 0;

    const GLBDT = await ethers.getContractFactory('GlobalDAOToken');
    const sGLBDT = await ethers.getContractFactory('sGlobalDAOToken');
    const BUSD = await ethers.getContractFactory('BEP20Token');

    // Quants blocs dura el epoch (staking): 12h.
    let epochLengthInBlocks = '1200'; // TODO Posar 14400 per indicar 12h al deploy de mainnet final.

    // Quin bloc serà el primer que doni staking [!]
    const firstBlockEpoch = '15608787'; //TODO pendent a posar 14166229 que és el dia 7 a les 21h aprox

    console.log("[Deploying from " + deployer.address + "]");

    // SETUP AMM ENVIRONMENT
    if (!originalAMM) {
        // Deploy factory
        factory = await deployFactory(DEPLOYER_ADDRESS);
        console.log("const FACTORY_ADDRESS = '" + factory.address+"';");
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));
    } else {
        // Attach factory
        const Factory = await ethers.getContractFactory("Factory");
        factory = await Factory.attach(FACTORY_ADDRESS);
        console.log("[Factory attached]: " + factory.address);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));
    }

    if (!originalAMM) {
        // Deploy Router
        router = await deployRouter(factory.address, WETH_ADDRESS); // Direcció WETH random només per tal de que funcioni el router.
        console.log("const ROUTER_BEGLOBAL_ADDRESS = '" + router.address+"';");
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));
    } else {
        // Attach Router
        const Router = await ethers.getContractFactory("Router");
        router = await Router.attach(ROUTER_BEGLOBAL_ADDRESS);
        console.log("[Router attached]: " + router.address);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));
    }

    if (deployBUSD) {
        // Deploy BUSD
        busd = await BUSD.deploy();
        console.log("const BUSD_ADDRESS = '" + busd.address+"';");
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));
    } else {
        // Attach BUSD
        busd = await BUSD.attach(BUSD_ADDRESS);
        console.log("[BUSDt attached]: " + busd.address);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));
    }


    // Deploy GLBD
    GLBD = await GLBDT.deploy();
    console.log("const GLBD_ADDRESS = '" + GLBD.address+"';");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Deploy sGLBD
    sGLBD = await sGLBDT.deploy();
    console.log("const SGLBD_ADDRESS = '" + sGLBD.address+"';");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Create GLBD-BUSD pair
    const createPair = await factory.createPair(GLBD.address, busd.address);
    const createP = await createPair.wait();
    const lpAddress = createP.events[0].args.pair;
    console.log("const GLBD_BUSD_LP_ADDRESS = '" + lpAddress+"';");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    const GLBDBUSDLP = await ethers.getContractFactory('PancakeERC20');
    glbdbusdLP = await GLBDBUSDLP.attach(lpAddress);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Deploy treasury
    const Treasury = await ethers.getContractFactory('GlobalDAOTreasury');
    treasury = await Treasury.deploy(GLBD.address, busd.address, glbdbusdLP.address, 0);
    console.log("const TREASURY_ADDRESS = '" + treasury.address+"';");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Deploy bonding calculator
    const GlobalDAOBondingCalculator = await ethers.getContractFactory('GlobalDAOBondingCalculator');
    globalDAOBondingCalculator = await GlobalDAOBondingCalculator.deploy(GLBD.address);
    console.log("const BONDING_CALCULATOR_ADDRESS = '" + globalDAOBondingCalculator.address+"';");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Redeem helper
    const RedeemHelper = await ethers.getContractFactory('RedeemHelper');
    redeemHelper = await RedeemHelper.deploy();
    console.log("const REDEEM_HELPER_ADDRESS = '" + redeemHelper.address+"';");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Deploy distributor
    const Distributor = await ethers.getContractFactory('Distributor');
    distributor = await Distributor.deploy(treasury.address, GLBD.address, epochLengthInBlocks, firstBlockEpoch); // 3r: número de blocs que dura epoch, posem 12h, 4rt: primer block que farà staking
    console.log("const DISTRIBUTOR_ADDRESS = '" + distributor.address+"';");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Deploy Staking
    const Staking = await ethers.getContractFactory('GlobalDAOStaking');
    staking = await Staking.deploy(GLBD.address, sGLBD.address, epochLengthInBlocks, 0, firstBlockEpoch);
    console.log("const STAKING_ADDRESS = '" + staking.address+"';");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Deploy StakingHelper
    const StakingHelper = await ethers.getContractFactory('StakingHelper');
    stakingHelper = await StakingHelper.deploy(staking.address, GLBD.address);
    console.log("const STAKING_HELPER_ADDRESS = '" + stakingHelper.address+"';");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Deploy WarmUp
    const StakingWarmup = await ethers.getContractFactory('StakingWarmup');
    stakingWarmup = await StakingWarmup.deploy(staking.address, sGLBD.address);
    console.log("const STAKING_WARMUP_ADDRESS = '" + stakingWarmup.address+"';");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    console.log("[Deploy sucessfull]");
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

