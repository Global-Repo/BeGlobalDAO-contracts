const { ethers } = require("hardhat");
const {
    BUSD_ADDRESS,
    GLBD_BUSD_BOND_ADDRESS,
    GLBD_BUSD_LP_ADDRESS,
    PRESALEBONDER
} = require("./addresses_localhost");
const {BigNumber} = require("ethers");

async function main() {

    const [deployer] = await ethers.getSigners();
    let presale;
    let deployPresale = false;
    let inici = 0;
    let final = 0;
    let amount = 530754349958619677;

    console.log("BIG NUMBER: " + BigNumber.from(amount));
    /*
    if (deployPresale) {
        // Deploy Presale
        console.log("[Deploying Presale]");
        const Presale = await ethers.getContractFactory('Presale');
        presale = await Presale.deploy(BUSD_ADDRESS, 0, 1);
        console.log("[Presale deployed]: " + presale.address + " " + 0 + " " + 1);

        // Deploy presaleBonder
        console.log("[Deploying PresaleBonder]");
        const PresaleBonder = await ethers.getContractFactory('PresaleBonder');
        presaleBonder = await PresaleBonder.deploy(BUSD_ADDRESS, GLBD_BUSD_LP_ADDRESS, presale.address, GLBD_BUSD_BOND_ADDRESS);
        console.log("[PresaleBonder deployed]: " + presaleBonder.address);
    } else {
        // Attach PresaleBonder
        const PresaleBonder = await ethers.getContractFactory('PresaleBonder');
        presaleBonder = await PresaleBonder.attach(PRESALEBONDER);
        console.log("[Presale attached]: " + presaleBonder.address);

        const BondDepository = await ethers.getContractFactory('GlobalDAOBondDepository');
        let bondDepository = await BondDepository.attach(GLBD_BUSD_BOND_ADDRESS);
        console.log("[bondDepository attached]: " + bondDepository.address);

        console.log("[BondPrice in USD: " + (await bondDepository.bondPriceInUSD()).toString() + "]");
        console.log("[BondPrice: " + (await bondDepository.bondPrice()).toString() + "]");

        presaleBonder.bondRewards(inici, final, BigNumber.from(amount));

        console.log("[BondPrice in USD: " + (await bondDepository.bondPriceInUSD()).toString() + "]");
        console.log("[BondPrice: " + (await bondDepository.bondPrice()).toString() + "]");
    }

     */
}


main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})

