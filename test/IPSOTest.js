const ethers = require("hardhat").ethers;
const { expect } = require("chai");
const chai = require("chai");
const chaiAlmost = require('chai-almost');
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

    chai.use(chaiAlmost(1));

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
        startTime+300,
        startTime+600,
        startTime+900,
        BigNumber.from(50).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_LITTLE),
        BigNumber.from(50000).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG),
        BigNumber.from(5000).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG),
        BigNumber.from(10000).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG)
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

describe("IPSO Presale buying", function () {
    xit("1.- Not able to invest before presale", async function () {
        let investAmount = BigNumber.from(5).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG);
        await expect(ipso.connect(addr1).invest(investAmount)).to.be.revertedWith("not presale time");
    });
    xit("2.- Able to invest with enough WGLBDs", async function () {
        await ethers.provider.send('evm_increaseTime', [400]);
        let investAmount = BigNumber.from(5).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG);
        expect(await ipso.connect(addr1).invest(investAmount)).to.emit(ipso, "Invest").withArgs(addr1.address,investAmount);
    });
    xit("3.- Cannot invest in case does not have enough WGLBD and not whitelisted", async function () {
        //await ethers.provider.send('evm_increaseTime', [400]);
        let investAmount = BigNumber.from(5).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG);
        await expect( ipso.connect(addr2).invest(investAmount)).to.be.revertedWith("you cannot invest");
    });
    xit("4.- Able to invest if whitelisted", async function () {
        await ipso.setWhitelist(addr2.address,true);
        let investAmount = BigNumber.from(5).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG);
        expect(await ipso.connect(addr2).invest(investAmount)).to.emit(ipso, "Invest").withArgs(addr2.address,investAmount);
    });
    xit("5.- Not able to invest if blacklisted", async function () {
        await ipso.setWhitelist(addr1.address,true);
        await ipso.setBlacklist(addr1.address,true);
        let investAmount = BigNumber.from(5).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG);
        await expect( ipso.connect(addr1).invest(investAmount)).to.be.revertedWith("YOU cannot invest");
    });
    xit("6.- Not able to invest after presale", async function () {
        await ethers.provider.send('evm_increaseTime', [400]);
        let investAmount = BigNumber.from(5).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG);
        await expect(ipso.connect(addr1).invest(investAmount)).to.be.revertedWith("not presale time");
    });
});

