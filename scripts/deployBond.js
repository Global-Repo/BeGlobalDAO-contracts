const { ethers } = require("hardhat");
const { BigNumber } = require("@ethersproject/bignumber");
const {
    DEPLOYER_ADDRESS,
    MULTISIG_ADDRESS,
    GLBD_ADDRESS,
    TREASURY_ADDRESS,
    STAKING_HELPER_ADDRESS,
    BONDING_CALCULATOR_ADDRESS,
    REDEEM_HELPER_ADDRESS,
    BUSD_ADDRESS,
    ROUTER_BEGLOBAL_ADDRESS,
    BUSD_BOND_ADDRESS
} = require("./addresses_mainnet");

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
    const busdBondBCV = '300';

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

    // Initial Bond debt
    const intialBUSDBondDebt = '6000000000000';

    const BUSD = await ethers.getContractFactory('GlobalDAOToken');
    const busd = await BUSD.attach(BUSD_ADDRESS);

    const Treasury = await ethers.getContractFactory('GlobalDAOTreasury');
    const treasury = await Treasury.attach(TREASURY_ADDRESS);

    const RedeemHelper = await ethers.getContractFactory('RedeemHelper');
    const redeemHelper = await RedeemHelper.attach(REDEEM_HELPER_ADDRESS);

    // Deploy BUSD bond
    //@dev changed function call to Treasury of 'valueOf' to 'valueOfToken' in BondDepository due to change in Treausry contract
    /*const BUSDBond = await ethers.getContractFactory('GlobalDAOBondDepository');
    const busdBond = await BUSDBond.attach(BUSD_BOND_ADDRESS);*/
    const BUSDBond = await ethers.getContractFactory('GlobalDAOBondDepository');
    //const busdBond = await BUSDBond.deploy(GLBD_ADDRESS, BUSD_ADDRESS, TREASURY_ADDRESS, MULTISIG_ADDRESS, BONDING_CALCULATOR_ADDRESS);
    const busdBond = await BUSDBond.attach(BUSD_BOND_ADDRESS);
    console.log("BUSD Bond: " + BUSD_BOND_ADDRESS);
/*
    console.log('Setting BUSD Bond');
    // Set BUSD bond terms
    await busdBond.initializeBondTerms(busdBondBCV, bondVestingLength, minBondPrice, maxBondPayout, bondFee, maxBUSDBondDebt, intialBUSDBondDebt);
    // Set staking for BUSD bond
    await new Promise(r => setTimeout(() => r(), 5000));
    await busdBond.setStaking(STAKING_HELPER_ADDRESS, true);
    // queue and toggle BUSD bond reserve depositor
    // Queue busdBond as reserve depositoir
    await new Promise(r => setTimeout(() => r(), 5000));
    console.log("Queue busdBond as reserve depositoir.");
    await treasury.queue('0', BUSD_BOND_ADDRESS);
    await new Promise(r => setTimeout(() => r(), 5000));

    // Toggle busdBond as reserve depositoir
    console.log(". Toggle busdBond as reserve depositoir.");
    await treasury.toggle('0', BUSD_BOND_ADDRESS, BONDING_CALCULATOR_ADDRESS);
    await new Promise(r => setTimeout(() => r(), 5000));


    //await treasury.queue('0', busdBond.address);
    //await treasury.toggle('0', busdBond.address, BONDING_CALCULATOR_ADDRESS);
    console.log("redeemHelper.addBondContract(BUSD_BOND_ADDRESS)");
    await redeemHelper.addBondContract(BUSD_BOND_ADDRESS);
    await new Promise(r => setTimeout(() => r(), 5000));

    console.log("busd.approve(ROUTER_BEGLOBAL_ADDRESS, largeApproval ))");
    await busd.approve(ROUTER_BEGLOBAL_ADDRESS, largeApproval );
    await new Promise(r => setTimeout(() => r(), 5000));

    console.log("busd.approve(TREASURY_ADDRESS, largeApproval )");
    await busd.approve(TREASURY_ADDRESS, largeApproval );
    await new Promise(r => setTimeout(() => r(), 5000));

    console.log("busd.approve(BUSD_BOND_ADDRESS, largeApproval )");
    await busd.approve(BUSD_BOND_ADDRESS, largeApproval );
    await new Promise(r => setTimeout(() => r(), 5000));
*/
    console.log("busdBond.deposit('1000000000','1000000000000000000000000',DEPLOYER_ADDRESS)");
    await busdBond.deposit('1000000000','1000000000000000000000',DEPLOYER_ADDRESS); //TODO revisar
    //await busdBond.setAdjustment(false,'2','40','0');
/*
    await hre.run("verify:verify", {
        address: busdBond.address,
        constructorArguments: [
            GLBD_ADDRESS,
            BUSD_ADDRESS,
            TREASURY_ADDRESS,
            MULTISIG_ADDRESS,
            BONDING_CALCULATOR_ADDRESS,
            BUSD_BOND_ADDRESS
        ],
    });

    await hre.run("verify:verify", {
        address: BUSD_BOND_ADDRESS,//busdBond.address,
        constructorArguments: [
            GLBD_ADDRESS, BUSD_ADDRESS, TREASURY_ADDRESS, MULTISIG_ADDRESS, BONDING_CALCULATOR_ADDRESS
        ],
    });*/

    console.log( "BUSD_BOND verified: " + busdBond.address );

    console.log("DEPLOYMENT SUCCESSFULLY FINISHED");
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})
