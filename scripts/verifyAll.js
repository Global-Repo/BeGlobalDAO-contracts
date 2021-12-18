const { ethers } = require("hardhat");
const {
    MULTISIG_ADDRESS,
    GLBD_ADDRESS,
    SGLBD_ADDRESS,
    TREASURY_ADDRESS,
    DISTRIBUTOR_ADDRESS,
    STAKING_ADDRESS,
    STAKING_HELPER_ADDRESS,
    STAKING_WARMUP_ADDRESS,
    BONDING_CALCULATOR_ADDRESS,
    BUSD_BOND_ADDRESS,
    GLBD_BUSD_BOND_ADDRESS,
    REDEEM_HELPER_ADDRESS,
    BUSD_ADDRESS,
    GLBD_BUSD_LP_ADDRESS
} = require("./addresses_testnet");

async function main() {

    const [deployer, MockDAO] = await ethers.getSigners();
    console.log('Verifying contracts with the account: ' + deployer.address);

    // First block epoch occurs
    const firstEpochBlock = '8961000';

    // What epoch will be first epoch
    const firstEpochNumber = '338';

    // How many blocks are in each epoch
    const epochLengthInBlocks = '2200';


    await hre.run("verify:verify", {
        address: BUSD_ADDRESS,
        constructorArguments: [
        ],
    });
    console.log( "BUSD verified: " + BUSD_ADDRESS );


    await hre.run("verify:verify", {
        address: GLBD_ADDRESS,
        constructorArguments: [
        ],
    });
    console.log( "GLBD verified: " + GLBD_ADDRESS );

    await hre.run("verify:verify", {
        address: SGLBD_ADDRESS,
        constructorArguments: [
        ],
    });
    console.log( "SGLBD verified: " + SGLBD_ADDRESS );

    await hre.run("verify:verify", {
        address: TREASURY_ADDRESS,
        constructorArguments: [
            GLBD_ADDRESS,
            BUSD_ADDRESS,
            0
        ],
    });
    console.log( "TREASURY verified: " + TREASURY_ADDRESS );

    await hre.run("verify:verify", {
        address: DISTRIBUTOR_ADDRESS,
        constructorArguments: [
            TREASURY_ADDRESS,
            GLBD_ADDRESS,
            epochLengthInBlocks,
            firstEpochBlock
        ],
    });
    console.log( "DISTRIBUTOR verified: " + DISTRIBUTOR_ADDRESS );

    await hre.run("verify:verify", {
        address: STAKING_ADDRESS,
        constructorArguments: [
            GLBD_ADDRESS,
            SGLBD_ADDRESS,
            epochLengthInBlocks,
            firstEpochNumber,
            firstEpochBlock
        ],
    });
    console.log( "STAKING verified: " + STAKING_ADDRESS );

    await hre.run("verify:verify", {
        address: STAKING_HELPER_ADDRESS,
        constructorArguments: [
            STAKING_ADDRESS,
            GLBD_ADDRESS
        ],
    });
    console.log( "STAKING_HELPER verified: " + STAKING_HELPER_ADDRESS );

    await hre.run("verify:verify", {
        address: STAKING_WARMUP_ADDRESS,
        constructorArguments: [
            STAKING_ADDRESS,
            SGLBD_ADDRESS
        ],
    });
    console.log( "STAKING_WARMUP verified: " + STAKING_WARMUP_ADDRESS );

    await hre.run("verify:verify", {
        address: BONDING_CALCULATOR_ADDRESS,
        constructorArguments: [
            GLBD_ADDRESS
        ],
    });
    console.log( "BONDING_CALCULATOR verified: " + BONDING_CALCULATOR_ADDRESS );

    await hre.run("verify:verify", {
        address: BUSD_BOND_ADDRESS,
        constructorArguments: [
            GLBD_ADDRESS,
            BUSD_ADDRESS,
            TREASURY_ADDRESS,
            MULTISIG_ADDRESS,
            BONDING_CALCULATOR_ADDRESS
        ],
    });
    console.log( "BUSD_BOND verified: " + BUSD_BOND_ADDRESS );

    await hre.run("verify:verify", {
        address: GLBD_BUSD_BOND_ADDRESS,
        constructorArguments: [
            GLBD_ADDRESS,
            GLBD_BUSD_LP_ADDRESS,
            TREASURY_ADDRESS,
            MULTISIG_ADDRESS,
            BONDING_CALCULATOR_ADDRESS
        ],
    });
    console.log( "GLBD_BUSD_BOND verified: " + GLBD_BUSD_BOND_ADDRESS );

    await hre.run("verify:verify", {
        address: REDEEM_HELPER_ADDRESS,
        constructorArguments: [
        ],
    });
    console.log( "REDEEM_HELPER verified: " + REDEEM_HELPER_ADDRESS );




    // Initial staking index
    const initialIndex = '7675210820';

    // Initial reward rate for epoch
    const initialRewardRate = '3000';

    // Ethereum 0 address, used when toggling changes in treasury
    const zeroAddress = '0x0000000000000000000000000000000000000000';

    // Large number for approval for Frax and DAI
    const largeApproval = '100000000000000000000000000000000';

    // Initial mint for Frax and DAI (10,000,000)
    const initialMint = '10000000000000000000000000';

    // DAI bond BCV
    const daiBondBCV = '369';

    // Frax bond BCV
    const fraxBondBCV = '690';

    // Bond vesting length in blocks. 33110 ~ 5 days
    const bondVestingLength = '33110';

    // Min bond price
    const minBondPrice = '50000';

    // Max bond payout
    const maxBondPayout = '50'

    // DAO fee for bond
    const bondFee = '10000';

    // Max debt bond can take on
    const maxBondDebt = '1000000000000000';

    // Initial Bond debt
    const intialBondDebt = '0'

    console.log("VERIFICATION SUCCESSFULLY FINISHED");
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})
