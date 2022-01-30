const ethers = require("hardhat").ethers;
const { expect } = require("chai");
const { BigNumber } = require("@ethersproject/bignumber");
const {BUSD_ADDRESS} = require("../scripts/addresses_testnet");


const TOKEN_DECIMALS_LITTLE = 9;
const BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_LITTLE = BigNumber.from(10).pow(TOKEN_DECIMALS_LITTLE);
const INITIAL_SUPPLY_LITTLE = BigNumber.from(100000000).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_LITTLE);
const INITIAL_SUPPLY_LITTLE_SMALL = BigNumber.from(1000000).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_LITTLE);

const TOKEN_DECIMALS_BIG = 18;
const BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG = BigNumber.from(10).pow(TOKEN_DECIMALS_BIG);
const INITIAL_SUPPLY_BIG = BigNumber.from(100000000).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG);
const INITIAL_SUPPLY_BIG_SMALL = BigNumber.from(1000000).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG);

let WGLBD
let GLBD
let busd

let ipso;
beforeEach(async function () {
    [deployer, addr1, addr2, addr3, ...addrs] = await ethers.getSigners();

    // Deploy WGLBD
    const WGLBDT = await ethers.getContractFactory('GlobalDAOToken');
    WGLBD = await WGLBDT.deploy();

    await WGLBD.setVault(deployer.address);
    await WGLBD.mint(deployer.address, INITIAL_SUPPLY_LITTLE);
    await WGLBD.mint(addr1.address, INITIAL_SUPPLY_LITTLE_SMALL);
    //await WGLBD.mint(addr2.address, INITIAL_SUPPLY_LITTLE_SMALL);

    // Deploy GLBD
    const GLBDT = await ethers.getContractFactory('GlobalDAOToken');
    GLBD = await GLBDT.deploy();

    await GLBD.setVault(deployer.address);
    await GLBD.mint(deployer.address, INITIAL_SUPPLY_LITTLE);
    await GLBD.mint(addr1.address, INITIAL_SUPPLY_LITTLE_SMALL);
    await GLBD.mint(addr2.address, INITIAL_SUPPLY_LITTLE_SMALL);

    const BUSD = await ethers.getContractFactory('BEP20Token');
    busd = await BUSD.deploy();

    await busd.mint(INITIAL_SUPPLY_BIG);
    await busd.transfer(addr1.address,INITIAL_SUPPLY_BIG_SMALL);
    await busd.transfer(addr2.address,INITIAL_SUPPLY_BIG_SMALL);

    const IPSO = await ethers.getContractFactory('IPSO');
    let startTime = Math.round(new Date().getTime()/1000);

    ipso = await IPSO.deploy(
        WGLBD.address,
        busd.address,
        GLBD.address,
        startTime+300,
        startTime+600,
        startTime+900,
        BigNumber.from(50).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_LITTLE),
        BigNumber.from(5).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG),
        BigNumber.from(50).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG),
        BigNumber.from(500).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG)
    );

    await WGLBD.approve(ipso.address, INITIAL_SUPPLY_LITTLE);
    await GLBD.approve(ipso.address, INITIAL_SUPPLY_LITTLE);
    await busd.approve(ipso.address,INITIAL_SUPPLY_BIG);

    await WGLBD.connect(addr1).approve(ipso.address, INITIAL_SUPPLY_LITTLE_SMALL);
    await GLBD.connect(addr1).approve(ipso.address, INITIAL_SUPPLY_LITTLE_SMALL);
    await busd.connect(addr1).approve(ipso.address,INITIAL_SUPPLY_BIG_SMALL);

    //await WGLBD.connect(addr2).approve(ipso.address, INITIAL_SUPPLY_LITTLE_SMALL);
    await GLBD.connect(addr2).approve(ipso.address, INITIAL_SUPPLY_LITTLE_SMALL);
    await busd.connect(addr2).approve(ipso.address,INITIAL_SUPPLY_BIG_SMALL);

});

describe("IPSO Presale", function () {
    it("1.- Not able to invest before presale", async function () {
        let investAmount = BigNumber.from(5).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG);
        await expect(ipso.connect(addr1).invest(investAmount)).to.be.revertedWith("not presale time");
    });
    it("2.- Able to invest with enough WGLBDs", async function () {
        await ethers.provider.send('evm_increaseTime', [400]);
        let investAmount = BigNumber.from(5).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG);
        expect(await ipso.connect(addr1).invest(investAmount)).to.emit(ipso, "Invest").withArgs(deployer.address,investAmount);
    });
    it("3.- Cannot invest in case does not have enough WGLBD and not whitelisted", async function () {
        //await ethers.provider.send('evm_increaseTime', [400]);
        let investAmount = BigNumber.from(5).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG);
        await expect( ipso.connect(addr2).invest(investAmount)).to.be.revertedWith("you cannot invest");
    });
    xit("4", async function () {
        await ipso.setWhitelist(addr2.address,true);
        let investAmount = BigNumber.from(5).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG);
        expect(await ipso.connect(addr2).invest(investAmount)).to.emit(ipso, "Invest").withArgs(deployer.address,investAmount);
    });
    xit("5", async function () {
        expect(await deployedToken.owner()).to.equal(owner.address);
    });
});