const { ethers } = require("hardhat");
const {
    BUSD_ADDRESS,
    GLBD_ADDRESS,
    DEPLOYER_ADDRESS,
    GLB_ADDRESS,
    SGLBD_ADDRESS
} = require("./addresses_mainnet");
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
    let timeoutPeriod = 10000;
    let maxDeposit = BigNumber.from(500000).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG);
    let deployBUSD = true;
    let largeApproval = '1000000000000000000000000000000000000';

    console.log('Deploying contracts. Deployer account: ' + deployer.address);
/*
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
        //await busd.transfer("0xa978688CE4721f0e28CF85c4C2b0f55d3186736f",INITIAL_SUPPLY);
        console.log("[Success]");
    } else {
        // Attach BUSD
        console.log("[Attaching BUSD SC]");
        busd = await BUSD.attach("0x5A05328D3E9505859b51bEc77122FCCCe18E3402");
        await busd.mint(INITIAL_SUPPLY_BIG);
        //await busd.transfer("0xa978688CE4721f0e28CF85c4C2b0f55d3186736f",INITIAL_SUPPLY_BIG);
        console.log("[BUSDt attached]: " + busd.address);
    }*/

/*
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

    /*const sGLBDT = await ethers.getContractFactory('sGlobalDAOToken');
    // Deploy sGLBD
    //sGLBD = await sGLBDT.deploy();
    sGLBD = await sGLBDT.attach("0xf3922fA91Bb2e2Bf9f694573B3C73cfA765fb1C3");
    console.log("const sGLBD_ADDRESS = '" + sGLBD.address+"';");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));*/
/*
    console.log("[Set deployer as a vault for sGLBD Token]");
    await sGLBD.setVault(deployer.address);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    await sGLBD.mint(deployer.address//"0xa978688CE4721f0e28CF85c4C2b0f55d3186736f"
    , INITIAL_SUPPLY);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));
*/
    /*const WGLBDT = await ethers.getContractFactory('wGlobalDAOToken');
    //let WGLBD = await WGLBDT.attach("0x8AeB0d0F8eb35135eFB9aB9AFDB70F312C059f13");
    let WGLBD = await WGLBDT.deploy("0xf3922fA91Bb2e2Bf9f694573B3C73cfA765fb1C3"); // TODO canviar per sGLBD
    console.log("const WGLBD_ADDRESS = '" + WGLBD.address + "';");

    await new Promise(r => setTimeout(() => r(), timeoutPeriod));try {
        console.log("VERIFYING WGLBD: ", WGLBD.address);
        //// Verify contract on bsc
        await hre.run("verify:verify", {
            address: WGLBD.address,
            constructorArguments: [
                "0xf3922fA91Bb2e2Bf9f694573B3C73cfA765fb1C3"
            ],
        });
        console.log( "Verified WGLBD: " + WGLBD.address );
    } catch (err) {
        console.log(err.message);
    }*/
/*
    await sGLBD.approve(WGLBD.address,largeApproval);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));
    await WGLBD.wrap(INITIAL_SUPPLY);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));/*
*/
    console.log("[Deploying IPSO SC]");
    const IPSO = await ethers.getContractFactory('IPSO');
    let startTime = Math.round(new Date().getTime()/1000);
    console.log("startTime = '" + startTime + "';");
    //let ipso = await IPSO.attach("0x37Cb9C9Bf6EF1Cf44A46b3f1eeD555B1EE3618BD");
    let ipso = await IPSO.deploy(
        "0xbe7cbd94060f237ca06596a92c60b728ee891ab6",//WGLBD.address,
        "0xe9e7cea3dedca5984780bafc599bd69add087d56",//busd.address,
        1644357600,
        1644699600,
        1645563600,
        "8437500000000000000000000000",
        BigNumber.from(100000).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG),
        BigNumber.from(1600).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG),
        BigNumber.from(35000).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG));
    console.log("[IPSO deployed]: " + ipso.address);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    console.log("Bond added 0xa1dE39ef38b087877b34033d2FB5317c2A8092E6");
    await ipso.addBond(1,"0xa1dE39ef38b087877b34033d2FB5317c2A8092E6");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    console.log("Bond added 0x130233f8f2641312B425621c27F6d4e156ecfFA8");
    await ipso.addBond(2,"0x130233f8f2641312B425621c27F6d4e156ecfFA8");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    console.log("Bond added 0x08369c2dbeC0F2A976c338eb7F76AcD225578E17");
    await ipso.addBond(2,"0x08369c2dbeC0F2A976c338eb7F76AcD225578E17");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    console.log("Bond added 0x8CBFDFaD4415d9D00c41AF6E807F536d07372351");
    await ipso.addBond(2,"0x8CBFDFaD4415d9D00c41AF6E807F536d07372351");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    console.log("Bond added 0x0a61a4E810f5D15F9D347a67b5D5ED92a5A4d94C");
    await ipso.addBond(2,"0x0a61a4E810f5D15F9D347a67b5D5ED92a5A4d94C");
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    try {
        console.log("VERIFYING IPSO: ", ipso.address);
        //// Verify contract on bsc
        await hre.run("verify:verify", {
            address: ipso.address,
            constructorArguments: [
                "0xbe7cbd94060f237ca06596a92c60b728ee891ab6",//WGLBD.address,
                "0xe9e7cea3dedca5984780bafc599bd69add087d56",//busd.address,
                1644357600,
                1644699600,
                1645563600,
                "8437500000000000000000000000",
                BigNumber.from(100000).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG),
                BigNumber.from(1600).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG),
                BigNumber.from(35000).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG)
            ],
        });
        console.log( "Verified IPSO: " + ipso.address );
    } catch (err) {
        console.log(err.message);
    }


    console.log("DEPLOYMENT SUCCESSFULLY FINISHED");
}


main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})

