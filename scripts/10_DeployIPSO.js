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

    let harvestTime = 6480000; //2.5 mesos
    let ratio = 380;
    let timeoutPeriod = 3000;
    let maxDeposit = BigNumber.from(500000).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG);
    let deployBUSD = false;
    let largeApproval = '1000000000000000000000000000000000000';
/*
    console.log('Deploying contracts. Deployer account: ' + deployer.address);
    let busd;
    const BUSD = await ethers.getContractFactory('BEP20Token');
    if (deployBUSD) {
        // Deploy BUSD
        console.log("[Deploying BUSD SC]");
        busd = await BUSD.deploy();
        console.log("[BUSDt deployed]: " + busd.address);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));

        // Deployer mints 100 BUSD
        console.log("[Deployer mints 100 BUSD]");
        await busd.mint(INITIAL_SUPPLY_BIG);
        await busd.transfer("0xa978688CE4721f0e28CF85c4C2b0f55d3186736f",INITIAL_SUPPLY);
        console.log("[Success]");
    } else {
        // Attach BUSD
        console.log("[Attaching BUSD SC]");
        busd = await BUSD.attach("0x5A05328D3E9505859b51bEc77122FCCCe18E3402");
        await busd.mint(INITIAL_SUPPLY_BIG);
        await busd.transfer("0xa978688CE4721f0e28CF85c4C2b0f55d3186736f",INITIAL_SUPPLY_BIG);
        console.log("[BUSDt attached]: " + busd.address);
    }

*//*
    // Deploy GLBD
    const GLBDT = await ethers.getContractFactory('GlobalDAOToken');
    //let GLBD = await GLBDT.attach("0x5C78E9c9B1fb8B8a4cb5AD7D950e9289C571dFDF");
    let GLBD = await GLBDT.deploy();
    console.log("const GLBD_ADDRESS = '" + GLBD.address + "';");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    console.log("[Set deployer as a vault for GLBD Token]");
    await GLBD.setVault(deployer.address);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    // Mint GLBD
    console.log("[Deployer mints (extra?) 60000 GLBD]");
    await GLBD.mint("0xa978688CE4721f0e28CF85c4C2b0f55d3186736f", INITIAL_SUPPLY);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));*/

    const sGLBDT = await ethers.getContractFactory('sGlobalDAOToken');
    // Deploy sGLBD
    //sGLBD = await sGLBDT.deploy();
    sGLBD = await sGLBDT.attach(SGLBD_ADDRESS);
    console.log("const sGLBD_ADDRESS = '" + sGLBD.address+"';");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));
/*
    console.log("[Set deployer as a vault for sGLBD Token]");
    await sGLBD.setVault(deployer.address);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    await sGLBD.mint(deployer.address//"0xa978688CE4721f0e28CF85c4C2b0f55d3186736f"
    , INITIAL_SUPPLY);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));
*/
    const WGLBDT = await ethers.getContractFactory('wGlobalDAOToken');
    //let WGLBD = await WGLBDT.attach("0x8AeB0d0F8eb35135eFB9aB9AFDB70F312C059f13");
    let WGLBD = await WGLBDT.deploy(SGLBD_ADDRESS); // TODO canviar per sGLBD
    console.log("const WGLBD_ADDRESS = '" + WGLBD.address + "';");

    await new Promise(r => setTimeout(() => r(), timeoutPeriod));try {
        console.log("VERIFYING WGLBD: ", WGLBD.address);
        //// Verify contract on bsc
        await hre.run("verify:verify", {
            address: WGLBD.address,
            constructorArguments: [
                sGLBD.address
            ],
        });
        console.log( "Verified WGLBD: " + WGLBD.address );
    } catch (err) {
        console.log(err.message);
    }
/*
    await sGLBD.approve(WGLBD.address,largeApproval);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));
    await WGLBD.wrap(INITIAL_SUPPLY);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));/*
*/
   /* console.log("[Deploying IPSO GLB SC]");
    const IPSO = await ethers.getContractFactory('IPSO');
    let startTime = Math.round(new Date().getTime()/1000);
    console.log("startTime = '" + startTime + "';");
    let ipso = await IPSO.deploy(
        WGLBD.address,
        BUSD_ADDRESS,
        GLBD.address,
        startTime,
        startTime+86400,
        startTime+172800,
        BigNumber.from(50).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_LITTLE),
        BigNumber.from(5).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG),
        BigNumber.from(50).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG),
        BigNumber.from(500).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG));
    console.log("[IPSO deployed]: " + ipso.address);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    try {
        console.log("VERIFYING IPSO: ", ipso.address);
        //// Verify contract on bsc
        await hre.run("verify:verify", {
            address: ipso.address,
            constructorArguments: [
                WGLBD.address,
                BUSD_ADDRESS,
                GLBD.address,
                startTime,
                startTime+86400,
                startTime+172800,
                BigNumber.from(50).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_LITTLE),
                BigNumber.from(5).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG),
                BigNumber.from(50).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG),
                BigNumber.from(500).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG)
            ],
        });
        console.log( "Verified IPSO: " + ipso.address );
    } catch (err) {
        console.log(err.message);
    }
*/

    console.log("DEPLOYMENT SUCCESSFULLY FINISHED");
}


main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})

