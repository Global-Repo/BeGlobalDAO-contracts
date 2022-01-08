const { ethers } = require("hardhat");
const {
    GLBD_BUSD_BOND_ADDRESS,DEPLOYER_ADDRESS, GLBD_ADDRESS, BUSD_ADDRESS, ROUTER_BEGLOBAL_ADDRESS, PRESALEBONDER, GLBD_BUSD_LP_ADDRESS,
    TREASURY_ADDRESS
} = require("../addresses_mainnet");

const {BigNumber} = require("@ethersproject/bignumber");


const TOKEN_DECIMALS = 9;
const BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER = BigNumber.from(10).pow(TOKEN_DECIMALS);
const INITIAL_SUPPLY = BigNumber.from(100000).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER);

const TOKEN_DECIMALS_B = 18;
const BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_B = BigNumber.from(10).pow(TOKEN_DECIMALS_B);
const INITIAL_SUPPLY_B = BigNumber.from(100).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_B);

let bep20Amount = function (amount) {
    return BigNumber.from(amount).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER);
}

let bep20Amount_B = function (amount) {
    return BigNumber.from(amount).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_B);
}

async function main() {

    const [deployer] = await ethers.getSigners();
    const GLBDT = await ethers.getContractFactory('GlobalDAOToken');
    const BUSD = await ethers.getContractFactory('BEP20Token');
    const Router = await ethers.getContractFactory("Router");
    let largeApproval = '100000000000000000000000000000000';
    let addliq = false;
    let amount = 0;
    let timeoutPeriod = 10000;
    let busd;
    let deployPresale = true;

    const BondDepository = await ethers.getContractFactory('GlobalDAOBondDepository');
    let bondDepository = await BondDepository.attach(GLBD_BUSD_BOND_ADDRESS);
    console.log("[bondDepository attached]: " + bondDepository.address);

    const GLBDBUSDLP = await ethers.getContractFactory('PancakeERC20');
    glbdbusdLP = await GLBDBUSDLP.attach(GLBD_BUSD_LP_ADDRESS);

    if(addliq) {
        router = await Router.attach(ROUTER_BEGLOBAL_ADDRESS);
        console.log("[Router attached]: " + router.address);

        GLBD = await GLBDT.attach(GLBD_ADDRESS);
        console.log("[GLBD attached]: " + GLBD_ADDRESS);

        busd = await BUSD.attach(BUSD_ADDRESS);
        console.log("[BUSD attached]: " + BUSD_ADDRESS);
        console.log("BALANCE BUSD: " + (await busd.balanceOf(DEPLOYER_ADDRESS)));
        console.log("OWNER BUSD: " + (await busd.owner()));
        // Approve RouterBeGlobal as spender of GLB for Deployer
        console.log("[Approve GLBD to be used in the BeGlobal router by the deployer]");
        await GLBD.approve(router.address, largeApproval);
        console.log("BALANCE GLBD: " + (await GLBD.balanceOf(DEPLOYER_ADDRESS)));

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

        amount = await glbdbusdLP.balanceOf(DEPLOYER_ADDRESS);
        console.log("BALANCE PAIR DEPLOYER: " + amount.toString());
        await glbdbusdLP.transfer(PRESALEBONDER, amount);

    }

    let amountA = await glbdbusdLP.balanceOf(PRESALEBONDER);
    console.log("BALANCE PAIR PRESALEBONDER: " + amountA.toString());
    console.log("[BondPrice in USD: " + (await bondDepository.bondPriceInUSD()).toString() + "]");
    console.log("[BondPrice: " + (await bondDepository.bondPrice()).toString() + "]");





    busd = await BUSD.attach(BUSD_ADDRESS);
    console.log("[BUSDt attached]: " + busd.address);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    console.log('Deploying contracts. Deployer account: ' + deployer.address);


    if (deployPresale) {
        // Deploy presaleBonder
        console.log("[Deploying PresaleBonder]");
        const PresaleBonder = await ethers.getContractFactory('PresaleBonder');
        presaleBonder = await PresaleBonder.deploy(BUSD_ADDRESS, GLBD_BUSD_LP_ADDRESS, '0x7AaFd8c4eD34daC6686E85b64c51Ed5B99d8fe6a', GLBD_BUSD_BOND_ADDRESS);
        console.log("[PresaleBonder deployed]: " + presaleBonder.address);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));
    }
}


main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
    })

