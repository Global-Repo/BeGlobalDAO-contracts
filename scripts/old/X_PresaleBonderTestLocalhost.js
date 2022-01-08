const { ethers } = require("hardhat");
const {
    BUSD_ADDRESS,
    GLBD_BUSD_BOND_ADDRESS,
    GLBD_BUSD_LP_ADDRESS,
    PRESALEBONDER, STAKING_WARMUP_ADDRESS, STAKING_ADDRESS, SGLBD_ADDRESS, PRESALE
} = require("../addresses_mainnet");
const {BigNumber} = require("ethers");

async function main() {

    const [deployer] = await ethers.getSigners();
    let presale;
    let deployPresale = false;
    let inici = 0;
    let final = 49;
    let amount = BigNumber.from("530330085889909643");
    let amountA = 0;
    let adjust = false;
    let timeoutPeriod = 5000;

    console.log("BIG NUMBER: " + BigNumber.from(amount));
    const GLBDBUSDLP = await ethers.getContractFactory('PancakeERC20');
    glbdbusdLP = await GLBDBUSDLP.attach(GLBD_BUSD_LP_ADDRESS);

    if (deployPresale) {
        // Deploy Presale
        console.log("[Deploying Presale]");
        const Presale = await ethers.getContractFactory('Presale');
        presale = await Presale.deploy(BUSD_ADDRESS, 0, 1);
        console.log("[Presale deployed]: " + presale.address + " " + 0 + " " + 1);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));

        // Deploy presaleBonder
        console.log("[Deploying PresaleBonder]");
        const PresaleBonder = await ethers.getContractFactory('PresaleBonder');
        presaleBonder = await PresaleBonder.deploy(BUSD_ADDRESS, GLBD_BUSD_LP_ADDRESS, presale.address, GLBD_BUSD_BOND_ADDRESS);
        console.log("[PresaleBonder deployed]: " + presaleBonder.address);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));

        try {
            console.log("VERIFYING PRESALEBONDER: ", PRESALEBONDER);
            //// Verify contract on bsc
            await hre.run("verify:verify", {
                address: PRESALEBONDER,
                constructorArguments: [
                    BUSD_ADDRESS,
                    GLBD_BUSD_LP_ADDRESS,
                    PRESALE,
                    GLBD_BUSD_BOND_ADDRESS
                ],
            });
            console.log( "PRESALEBONDER verified: " + PRESALEBONDER );
            console.log("Success");
        } catch (err) {
            console.log(err.message);
        }
    } else {

        // Attach PresaleBonder
        const PresaleBonder = await ethers.getContractFactory('PresaleBonder');
        presaleBonder = await PresaleBonder.attach(PRESALEBONDER);
        console.log("[Presale attached]: " + presaleBonder.address);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));

        const BondDepository = await ethers.getContractFactory('GlobalDAOBondDepository');
        let bondDepository = await BondDepository.attach(GLBD_BUSD_BOND_ADDRESS);
        console.log("[bondDepository attached]: " + bondDepository.address);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));

        console.log("[BondPrice abans in USD: " + (await bondDepository.bondPriceInUSD()).toString() + "************************]");
        console.log("[BondPrice abans: " + (await bondDepository.bondPrice()).toString() + "]");
        console.log("[BondPrice abans: " + (await bondDepository.bondPrice()).toString() + "]");

        amountA = await glbdbusdLP.balanceOf(PRESALEBONDER);
        console.log("[Balance restant abans: "+amountA.toString()+"]");

        //await bondDepository.setBondTerms(4, 1800);
        //console.log("[CV1: " + (await bondDepository.terms.controlVariable).toString() + "]");

        //await presaleBonder.bondRewards(inici, final, BigNumber.from(amount).div(2));
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));

        //console.log("[CV2: " + (await bondDepository.terms.controlVariable).toString() + "]");
        console.log("[BondPrice in USD: " + (await bondDepository.bondPriceInUSD()).toString() + "*********************]");
        console.log("[BondPrice: " + (await bondDepository.bondPrice()).toString() + "]");


        amountA = await glbdbusdLP.balanceOf(PRESALEBONDER);
        console.log("[Balance restant després: "+amountA.toString()+"]");

        console.log("[DebtRatio(): "+ (await bondDepository.debtRatio())+"]");
    }
}


main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})

