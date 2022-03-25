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

    const investmentToken = '0xe9e7cea3dedca5984780bafc599bd69add087d56'; //0xe9e7cea3dedca5984780bafc599bd69add087d56 0x5A05328D3E9505859b51bEc77122FCCCe18E3402
    const projectToken = '0xdc279ddC65Ea17382BbF9a141bb71550CdD587B3'; //0xdc279ddC65Ea17382BbF9a141bb71550CdD587B3 0x7D4c69E75D9a59f6489d9B0b20cEDA99f7B60158
    const startWhitelist = 1647723600; //1647723600
    const endWhitelist = 1647806400; //1647806400
    const startPublicSale = 1647810000; //1647810000
    const endPublicSale = 1647892800; //1647892800
    const startClaim = 1647896400; //1647896400
    const endClaim = 1654804800; //1654804800
    const ratioNumWhitelist = 10; //10
    const ratioDenumWhitelist = 9; //9
    const maxInvestmentWhitelist = '500000000000000000000'; //500 000000000000000000
    const raisingAmountWhitelist = '90000000000000000000000'; //90000 000000000000000000
    const ratioNumPublicSale = 100; //100
    const ratioDenumPublicSale = 95; //95
    const maxInvestmentPublicSale = '1000000000000000000000'; //1000 000000000000000000
    const raisingAmountPublicSale = '285000000000000000000000'; //285000 000000000000000000
    const burnAddress = '0xa16856c6CeDf2FAc6A926193E634D20f3b266571'; //0xa16856c6CeDf2FAc6A926193E634D20f3b266571

    ipo = await IPO.deploy(
        investmentToken,
        projectToken,
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

    await ipo.changeWorkership('0x49cdeB1d785a006602A6728b894A1E320E2f8eFA'); //0x49cdeB1d785a006602A6728b894A1E320E2f8eFA
    console.log("Workership changed to: 0x49cdeB1d785a006602A6728b894A1E320E2f8eFA"); //0x49cdeB1d785a006602A6728b894A1E320E2f8eFA
    await new Promise(r => setTimeout(() => r(), 10000));

    // Verify
    await hre.run("verify:verify", {
        address: ipo.address, //ipo.address,
        constructorArguments: [
            investmentToken,
            projectToken,
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
