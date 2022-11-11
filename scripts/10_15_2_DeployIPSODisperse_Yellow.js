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
    console.log("[Disperse statistics for Yellow]");
    const IPSO = await ethers.getContractFactory('IPSO5');
    let ipso = await IPSO.attach("0x324888D5E7132bF17E2F7380E4e2F4c0a4ae7Ee7");

    let user;
    //let userAllocation;
    let amountInvested;
    const numUsers = await ipso.getAddressListLength();
    const totalAmountInvested = await ipso.totalAmountInvested();
    const raisingAmount = await ipso.raisingAmount();

    console.log("totalAmountInvested");
    console.log(totalAmountInvested/BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG);
    console.log("raisingAmount");
    console.log(raisingAmount/BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG);
    console.log("numUsers");
    console.log(numUsers);

    for (let i = 0; i < numUsers; i++) {
        user = await ipso.addressList(i);
        console.log(user);
    }

    for (let i = 0; i < numUsers; i++) {
        user = await ipso.addressList(i);
        [amountInvested,,,,,,] = await ipso.userInfo(user);
        //refunded /= 1000000000000000000;
        console.log((amountInvested*raisingAmount)/(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG*totalAmountInvested));
    }

    console.log("Statistics successfully printed");
}


main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
    })

