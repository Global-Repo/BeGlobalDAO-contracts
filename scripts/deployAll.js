// @dev. This script will deploy this V1.1 of Olympus. It will deploy the whole ecosystem except for the LP tokens and their bonds. 
// This should be enough of a test environment to learn about and test implementations with the Olympus as of V1.1.
// Not that the every instance of the Treasury's function 'valueOf' has been changed to 'valueOfToken'... 
// This solidity function was conflicting w js object property name

const { ethers } = require("hardhat");

async function main() {

    const [deployer, MockDAO] = await ethers.getSigners();
    console.log('Deploying contracts with the account: ' + deployer.address);

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
    console.log(1);
    // Deploy OHM
    const OHM = await ethers.getContractFactory('OlympusERC20Token');
    //const ohm = await OHM.deploy();
    const ohm = await OHM.attach("0x5A2f4Ddd22c4098420bEf64ecBB8cE5aeB769A41");
    console.log( "OHM: " + ohm.address );
    console.log(2);

    // Deploy DAI
    const DAI = await ethers.getContractFactory('DAI');
    //const dai = await DAI.deploy( 0 );
    const dai = await DAI.attach( "0x46fd3695faF3100ec3000f7E1903f9Db94cFBf19" );
    console.log( "DAI: " + dai.address );
    console.log(3);

    // Deploy Frax
    const Frax = await ethers.getContractFactory('FRAX');
    //const frax = await Frax.deploy( 0 );
    const frax = await Frax.attach( "0xa10B7BfD30AFd3Cdad24f48055664935993Ac62A" );
    console.log( "Frax: " + frax.address );
    console.log(4);

    // Deploy 10,000,000 mock DAI and mock Frax
    await dai.mint( deployer.address, initialMint );
    await frax.mint( deployer.address, initialMint );
    console.log(5);

    // Deploy treasury
    //@dev changed function in treaury from 'valueOf' to 'valueOfToken'... solidity function was coflicting w js object property name
    const Treasury = await ethers.getContractFactory('MockOlympusTreasury'); 
    //const treasury = await Treasury.deploy( ohm.address, dai.address, frax.address, 0 );
    const treasury = await Treasury.attach( "0xDe5B7f31bB96696e462b412e9564E2475767e532" );
    console.log( "Treasury: " + treasury.address );
    console.log(6);

    // Deploy bonding calc
    const OlympusBondingCalculator = await ethers.getContractFactory('OlympusBondingCalculator');
    //const olympusBondingCalculator = await OlympusBondingCalculator.deploy( ohm.address );
    const olympusBondingCalculator = await OlympusBondingCalculator.deploy( "0x3201bA341Ba8792458032b6058eFB3FFdB17FF90" );
    console.log( "Calc: " + olympusBondingCalculator.address );
    console.log(7);

    // Deploy staking distributor
    const Distributor = await ethers.getContractFactory('Distributor');
    //const distributor = await Distributor.deploy(treasury.address, ohm.address, epochLengthInBlocks, firstEpochBlock);
    const distributor = await Distributor.attach("0xc2830f3E10acdEB38D5e43291f7b5F639c936B6F");
    console.log( "Distributor " + distributor.address);
    console.log(8);

    // Deploy sOHM
    const SOHM = await ethers.getContractFactory('sOlympus');
    //const sOHM = await SOHM.deploy();
    const sOHM = await SOHM.attach("0xe93eA08b69b7e6c6bc12013E1dEf86096e09F3e2");
    console.log( "sOHM: " + sOHM.address );
    console.log(9);

    // Deploy Staking
    const Staking = await ethers.getContractFactory('OlympusStaking');
    //const staking = await Staking.deploy( ohm.address, sOHM.address, epochLengthInBlocks, firstEpochNumber, firstEpochBlock );
    const staking = await Staking.attach( "0x332C95ceA895B94d56b87c945AB42E80a67615f7" );
    console.log( "Staking: " + staking.address );
    console.log(10);

    // Deploy staking warmpup
    const StakingWarmpup = await ethers.getContractFactory('StakingWarmup');
    //const stakingWarmup = await StakingWarmpup.deploy(staking.address, sOHM.address);
    const stakingWarmup = await StakingWarmpup.attach("0x52d6eb61f15A7259046D6D167e9b7EcA335FD45a");
    console.log( "Staking Warmup " + stakingWarmup.address);
    console.log(11);

    // Deploy staking helper
    const StakingHelper = await ethers.getContractFactory('StakingHelper');
    //const stakingHelper = await StakingHelper.deploy(staking.address, ohm.address);
    const stakingHelper = await StakingHelper.attach("0x2BFF42bc1b61834ECd769bc1b54E9F6fF84b4a9E");
    console.log( "Staking Helper " + stakingHelper.address);
    console.log(12);

    // Deploy DAI bond
    //@dev changed function call to Treasury of 'valueOf' to 'valueOfToken' in BondDepository due to change in Treausry contract
    const DAIBond = await ethers.getContractFactory('MockOlympusBondDepository');
    //const daiBond = await DAIBond.deploy(ohm.address, dai.address, treasury.address, MockDAO.address, zeroAddress);
    const daiBond = await DAIBond.attach("0x634DE04EcbA54EE4BBf3eE1F7C1F807d0752d260");
    console.log("DAI Bond: " + daiBond.address);
    console.log(13);

    // Deploy Frax bond
    //@dev changed function call to Treasury of 'valueOf' to 'valueOfToken' in BondDepository due to change in Treausry contract
    const FraxBond = await ethers.getContractFactory('MockOlympusBondDepository');
    //const fraxBond = await FraxBond.deploy(ohm.address, frax.address, treasury.address, MockDAO.address, zeroAddress);
    const fraxBond = await FraxBond.attach("0x9E259D6200440Ce5e414F3a459056A576644Bcbf");
    console.log("Frax Bond: " + fraxBond.address);
    console.log(14);

    // queue and toggle DAI and Frax bond reserve depositor
    /*await treasury.queue('0', daiBond.address);
    await treasury.queue('0', fraxBond.address);
    await treasury.toggle('0', daiBond.address, zeroAddress);
    await treasury.toggle('0', fraxBond.address, zeroAddress);
    console.log(15);

    // Set DAI and Frax bond terms
    await daiBond.initializeBondTerms(daiBondBCV, bondVestingLength, minBondPrice, maxBondPayout, bondFee, maxBondDebt, intialBondDebt);
    await fraxBond.initializeBondTerms(fraxBondBCV, bondVestingLength, minBondPrice, maxBondPayout, bondFee, maxBondDebt, intialBondDebt);
    console.log(16);

    // Set staking for DAI and Frax bond
    await daiBond.setStaking(staking.address, stakingHelper.address);
    await fraxBond.setStaking(staking.address, stakingHelper.address);
    console.log(17);

    // Initialize sOHM and set the index
    await sOHM.initialize(staking.address);
    await sOHM.setIndex(initialIndex);
    console.log(18);

    // set distributor contract and warmup contract
    await staking.setContract('0', distributor.address);
    await staking.setContract('1', stakingWarmup.address);
    console.log(19);

    // Set treasury for OHM token
    await ohm.setVault(treasury.address);
    console.log(20);

    // Add staking contract as distributor recipient
    await distributor.addRecipient(staking.address, initialRewardRate);*/
    console.log(21);

    // queue and toggle reward manager
    await treasury.queue('8', distributor.address);
    await treasury.toggle('8', distributor.address, zeroAddress);
    console.log(22);

    // queue and toggle deployer reserve depositor
    await treasury.queue('0', deployer.address);
    await treasury.toggle('0', deployer.address, zeroAddress);
    console.log(23);

    // queue and toggle liquidity depositor
    await treasury.queue('4', deployer.address, );
    await treasury.toggle('4', deployer.address, zeroAddress);
    console.log(24);

    // Approve the treasury to spend DAI and Frax
    await dai.approve(treasury.address, largeApproval );
    await frax.approve(treasury.address, largeApproval );
    console.log(25);

    // Approve dai and frax bonds to spend deployer's DAI and Frax
    await dai.approve(daiBond.address, largeApproval );
    await frax.approve(fraxBond.address, largeApproval );
    console.log(26);

    // Approve staking and staking helper contact to spend deployer's OHM
    await ohm.approve(staking.address, largeApproval);
    await ohm.approve(stakingHelper.address, largeApproval);
    console.log(27);

    // Deposit 9,000,000 DAI to treasury, 600,000 OHM gets minted to deployer and 8,400,000 are in treasury as excesss reserves
    await treasury.deposit('9000000000000000000000000', dai.address, '8400000000000000');
    console.log(28);

    // Deposit 5,000,000 Frax to treasury, all is profit and goes as excess reserves
    await treasury.deposit('5000000000000000000000000', frax.address, '5000000000000000');
    console.log(29);

    // Stake OHM through helper
    await stakingHelper.stake('100000000000');
    console.log(30);

    // Bond 1,000 OHM and Frax in each of their bonds
    await daiBond.deposit('1000000000000000000000', '60000', deployer.address );
    await fraxBond.deposit('1000000000000000000000', '60000', deployer.address );

    console.log("DEPLOYMENT SUCCESSFULLY FINISHED");
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})
