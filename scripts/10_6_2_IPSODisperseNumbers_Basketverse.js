const { ethers } = require("hardhat");
const {
    BUSD_ADDRESS,
    GLBD_ADDRESS,
    DEPLOYER_ADDRESS,
    GLB_ADDRESS,
    SGLBD_ADDRESS
} = require("./addresses_testnet");
const {BigNumber} = require("@ethersproject/bignumber");

const TOKEN_DECIMALS_LITTLE = 9;
const BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_LITTLE = BigNumber.from(10).pow(TOKEN_DECIMALS_LITTLE);
const INITIAL_SUPPLY = BigNumber.from(60000).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_LITTLE);

const TOKEN_DECIMALS_BIG = 18;
const BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG = BigNumber.from(10).pow(TOKEN_DECIMALS_BIG);
const INITIAL_SUPPLY_BIG = BigNumber.from(60000).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG);

async function main() {

    const [deployer] = await ethers.getSigners();

    console.log('Deploying contracts. Deployer account: ' + deployer.address);

    let busd;
    let timeoutPeriod = 10000;
    const BUSD = await ethers.getContractFactory('BEP20Token');
    // Deploy BUSD
    console.log("[Deploying BUSD SC]");
    busd = await BUSD.deploy();
    console.log("[BUSDt deployed]: " + busd.address);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Deployer mints 100 BUSD
    console.log("[Deployer mints 100 BUSD]");
    await busd.mint(INITIAL_SUPPLY_BIG);
    //await busd.transfer("0xa978688CE4721f0e28CF85c4C2b0f55d3186736f",INITIAL_SUPPLY);
    console.log("[Success]");


    //MAINNET
    console.log("[Disperse statistics for PenguinKarts]");
    const IPSO = await ethers.getContractFactory('IPSO3');
    let ipso = await IPSO.attach("0x729cf4928C332Cc6964AE3acE91Dfc0283f67A01");

    let user;
    let userAllocation;
    let amountToDistribute;
    const numUsers = await ipso.getAddressListLength();
    let totalAmountInvested = await ipso.totalAmountInvested();

    for (let i = 0; i < numUsers; i++) {
        user = await ipso.addressList(i);
        [userAllocation,,,,,,] = await ipso.userInfo(user);
        console.log(user, userAllocation/1000000000000000000);
        totalAmountInvested-=userAllocation;
    }

    console.log(numUsers);
    console.log(totalAmountInvested);

    console.log("Statistics successfully printed");
}


main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})

