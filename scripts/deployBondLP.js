const { ethers } = require("hardhat");
const { BigNumber } = require("@ethersproject/bignumber");
const {
    DEPLOYER_ADDRESS,
    MULTISIG_ADDRESS,
    GLBD_ADDRESS,
    TREASURY_ADDRESS,
    STAKING_HELPER_ADDRESS,
    BONDING_CALCULATOR_ADDRESS,
    GLBD_BUSD_BOND_ADDRESS,
    REDEEM_HELPER_ADDRESS,
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

    // Large number for approval for GLBD
    const largeApproval = '100000000000000000000000000000000';

    // BUSD bond BCV
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
    const maxGLBDBUSDBondDebt = '40000000000000';

    // Initial Bond debt
    const intialGLBDBUSDBondDebt = '4000000000000';

    const Treasury = await ethers.getContractFactory('GlobalDAOTreasury');
    const treasury = await Treasury.attach(TREASURY_ADDRESS);

    const RedeemHelper = await ethers.getContractFactory('RedeemHelper');
    const redeemHelper = await RedeemHelper.attach(REDEEM_HELPER_ADDRESS);

    const GLBDBUSDLP = await ethers.getContractFactory('PancakeERC20');
    const glbdbusdLP = await GLBDBUSDLP.attach(GLBD_BUSD_LP_ADDRESS);

    // Deploy GLBD-BUSD bond
    /*const GLBDBUSDBond = await ethers.getContractFactory('GlobalDAOBondDepository');
    const glbdbusdBond = await GLBDBUSDBond.attach(GLBD_BUSD_BOND_ADDRESS);*/
    const GLBDBUSDBond = await ethers.getContractFactory('GlobalDAOBondDepository');
    const glbdbusdBond = await GLBDBUSDBond.deploy(GLBD_ADDRESS, GLBD_BUSD_LP_ADDRESS, TREASURY_ADDRESS, MULTISIG_ADDRESS, BONDING_CALCULATOR_ADDRESS);
    console.log("GLBD-BUSD Bond: " + glbdbusdBond.address);

    console.log('Setting BOND GLBD-BUSD');
    // Set GLBD-BUSD bond terms
    await glbdbusdBond.initializeBondTerms(glbdbusdBondBCV, bondVestingLength, minBondPrice, maxBondPayout, bondFee, maxGLBDBUSDBondDebt, intialGLBDBUSDBondDebt);
    // Set staking for GLBD-BUSD bond
    await glbdbusdBond.setStaking(STAKING_HELPER_ADDRESS, true);
    await treasury.queue('4', glbdbusdBond.address);
    await treasury.toggle('4', glbdbusdBond.address, BONDING_CALCULATOR_ADDRESS);

    await redeemHelper.addBondContract(glbdbusdBond.address);
    await glbdbusdLP.approve(ROUTER_BEGLOBAL_ADDRESS, largeApproval );
    await glbdbusdLP.approve(TREASURY_ADDRESS, largeApproval );
    await glbdbusdBond.deposit('20000000000000000','2613',DEPLOYER_ADDRESS); //TODO revisar
    await glbdbusdBond.setAdjustment(false,'2','40','0');

    await hre.run("verify:verify", {
        address: glbdbusdBond.address,
        constructorArguments: [
            GLBD_ADDRESS,
            GLBD_BUSD_LP_ADDRESS,
            TREASURY_ADDRESS,
            MULTISIG_ADDRESS,
            BONDING_CALCULATOR_ADDRESS
        ],
    });
    console.log( "GLBD_BUSD_BOND verified: " + glbdbusdBond.address );

    console.log("DEPLOYMENT SUCCESSFULLY FINISHED");
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})
