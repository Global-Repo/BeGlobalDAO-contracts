const hre = require("hardhat");
require("@nomiclabs/hardhat-ethers");

let CURRENT_BLOCK;
let ipoDistributor;

async function main() {
    console.log("Starting deploy");

    [deployer] = await hre.ethers.getSigners();

    CURRENT_BLOCK = await ethers.provider.getBlockNumber();
    console.log("Current block is:", CURRENT_BLOCK);

    // Attach
    const IPODistributor = await ethers.getContractFactory("IPODistributor");
    /*ipo = await IPO.attach(
        "0x1f993896a6e00BF0c2a5Fe6a9d6ACB991FD955dA"
    );
    let prova = await ipo.userInfo("0x6063130f5Ba259ee9d51F62c16ABFe1B4b91610B")
    console.log(prova.toString());*/

    const projectToken = '0xdc279ddC65Ea17382BbF9a141bb71550CdD587B3'; //0xdc279ddC65Ea17382BbF9a141bb71550CdD587B3 0x7D4c69E75D9a59f6489d9B0b20cEDA99f7B60158
    const startClaim = 1648749600; //1648749600
    const endClaim = 1650045600; //1650045600
    const burnAddress = '0xa16856c6CeDf2FAc6A926193E634D20f3b266571'; //0xa16856c6CeDf2FAc6A926193E634D20f3b266571

    ipoDistributor = await IPODistributor.attach('0xD0A4bdAAfcD39d8B35Ff5ACBE4A819F1Ec1169C2');
    /*ipoDistributor = await IPODistributor.deploy(
        projectToken,
        startClaim,
        endClaim
    );*/

    await ipoDistributor.deployed();
    console.log("IPODistributor deployed to:", ipoDistributor.address); //ipo.address,
    await new Promise(r => setTimeout(() => r(), 10000));

    /*await ipo.changeWorkership('0x49cdeB1d785a006602A6728b894A1E320E2f8eFA'); //0x49cdeB1d785a006602A6728b894A1E320E2f8eFA
    console.log("Workership changed to: 0x49cdeB1d785a006602A6728b894A1E320E2f8eFA"); //0x49cdeB1d785a006602A6728b894A1E320E2f8eFA
    await new Promise(r => setTimeout(() => r(), 10000));*/

    /*console.log("Loading users");
    await ipoDistributor.loadInvestors('0x063CECB822f1D2A562555d865e45810CEa536527');
    await new Promise(r => setTimeout(() => r(), 10000));*/

    // Verify
    await hre.run("verify:verify", {
        address: ipoDistributor.address, //ipoDistributor.address,
        constructorArguments: [
            projectToken,
            startClaim,
            endClaim
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
