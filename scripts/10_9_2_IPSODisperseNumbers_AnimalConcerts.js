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

    //MAINNET
    console.log("[Disperse statistics for Animal Concerts]");
    const IPSO = await ethers.getContractFactory('IPSO3');
    let ipso = await IPSO.attach("0x84d9E63251aca5Ed54488888052fb990d58fE8f3");

    let user;
    let userAllocation;
    let amountToDistribute;
    const numUsers = await ipso.getAddressListLength();
    const totalAmountInvested = await ipso.totalAmountInvested();
    const tokensToDisperse = 100000;
    /*const tokensToDisperseUser1 = tokensToDisperse * 0.015;
    const tokensToDisperseUser2 = tokensToDisperse * 0.01;*/
    const tokensToDisperseToUsers = tokensToDisperse; // * 0.95;

    console.log(totalAmountInvested);

    /*console.log("", tokensToDisperseUser1.toFixed(2));
    console.log("", tokensToDisperseUser2.toFixed(2));*/

    for (let i = 0; i < numUsers; i++) {
        user = await ipso.addressList(i);
        [userAllocation,,,,,,] = await ipso.userInfo(user);
        amountToDistribute = tokensToDisperseToUsers * userAllocation / totalAmountInvested;
        console.log(user, amountToDistribute.toFixed(2));
    }


    console.log("Statistics successfully printed");
}


main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})

