const { ethers } = require("hardhat");
const { BigNumber } = require("@ethersproject/bignumber");
const {
    MULTISIG_ADDRESS,
    ROUTER_BEGLOBAL_ADDRESS, DEPLOYER_ADDRESS
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

    //TODO revisar parametres interns de tots els contractes
    const BUSD = await ethers.getContractFactory('BEP20Token');
    const busd = await BUSD.deploy();
    await busd.mint(INITIAL_SUPPLY);
    console.log( "BUSD: " + busd.address );

    // Deploy GLBD
    const GLBD = await ethers.getContractFactory('GlobalDAOToken');
    const glbd = await GLBD.deploy();
    console.log( "GLBD: " + glbd.address );

    // Deploy sGLBD
    const SGLBD = await ethers.getContractFactory('sGlobalDAOToken');
    const sGLBD = await SGLBD.deploy();
    console.log( "sGLBD: " + sGLBD.address );

    let date = new Date();
    const timestamp = date.setTime(date.getTime());

    await glbd.approve(ROUTER_BEGLOBAL_ADDRESS, INITIAL_SUPPLY);
    await busd.approve(ROUTER_BEGLOBAL_ADDRESS, INITIAL_SUPPLY);

    // Set treasury for GLBD token
    await glbd.setVault(DEPLOYER_ADDRESS);
    // Mint 10,000,000 GLBD
    await glbd.mint( DEPLOYER_ADDRESS, INITIAL_SUPPLY );

    //TODO revisar com deposita els LPs al AMM

    console.log("DEPLOYMENT SUCCESSFULLY FINISHED -> copy BUSD, GLBD & sGLBD addresses and addLiquidity to the router");
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})
