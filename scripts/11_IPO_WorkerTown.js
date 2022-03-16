const hre = require("hardhat");
require("@nomiclabs/hardhat-ethers");

let CURRENT_BLOCK;
let ipo;

async function main() {
    console.log("Starting deploy");

    [deployer] = await hre.ethers.getSigners();

    CURRENT_BLOCK = await ethers.provider.getBlockNumber();
    console.log("Current block is:", CURRENT_BLOCK);

    // Attach
    const IPO = await ethers.getContractFactory("IPO");
    /*ipo = await IPO.attach(
        "0x1f993896a6e00BF0c2a5Fe6a9d6ACB991FD955dA"
    );
    let prova = await ipo.userInfo("0x6063130f5Ba259ee9d51F62c16ABFe1B4b91610B")
    console.log(prova.toString());*/

    const investmentToken = '0x5A05328D3E9505859b51bEc77122FCCCe18E3402'; //0xe9e7cea3dedca5984780bafc599bd69add087d56 0x5A05328D3E9505859b51bEc77122FCCCe18E3402
    const startWhitelist = 1647720000; //1647720000
    const endWhitelist = 1647802800; //1647802800
    const startPublicSale = 1647806400; //1647806400
    const endPublicSale = 1647889200; //1647889200
    const startClaim = 1647892800; //1647892800
    const endClaim = 1654801200; //1654801200
    const ratioNumWhitelist = 10; //10
    const ratioDenumWhitelist = 9; //9
    const maxInvestmentWhitelist = '500000000000000000000'; //500 000000000000000000
    const raisingAmountWhitelist = '285000000000000000000000'; //285000 000000000000000000
    const ratioNumPublicSale = 100; //100
    const ratioDenumPublicSale = 99; //95
    const maxInvestmentPublicSale = '1000000000000000000000'; //1000 000000000000000000
    const raisingAmountPublicSale = '90000000000000000000000'; //90000 000000000000000000

    ipo = await IPO.deploy(
        investmentToken,
        startWhitelist,
        endWhitelist,
        startPublicSale,
        endPublicSale,
        startClaim,
        endClaim,
        ratioNumWhitelist,
        ratioDenumWhitelist,
        maxInvestmentWhitelist,
        raisingAmountWhitelist,
        ratioNumPublicSale,
        ratioDenumPublicSale,
        maxInvestmentPublicSale,
        raisingAmountPublicSale
    );

    await ipo.deployed();
    console.log("IPO deployed to:", ipo.address); //ipo.address,
    await new Promise(r => setTimeout(() => r(), 10000));

    // Verify
    await hre.run("verify:verify", {
        address: ipo.address, //ipo.address,
        constructorArguments: [
            investmentToken,
            startWhitelist,
            endWhitelist,
            startPublicSale,
            endPublicSale,
            startClaim,
            endClaim,
            ratioNumWhitelist,
            ratioDenumWhitelist,
            maxInvestmentWhitelist,
            raisingAmountWhitelist,
            ratioNumPublicSale,
            ratioDenumPublicSale,
            maxInvestmentPublicSale,
            raisingAmountPublicSale
        ],
    });

    console.log("Deploy finished");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