describe("IPSO Presale invest amount", function () {
    it("1.- Not able to invest more than maxInvestment", async function () {
        await ethers.provider.send('evm_increaseTime', [400]);
        let investAmount = BigNumber.from(5001).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG);
        await expect(ipso.connect(addr1).invest(investAmount)).to.be.revertedWith("you cannot invest more");
        investAmount = BigNumber.from(4500).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG);
        await expect(ipso.connect(addr1).invest(investAmount)).to.emit(ipso, "Invest").withArgs(addr1.address,investAmount);
        investAmount = BigNumber.from(501).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG);
        await expect(ipso.connect(addr1).invest(investAmount)).to.be.revertedWith("you cannot invest more");
        investAmount = BigNumber.from(500).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG);
        await expect(ipso.connect(addr1).invest(investAmount)).to.emit(ipso, "Invest").withArgs(addr1.address,investAmount);
        investAmount = BigNumber.from(1).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG);
        await expect(ipso.connect(addr1).invest(investAmount)).to.be.revertedWith("you cannot invest more");
    });

    xit("2.- RaisingAmount not reached", async function () {
        let investAmount = BigNumber.from(2000).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG);
        expect(await ipso.invest(investAmount)).to.emit(ipso, "Invest").withArgs(deployer.address,investAmount);
        investAmount = BigNumber.from(3000).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG);
        expect(await ipso.connect(addr1).invest(investAmount)).to.emit(ipso, "Invest").withArgs(addr1.address,investAmount);
        investAmount = BigNumber.from(4000).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG);
        await ipso.setWhitelist(addr2.address,true);
        expect(await ipso.connect(addr2).invest(investAmount)).to.emit(ipso, "Invest").withArgs(addr2.address,investAmount);
        expect((await ipso.getUserAllocation(deployer.address)).div(10000)).to.equal(22);
        expect((await ipso.getUserAllocation(addr1.address)).div(10000)).to.equal(33);
        expect((await ipso.getUserAllocation(addr2.address)).div(10000)).to.equal(44);
        expect((await ipso.getExcessInvestmentTokens(deployer.address))).to.equal(0);
        expect((await ipso.getExcessInvestmentTokens(addr1.address))).to.equal(0);
        expect((await ipso.getExcessInvestmentTokens(addr2.address))).to.equal(0);
    });
    it("3.- RaisingAmount reached", async function () {
        let investAmount = BigNumber.from(3000).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG);
        expect(await ipso.invest(investAmount)).to.emit(ipso, "Invest").withArgs(deployer.address,investAmount);
        investAmount = BigNumber.from(4000).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG);
        expect(await ipso.connect(addr1).invest(investAmount)).to.emit(ipso, "Invest").withArgs(addr1.address,investAmount);
        investAmount = BigNumber.from(5000).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG);
        await ipso.setWhitelist(addr2.address,true);
        expect(await ipso.connect(addr2).invest(investAmount)).to.emit(ipso, "Invest").withArgs(addr2.address,investAmount);
        expect((await ipso.getUserAllocation(deployer.address)).div(10000)).to.equal(25);
        expect((await ipso.getUserAllocation(addr1.address)).div(10000)).to.equal(33);
        expect((await ipso.getUserAllocation(addr2.address)).div(10000)).to.equal(41);
        expect((await ipso.getExcessInvestmentTokens(deployer.address))).to.equal(((await ipso.totalAmountInvested()).sub(await ipso.raisingAmount())).mul(await ipso.getUserAllocation(deployer.address)).div(1000000));
        //expect((await ipso.getExcessInvestmentTokens(addr1.address))).to.almost.equal(((await ipso.totalAmountInvested()).sub(await ipso.raisingAmount())).mul(await ipso.getUserAllocation(addr1.address)).div(1000000));
        //expect((await ipso.getExcessInvestmentTokens(addr2.address))).to.almost.equal(((await ipso.totalAmountInvested()).sub(await ipso.raisingAmount())).mul(await ipso.getUserAllocation(addr2.address)).div(1000000));

        await ipso.refundExcessInvestmentTokens(deployer.address);
        await ipso.refundExcessInvestmentTokens(addr1.address);
        await ipso.refundExcessInvestmentTokens(addr2.address);
        await ipso.distributeProjectTokens(INITIAL_SUPPLY_LITTLE_SMALL,0,2);

        expect((await ipso.getExcessInvestmentTokens(deployer.address))).to.equal(0);
        expect((await ipso.getExcessInvestmentTokens(addr1.address))).to.equal(0);
        expect((await ipso.getExcessInvestmentTokens(addr2.address))).to.equal(0);

        await GLBD.transfer(ipso.address,INITIAL_SUPPLY_LITTLE_SMALL);
        //await ipso.distributeProjectTokens(INITIAL_SUPPLY_LITTLE_SMALL,0,2);


    });
});

