const { ethers } = require("hardhat");
const { BigNumber } = require("@ethersproject/bignumber");
const {
    MULTISIG_ADDRESS,
    GLBD_ADDRESS,
    SGLBD_ADDRESS,
    BUSD_ADDRESS,
    GLBD_BUSD_LP_ADDRESS
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

    /*const BUSD = await ethers.getContractFactory('BEP20Token');
    const busd = await BUSD.attach(BUSD_ADDRESS);

    // Deploy GLBD
    const GLBD = await ethers.getContractFactory('GlobalDAOToken');
    const glbd = await GLBD.attach(GLBD_ADDRESS);

    // Deploy sGLBD
    const SGLBD = await ethers.getContractFactory('sGlobalDAOToken');
    const sGLBD = await SGLBD.attach(SGLBD_ADDRESS);*/

    let date = new Date();
    const timestamp = date.setTime(date.getTime());

    // Deploy treasury
    //@dev changed function in tresaury from 'valueOf' to 'valueOfToken'... solidity function was conflicting w js object property name
    //const Treasury = await ethers.getContractFactory('GlobalDAOTreasury');
    const Treasury = await ethers.getContractFactory('MockGlobalDAOTreasury');
    const treasury = await Treasury.deploy( GLBD_ADDRESS, BUSD_ADDRESS, GLBD_BUSD_LP_ADDRESS, 0 );
    console.log( "Treasury: " + treasury.address );

    // Deploy staking distributor
    const Distributor = await ethers.getContractFactory('Distributor');
    const distributor = await Distributor.deploy(treasury.address, GLBD_ADDRESS, epochLengthInBlocks, firstEpochBlock);
    console.log( "Distributor " + distributor.address);

    // Deploy Staking
    const Staking = await ethers.getContractFactory('GlobalDAOStaking');
    const staking = await Staking.deploy( GLBD_ADDRESS, SGLBD_ADDRESS, epochLengthInBlocks, firstEpochNumber, firstEpochBlock );
    console.log( "Staking: " + staking.address );
    //TODO revisar els firstEpochNumber, firstEpochBlock

    // Deploy staking helper
    const StakingHelper = await ethers.getContractFactory('StakingHelper');
    const stakingHelper = await StakingHelper.deploy(staking.address, GLBD_ADDRESS);
    console.log( "Staking Helper " + stakingHelper.address);

    // Deploy staking warmpup
    const StakingWarmup = await ethers.getContractFactory('StakingWarmup');
    const stakingWarmup = await StakingWarmup.deploy(staking.address, SGLBD_ADDRESS);
    console.log( "Staking Warmup " + stakingWarmup.address);

    // Deploy bonding calc
    const GlobalDAOBondingCalculator = await ethers.getContractFactory('GlobalDAOBondingCalculator');
    const globalDAOBondingCalculator = await GlobalDAOBondingCalculator.deploy(GLBD_ADDRESS);
    console.log( "Calc: " + globalDAOBondingCalculator.address );

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
