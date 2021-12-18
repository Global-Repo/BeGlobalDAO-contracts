const { ethers } = require("hardhat");
const { BigNumber } = require("@ethersproject/bignumber");
const {
    DEPLOYER_ADDRESS,
    MULTISIG_ADDRESS,
    BUSD_ADDRESS,
    GLBD_BUSD_LP_ADDRESS,
    ROUTER_BEGLOBAL_ADDRESS
} = require("./addresses_testnet");

const TOKEN_DECIMALS = 18;
const BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER = BigNumber.from(10).pow(TOKEN_DECIMALS);
const INITIAL_SUPPLY = BigNumber.from(100).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER);

let bep20Amount = function (amount) {
    return BigNumber.from(amount).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER);
}

async function main() {

    const [deployer] = await ethers.getSigners();
    console.log('Deploying contracts with the account: ' + deployer.address + ' and ' + MULTISIG_ADDRESS);

    // First block epoch occurs
    const firstEpochBlock = '8961000'; //TODO pendent a posar el bloc del dia 23 (dia del arranque)

    // What epoch will be first epoch
    //const firstEpochNumber = '338';
    const firstEpochNumber = '6'; //TODO pendent a posar el bloc del dia 25 quan (comença a comptar el staking???)

    // How many blocks are in each epoch
    //const epochLengthInBlocks = '2200';
    const epochLengthInBlocks = '9600';

    //TODO revisar parametres interns de tots els contractes
    /*const BUSD = await ethers.getContractFactory('GlobalDAOToken');
    const busd = await BUSD.deploy();
    console.log( "BUSD: " + busd.address );

    // Deploy GLBD
    const GLBD = await ethers.getContractFactory('GlobalDAOToken');
    const glbd = await GLBD.deploy();
    console.log( "GLBD: " + glbd.address );

    // Deploy sGLBD
    const SGLBD = await ethers.getContractFactory('sGlobalDAOToken');
    const sGLBD = await SGLBD.deploy();
    console.log( "sGLBD: " + sGLBD.address );*/

    const BGRouter = await ethers.getContractFactory('IRouterV1');
    const bgRouter = await BGRouter.attach(ROUTER_BEGLOBAL_ADDRESS);
    console.log( "BeGlobal router attached: " + bgRouter.address );

    let date = new Date();
    const timestamp = date.setTime(date.getTime());

    await glbd.mint(INITIAL_SUPPLY);
    await glbd.approve(ROUTER_BEGLOBAL_ADDRESS, INITIAL_SUPPLY.toHexString());
    await busd.mint(INITIAL_SUPPLY);
    await busd.approve(ROUTER_BEGLOBAL_ADDRESS, INITIAL_SUPPLY.toHexString());

    const tx3 = await router.addLiquidity(
        glbd.address,
        busd.address,
        bep20Amount(1),
        bep20Amount(2),
        bep20Amount(1),
        bep20Amount(2),
        DEPLOYER_ADDRESS,
        (new Date()).setTime((new Date()).getTime())
    );

    //TODO revisar com deposita els LPs al AMM

    // Deploy treasury
    //@dev changed function in tresaury from 'valueOf' to 'valueOfToken'... solidity function was conflicting w js object property name
    const Treasury = await ethers.getContractFactory('GlobalDAOTreasury');
    const treasury = await Treasury.deploy( glbd.address, BUSD_ADDRESS, 0 );
    console.log( "Treasury: " + treasury.address );

    // Deploy staking distributor
    const Distributor = await ethers.getContractFactory('Distributor');
    const distributor = await Distributor.deploy(treasury.address, glbd.address, epochLengthInBlocks, firstEpochBlock);
    console.log( "Distributor " + distributor.address);

    // Deploy Staking
    const Staking = await ethers.getContractFactory('GlobalDAOStaking');
    const staking = await Staking.deploy( glbd.address, sGLBD.address, epochLengthInBlocks, firstEpochNumber, firstEpochBlock );
    console.log( "Staking: " + staking.address );
    //TODO revisar els firstEpochNumber, firstEpochBlock

    // Deploy staking helper
    const StakingHelper = await ethers.getContractFactory('StakingHelper');
    const stakingHelper = await StakingHelper.deploy(staking.address, glbd.address);
    console.log( "Staking Helper " + stakingHelper.address);

    // Deploy staking warmpup
    const StakingWarmup = await ethers.getContractFactory('StakingWarmup');
    const stakingWarmup = await StakingWarmup.deploy(staking.address, sGLBD.address);
    console.log( "Staking Warmup " + stakingWarmup.address);

    // Deploy bonding calc
    const GlobalDAOBondingCalculator = await ethers.getContractFactory('GlobalDAOBondingCalculator');
    const globalDAOBondingCalculator = await GlobalDAOBondingCalculator.deploy( glbd.address );
    console.log( "Calc: " + globalDAOBondingCalculator.address );

    // Deploy BUSD bond
    //@dev changed function call to Treasury of 'valueOf' to 'valueOfToken' in BondDepository due to change in Treausry contract
    const BUSDBond = await ethers.getContractFactory('GlobalDAOBondDepository');
    const busdBond = await BUSDBond.deploy(glbd.address, BUSD_ADDRESS, treasury.address, MULTISIG_ADDRESS, globalDAOBondingCalculator.address);
    console.log("BUSD Bond: " + busdBond.address);

    // Deploy GLBD-BUSD bond
    const GLBDBUSDBond = await ethers.getContractFactory('GlobalDAOBondDepository');
    const glbdbusdBond = await GLBDBUSDBond.deploy(glbd.address, GLBD_BUSD_LP_ADDRESS, treasury.address, MULTISIG_ADDRESS, globalDAOBondingCalculator.address); //TODO posar LP address i fer wallet multisig
    console.log("GLBD-BUSD Bond: " + glbdbusdBond.address);

    // Deploy redeem helper
    const RedeemHelper = await ethers.getContractFactory('RedeemHelper');
    const redeemHelper = await RedeemHelper.deploy();
    console.log( "Redeem Helper " + redeemHelper.address);

    console.log("DEPLOYMENT SUCCESSFULLY FINISHED");
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})
