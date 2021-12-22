const { ethers } = require("hardhat");
const { BigNumber } = require("@ethersproject/bignumber");
const {
    MULTISIG_ADDRESS,
    ROUTER_BEGLOBAL_ADDRESS, DEPLOYER_ADDRESS, GLBD_ADDRESS, SGLBD_ADDRESS, BUSD_ADDRESS
} = require("./addresses_mainnet");


const TOKEN_DECIMALS = 9;
const BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER = BigNumber.from(10).pow(TOKEN_DECIMALS);
const INITIAL_SUPPLY = BigNumber.from(100).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER);

const TOKEN_DECIMALS_B = 18;
const BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_B = BigNumber.from(10).pow(TOKEN_DECIMALS_B);
const INITIAL_SUPPLY_B = BigNumber.from(100).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_B);

let bep20Amount = function (amount) {
    return BigNumber.from(amount).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER);
}
// npm -
async function main() {

    const [deployer] = await ethers.getSigners();
    console.log('Deploying contracts with the account: ' + deployer.address + ' and ' + MULTISIG_ADDRESS);
/*
    //TODO revisar parametres interns de tots els contractes
    const BUSD = await ethers.getContractFactory('BEP20Token');
    //const busd = await BUSD.deploy();
    const busd = await BUSD.attach(BUSD_ADDRESS);
    //await busd.mint(INITIAL_SUPPLY);
    //console.log( "BUSD: " + busd.address );
    await busd.approve(ROUTER_BEGLOBAL_ADDRESS, INITIAL_SUPPLY_B);
    console.log( "BUSD approved.");
    await new Promise(r => setTimeout(() => r(), 10000));
*/
    // Deploy GLBD
    const GLBD = await ethers.getContractFactory('GlobalDAOToken');
    //const glbd = await GLBD.deploy();
    const glbd = await GLBD.attach(GLBD_ADDRESS);
    console.log( "GLBD: " + glbd.address );

    // Deploy sGLBD
    const SGLBD = await ethers.getContractFactory('sGlobalDAOToken');
    //const sGLBD = await SGLBD.deploy();
    const sGLBD = await SGLBD.attach(SGLBD_ADDRESS);
    console.log( "sGLBD: " + sGLBD.address );

    let date = new Date();
    const timestamp = date.setTime(date.getTime());

    //await glbd.approve(ROUTER_BEGLOBAL_ADDRESS, INITIAL_SUPPLY);
    //console.log( "GLBD approved.");


    // Set treasury for GLBD token
    await glbd.setVault(DEPLOYER_ADDRESS);
    console.log( "glbd setVault");

    // Mint 10,000,000 GLBD
    await glbd.mint( DEPLOYER_ADDRESS, INITIAL_SUPPLY );
    console.log( "glbd mint");
    //TODO revisar com deposita els LPs al AMM

    console.log("DEPLOYMENT SUCCESSFULLY FINISHED -> copy BUSD, GLBD & sGLBD addresses and addLiquidity to the router");
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})
