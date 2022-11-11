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
    console.log("[Disperse statistics for 5irechain 5]");
    const IPSO = await ethers.getContractFactory('IPSO5');
    let ipso = await IPSO.attach("0xE35428cA7CAB5eca42EC0BdE8c173468Ed4D43b6");

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
        console.log((amountInvested)/(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG));
    }

    console.log("Statistics successfully printed");
}


main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
    })

