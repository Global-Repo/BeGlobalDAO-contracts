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
    let timeoutPeriod = 10000;
    let maxDeposit = BigNumber.from(500000).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG);
    let deployBUSD = true;
    let largeApproval = '1000000000000000000000000000000000000';

    console.log('Deploying contracts. Deployer account: ' + deployer.address);
    let busd;
    const BUSD = await ethers.getContractFactory('BEP20Token');
    /*
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

        try {
            console.log("VERIFYING BUSD: ", "0x542a4f784c95507cBa23d091cDe63A38492c2088");
            //// Verify contract on bsc
            await hre.run("verify:verify", {
                address: "0x542a4f784c95507cBa23d091cDe63A38492c2088",
                constructorArguments: [
                ],
            });
            console.log( "Verified BUSD: " + "0x542a4f784c95507cBa23d091cDe63A38492c2088" );
        } catch (err) {
            console.log(err.message);
        }
    } else {
        // Attach BUSD
        console.log("[Attaching BUSD SC]");
        busd = await BUSD.attach("0x5A05328D3E9505859b51bEc77122FCCCe18E3402");
        await busd.mint(INITIAL_SUPPLY_BIG);
        //await busd.transfer("0xa978688CE4721f0e28CF85c4C2b0f55d3186736f",INITIAL_SUPPLY_BIG);
        console.log("[BUSDt attached]: " + busd.address);
    }*/


    //MAINNET
    console.log("[Deploying IPSODistributor SC]");
    const IPSODistributor = await ethers.getContractFactory('IPSODistributor');
    //let ipsoDistributor = await IPSODistributor.attach("");
    let ipsoDistributor = await IPSODistributor.deploy();
    console.log("[IPSODistributor deployed]: " + ipsoDistributor.address);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    await ipsoDistributor.addUser("0x8C4C9AfCC061c3422FA682c201FAEC14d85666fF",40000);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    await ipsoDistributor.addUser("0x489c480614ce2302df7da5e7033d29916fc0c74b",500);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    await ipsoDistributor.addUser("0x9e1f24036dee44be1136d2cd4efc2393d50eaee1",400);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    await ipsoDistributor.addUser("0xe969A143c355b63e552f3a9CE0cf7bC9B716c1a0",250);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    await ipsoDistributor.addUser("0x8abbe5637817404f6b0b4f4c2ed0de6645de4035",500);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    await ipsoDistributor.addUser("0xc0110bddbd679e551b004ed947dc592118617aa5",1000);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    await ipsoDistributor.addUser("0x1c95e07668dbda0eafa433d5bce1f1c2231c0fab",330);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    await ipsoDistributor.addUser("0x4d0a4f643d896e356e0a065f625867543c080f55",100);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    await ipsoDistributor.addUser("0xe582f3d1509c3B91e1728e97cFC77cA8244992A7",100);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    await ipsoDistributor.addUser("0x16413144d3ac295acdb0e804988905e27cb33d18",900);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    await ipsoDistributor.addUser("0x46a913fb595e3032aaf01cdb8a8e5b06361c2f3c",200);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    await ipsoDistributor.addUser("0xf10e649eeb2af1e18d3948d5ef07930e739faba3",150);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    await ipsoDistributor.addUser("0x1AB9BC0e1B703741f668c08fE44574c4f6B1111E",500);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    await ipsoDistributor.addUser("0x65c34c388713b68f78ddbb707af24cb492d02b03",200);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    await ipsoDistributor.addUser("0xf50e61ada62ef40f3c4883b43884d29aca2858fa",400);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    await ipsoDistributor.addUser("0xe65324889cd9b41f4924c2937c6d8ebbe4b3a593",200);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    await ipsoDistributor.addUser("0xf8f60044b9ad0a347c381eeda158d13cb995f4fa",1000);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    await ipsoDistributor.addUser("0x2e12c85ed74a3804ed7e182363388abfeff7b40d",150);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    await ipsoDistributor.addUser("0x3b633414c4977d83a27f75a46f24d6554b91a3b8",4000);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    await ipsoDistributor.addUser("0x07A51Cd843d2aC809c1880743285Bf26E4162F2e",600);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    await ipsoDistributor.addUser("0x3b633414c4977d83a27f75a46f24d6554b91a3b8",7000);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    await ipsoDistributor.addUser("0x572378c82562b252aaf1cb7f270656e089d38b62",300);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    await ipsoDistributor.addUser("0xf386a7d8eb28a4e507553760c92e8b4d9d1d0eef",4220);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    try {
        console.log("VERIFYING IPSO: ", ipsoDistributor.address);
        //// Verify contract on bsc
        await hre.run("verify:verify", {
            address: ipsoDistributor.address,
            constructorArguments: [
            ],
        });
        console.log( "Verified IPSODistributor: " + ipsoDistributor.address );
    } catch (err) {
        console.log(err.message);
    }

    //TESTNET
    /*console.log("[Deploying IPSODistributor SC]");
    const IPSODistributor = await ethers.getContractFactory('IPSODistributor');
    //let ipsoDistributor = await IPSODistributor.attach("");
    let ipsoDistributor = await IPSODistributor.deploy();
    console.log("[IPSODistributor deployed]: " + ipsoDistributor.address);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    await ipsoDistributor.addUser("0xBb8B4A0Af715488d543A9cB72fF6b1dF0C38DE96",10);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    await ipsoDistributor.addUser("0xF386A7d8eB28a4e507553760c92E8B4D9D1D0eEf",1);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    await ipsoDistributor.addUser("0x30E072413B7C07996F928A0fBBc20b2Ed9F63383",2);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    await ipsoDistributor.addUser("0x80c936AE759578838F10d428884d3Ae4EE6d561C",2);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    try {
        console.log("VERIFYING IPSO: ", ipsoDistributor.address);
        //// Verify contract on bsc
        await hre.run("verify:verify", {
            address: ipsoDistributor.address,
            constructorArguments: [
            ],
        });
        console.log( "Verified IPSODistributor: " + ipsoDistributor.address );
    } catch (err) {
        console.log(err.message);
    }*/


    console.log("DEPLOYMENT SUCCESSFULLY FINISHED");
}


main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})