describe("IPSO Presale invest amount", function () {
    xit("1.- Not able to invest more than maxInvestment", async function () {
        await WGLBD.mint(addr2.address, INITIAL_SUPPLY_LITTLE_SMALL);
        await WGLBD.connect(addr2).approve(ipso.address, INITIAL_SUPPLY_LITTLE_SMALL);
        await ethers.provider.send('evm_increaseTime', [400]);

        let investAmount = BigNumber.from(2000).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG);
        expect(await ipso.connect(addr1).invest(investAmount)).to.emit(ipso, "Invest").withArgs(addr1.address,investAmount);

        investAmount = BigNumber.from(4000).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG);
        expect(await ipso.connect(addr2).invest(investAmount)).to.emit(ipso, "Invest").withArgs(addr2.address,investAmount);

        let balance1Inicial = await WGLBD.balanceOf(addr1.address);
        let balance2Inicial = await WGLBD.balanceOf(addr2.address);

        await ipso.recoverWGLBD(addr1.address);
        expect((await WGLBD.balanceOf(addr1.address)).sub(balance1Inicial)).equal(0);

        await ipso.recoverWGLBD(addr2.address);
        expect((await WGLBD.balanceOf(addr2.address)).sub(balance2Inicial)).equal(0);

        await ethers.provider.send('evm_increaseTime', [40000]);

        /*console.log(await ipso.startPresale());
        console.log(await ipso.endPresale());*/
        console.log(await ipso.availableToRecoverWGLBD(addr2.address));
        //console.log(await ipso.userInfo(addr2.address));
        //await ipso.recoverWGLBD(addr1.address);
        /*expect((await WGLBD.balanceOf(addr1.address)).sub(balance1Inicial)).equal(0);*/

    });

    xit("2.- RaisingAmount not reached", async function () {
        let investAmount = BigNumber.from(2000).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG);
        expect(await ipso.invest(investAmount)).to.emit(ipso, "Invest").withArgs(deployer.address,investAmount);
        investAmount = BigNumber.from(3000).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG);
        expect(await ipso.connect(addr1).invest(investAmount)).to.emit(ipso, "Invest").withArgs(addr1.address,investAmount);
        investAmount = BigNumber.from(4000).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG);
        await ipso.setWhitelist(addr2.address,true);
        expect(await ipso.connect(addr2).invest(investAmount)).to.emit(ipso, "Invest").withArgs(addr2.address,investAmount);
        expect((await ipso.getUserAllocation(deployer.address)).div(10000)).to.equal(22);
        expect((await ipso.getUserAllocation(addr1.address)).div(10000)).to.equal(33);
        expect((await ipso.getUserAllocation(addr2.address)).div(10000)).to.equal(44);
        expect((await ipso.getExcessInvestmentTokens(deployer.address))).to.equal(0);
        expect((await ipso.getExcessInvestmentTokens(addr1.address))).to.equal(0);
        expect((await ipso.getExcessInvestmentTokens(addr2.address))).to.equal(0);
    });
    xit("3.- RaisingAmount reached", async function () {
        let investAmount = BigNumber.from(3000).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG);
        expect(await ipso.invest(investAmount)).to.emit(ipso, "Invest").withArgs(deployer.address,investAmount);
        investAmount = BigNumber.from(4000).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG);
        expect(await ipso.connect(addr1).invest(investAmount)).to.emit(ipso, "Invest").withArgs(addr1.address,investAmount);
        investAmount = BigNumber.from(5000).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG);
        await ipso.setWhitelist(addr2.address,true);
        expect(await ipso.connect(addr2).invest(investAmount)).to.emit(ipso, "Invest").withArgs(addr2.address,investAmount);
        expect((await ipso.getUserAllocation(deployer.address)).div(10000)).to.equal(25);
        expect((await ipso.getUserAllocation(addr1.address)).div(10000)).to.equal(33);
        expect((await ipso.getUserAllocation(addr2.address)).div(10000)).to.equal(41);
        expect((await ipso.getExcessInvestmentTokens(deployer.address))).to.equal(((await ipso.totalAmountInvested()).sub(await ipso.raisingAmount())).mul(await ipso.getUserAllocation(deployer.address)).div(1000000));
        //expect((await ipso.getExcessInvestmentTokens(addr1.address))).to.almost.equal(((await ipso.totalAmountInvested()).sub(await ipso.raisingAmount())).mul(await ipso.getUserAllocation(addr1.address)).div(1000000));
        //expect((await ipso.getExcessInvestmentTokens(addr2.address))).to.almost.equal(((await ipso.totalAmountInvested()).sub(await ipso.raisingAmount())).mul(await ipso.getUserAllocation(addr2.address)).div(1000000));

        await ipso.refundExcessInvestmentTokens(deployer.address);
        await ipso.refundExcessInvestmentTokens(addr1.address);
        await ipso.refundExcessInvestmentTokens(addr2.address);

        expect((await ipso.getExcessInvestmentTokens(deployer.address))).to.equal(0);
        expect((await ipso.getExcessInvestmentTokens(addr1.address))).to.equal(0);
        expect((await ipso.getExcessInvestmentTokens(addr2.address))).to.equal(0);

    });
    xit("4.- Able to invest if whitelisted", async function () {
        await ipso.setWhitelist(addr2.address,true);
        let investAmount = BigNumber.from(5).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG);
        expect(await ipso.connect(addr2).invest(investAmount)).to.emit(ipso, "Invest").withArgs(addr2.address,investAmount);
    });
    xit("5.- Not able to invest if blacklisted", async function () {
        await ipso.setWhitelist(addr1.address,true);
        await ipso.setBlacklist(addr1.address,true);
        let investAmount = BigNumber.from(5).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG);
        await expect( ipso.connect(addr1).invest(investAmount)).to.be.revertedWith("you cannot invest");
    });
    xit("6.- Not able to invest before presale", async function () {
        await ethers.provider.send('evm_increaseTime', [400]);
        let investAmount = BigNumber.from(5).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_BIG);
        await expect(ipso.connect(addr1).invest(investAmount)).to.be.revertedWith("not presale time");
    });
});