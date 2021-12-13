// @dev. This script will deploy this V1.1 of Olympus. It will deploy the whole ecosystem except for the LP tokens and their bonds. 
// This should be enough of a test environment to learn about and test implementations with the Olympus as of V1.1.
// Not that the every instance of the Treasury's function 'valueOf' has been changed to 'valueOfToken'... 
// This solidity function was conflicting w js object property name

const { ethers } = require("hardhat");
const {TREASURY_ADDRESS, BONDING_CALCULATOR_ADDRESS, DISTRIBUTOR_ADDRESS} = require("./addresses_testnet");

async function main() {

    const [deployer, MockDAO] = await ethers.getSigners();
    console.log('Verifying contracts with the account: ' + deployer.address);

    // Initial staking index
    const initialIndex = '7675210820';

    // First block epoch occurs
    const firstEpochBlock = '8961000';

    // What epoch will be first epoch
    const firstEpochNumber = '338';

    // How many blocks are in each epoch
    const epochLengthInBlocks = '2200';

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

    await hre.run("verify:verify", {
        address: OHM_ADDRESS,
        constructorArguments: [
        ],
    });
    console.log( "OHM verified: " + OHM_ADDRESS );

    await hre.run("verify:verify", {
        address: DAI_ADDRESS,
        constructorArguments: [
            0
        ],
    });
    console.log( "DAI verified: " + DAI_ADDRESS );

    await hre.run("verify:verify", {
        address: FRAX_ADDRESS,
        constructorArguments: [
            0
        ],
    });
    console.log( "FRAX verified: " + FRAX_ADDRESS );

    await hre.run("verify:verify", {
        address: TREASURY_ADDRESS_ADDRESS,
        constructorArguments: [
            OHM_ADDRESS,
            DAI_ADDRESS,
            FRAX_ADDRESS,
            0
        ],
    });
    console.log( "Treasury verified: " + TREASURY_ADDRESS_ADDRESS );

    await hre.run("verify:verify", {
        address: BONDING_CALCULATOR_ADDRESS,
        constructorArguments: [
            OHM_ADDRESS
        ],
    });
    console.log( "Bonding Calculator verified: " + BONDING_CALCULATOR_ADDRESS );

    await hre.run("verify:verify", {
        address: DISTRIBUTOR_ADDRESS,
        constructorArguments: [
            TREASURY_ADDRESS,
            OHM_ADDRESS,
            epochLengthInBlocks,
            firstEpochBlock
        ],
    });
    console.log( "Distributor verified: " + DISTRIBUTOR_ADDRESS );

    await hre.run("verify:verify", {
        address: SOHM_ADDRESS,
        constructorArguments: [
            TREASURY_ADDRESS,
            OHM_ADDRESS,
            epochLengthInBlocks,
            firstEpochBlock
        ],
    });
    console.log( "SOHM verified: " + SOHM_ADDRESS );

    await hre.run("verify:verify", {
        address: STAKING_ADDRESS,
        constructorArguments: [
            OHM_ADDRESS,
            SOHM_ADDRESS,
            epochLengthInBlocks,
            firstEpochNumber,
            firstEpochBlock
        ],
    });
    console.log( "Staking verified: " + STAKING_ADDRESS );

    await hre.run("verify:verify", {
        address: STAKING_WARMUP_ADDRESS,
        constructorArguments: [
            STAKING_ADDRESS,
            SOHM_ADDRESS
        ],
    });
    console.log( "StakingWarmup verified: " + STAKING_WARMUP_ADDRESS );

    await hre.run("verify:verify", {
        address: STAKING_HELPER_ADDRESS,
        constructorArguments: [
            STAKING_ADDRESS,
            OHM_ADDRESS
        ],
    });
    console.log( "StakingHelper verified: " + STAKING_HELPER_ADDRESS );

    await hre.run("verify:verify", {
        address: DAI_BOND_ADDRESS,
        constructorArguments: [
            OHM_ADDRESS,
            DAI_ADDRESS,
            TREASURY_ADDRESS,
            MockDAO.address,
            zeroAddress
        ],
    });
    console.log( "DAI_BOND_ADDRESS verified: " + DAI_BOND_ADDRESS );

    await hre.run("verify:verify", {
        address: FRAX_BOND_ADDRESS,
        constructorArguments: [
            OHM_ADDRESS,
            FRAX_ADDRESS,
            TREASURY_ADDRESS,
            MockDAO.address,
            zeroAddress
        ],
    });
    console.log( "FRAX_BOND_ADDRESS verified: " + FRAX_BOND_ADDRESS );

    console.log("VERIFICATION SUCCESSFULLY FINISHED");
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})
