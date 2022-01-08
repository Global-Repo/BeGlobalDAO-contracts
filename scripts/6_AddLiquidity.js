const { ethers } = require("hardhat");
const {
    DEPLOYER_ADDRESS, GLBD_ADDRESS, BUSD_ADDRESS, ROUTER_BEGLOBAL_ADDRESS, GLBD_BUSD_LP_ADDRESS
} = require("./addresses_mainnet");

const {BigNumber} = require("@ethersproject/bignumber");


const TOKEN_DECIMALS = 9;
const BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER = BigNumber.from(10).pow(TOKEN_DECIMALS);

const TOKEN_DECIMALS_B = 18;
const BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_B = BigNumber.from(10).pow(TOKEN_DECIMALS_B);

let bep20Amount = function (amount) {
    return BigNumber.from(amount).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER);
}

let bep20Amount_B = function (amount) {
    return BigNumber.from(amount).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_B);
}
// TODO recollir la pasta del presale per fer el add liquidity
async function main() {

    const [deployer] = await ethers.getSigners();
    const GLBDT = await ethers.getContractFactory('GlobalDAOToken');
    const BUSD = await ethers.getContractFactory('BEP20Token');
    const Router = await ethers.getContractFactory("Router");
    const GLBDBUSDLP = await ethers.getContractFactory('PancakeERC20');
    const timeoutPeriod = 5000;

    let largeApproval = '100000000000000000000000000000000';
    let amount = 0;
    let busd;

    glbdbusdLP = await GLBDBUSDLP.attach(GLBD_BUSD_LP_ADDRESS);
    console.log("[GLBD-BUSD LP attached]: " + glbdbusdLP.address);

    router = await Router.attach(ROUTER_BEGLOBAL_ADDRESS);
    console.log("[Router attached]: " + router.address);

    GLBD = await GLBDT.attach(GLBD_ADDRESS);
    console.log("[GLBD attached]: " + GLBD_ADDRESS);

    busd = await BUSD.attach(BUSD_ADDRESS);
    console.log("[BUSD attached]: " + BUSD_ADDRESS);

    console.log("[BUSD balance of Deployer]: " + (await busd.balanceOf(DEPLOYER_ADDRESS)));

    // Approve RouterBeGlobal as spender of GLB for Deployer
    console.log("[Approve GLBD to be used in the BeGlobal router by the deployer]");
    await GLBD.approve(router.address, largeApproval);
    console.log("[GLBD balance of Deployer]" + (await GLBD.balanceOf(DEPLOYER_ADDRESS)));

    // Approve BUSDt to be used in the BeGlobal router by the deployer
    console.log("[Approve BUSDt to be used in the BeGlobal router by the deployer]");
    await busd.approve(router.address, largeApproval);

    // AddLiquidity
    console.log("[Create and add liquidity GLBD-BUSD in BeGlobal router]");
    await router.addLiquidity(
        GLBD.address,
        busd.address,
        bep20Amount(3750),
        bep20Amount_B(75000),
        bep20Amount(0),
        bep20Amount_B(0),
        DEPLOYER_ADDRESS,
        (new Date()).setTime((new Date()).getTime())
    );
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    amount = await glbdbusdLP.balanceOf(DEPLOYER_ADDRESS);
    console.log("[Pair balance of deployer]: " + amount.toString());
}


main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
    })

