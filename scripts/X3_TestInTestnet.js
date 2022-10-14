// IMPORTANT PEL TEST5 NECESSITEM ENVIAR SGLBD DE DEPLOYER_ADDRESS A ADDRE1,2,3. SI NO, NO PODEM FER UNSTKAE.
// SHA DENVIAR SGLBD A TOTHOM QUE SE LI MIGRI AUTOMÀTICAMENT.
// AQUEST SGLBD HA DE SER UN NOU TOKEN JA QUE NO TENIM ACCÉS A L'ANTERIOR.
// FA FALTA DEFINIR UNA FEEWALLET


const { ethers } = require("hardhat");
const {
    GLBD_ADDRESS_V2,
    SGLBD_ADDRESS_V2,
    FEE_ADDRESS,
    STAKING_ADDRESS_V2,
    STAKING_HELPER_ADDRESS_V2,
    STAKING_WARMUP_ADDRESS_V2,
    EPOCLENGHTINBLOCKS,
    FIRSTBLOCKEPOCH,
    FIRSTEPOCHNUMBER,
    INIT_INDEX,
    DEPLOYER_ADDRESS, DISTRIBUTOR_ADDRESS_V2, BUSD_V2, TREASURY_ADDRESS_V2, FEE_ADDRESS_B
} = require("./addresses_testnet");
const {BigNumber} = require("@ethersproject/bignumber");

let GLBD;
let sGLBD;
let Staking;
let StakingHelper;
let StakingWarmup;
let Treasury;
let BUSD;
let Distributor;
let deploys = true;
let test1 = true;
let test2 = false;
let test3 = false;
let test4 = false;
let test5 = false; // No espot fer servir amb signers, s'hauria de passar a test. Es mira que unstakingFee() sigui correcte a testnet.bscscan per donar-ho com a vàlid

const TOKEN_DECIMALS_LITTLE = 9;
const BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_LITTLE = BigNumber.from(10).pow(TOKEN_DECIMALS_LITTLE);
const INITIAL_SUPPLY_LITTLE = BigNumber.from(100000000).mul(BIG_NUMBER_TOKEN_DECIMALS_MULTIPLIER_LITTLE);

function returnSeconds() {
    const d = new Date();
    let seconds = d.getSeconds();
    return seconds;
}

function returnMinutes() {
    const d = new Date();
    let min = d.getMinutes();
    return min;
}

function returnHours() {
    const d = new Date();
    let min = d.getHours();
    return min;
}

async function main() {

    // Wallets que nos creamos para los tests
    const [testAccount, addr1, addr2, addr3] = await ethers.getSigners();
    let timeoutPeriod = 3000;

    // getContractFactories
    const GLBDT = await ethers.getContractFactory('GlobalDAOToken');
    const sGLBDT = await ethers.getContractFactory('sGlobalDAOToken');
    const StakingT = await ethers.getContractFactory('StakingWithEarlyPenaltyFee');
    const StakingHelperT = await ethers.getContractFactory('StakingHelper');
    const StakingWarmupT = await ethers.getContractFactory('StakingWarmup');
    const TreasuryT = await ethers.getContractFactory('GlobalDAOTreasury');
    const BUSDT = await ethers.getContractFactory('BEP20Token');
    const DistributorT = await ethers.getContractFactory('Distributor');

    // Deploys
    if (deploys) {

        GLBD = await GLBDT.deploy();
        sGLBD = await sGLBDT.deploy();
        Staking = await StakingT.deploy(GLBD.address, sGLBD.address, FEE_ADDRESS, EPOCLENGHTINBLOCKS, FIRSTEPOCHNUMBER, FIRSTBLOCKEPOCH);
        StakingHelper = await StakingHelperT.deploy(Staking.address, GLBD.address);
        StakingWarmup = await StakingWarmupT.deploy(Staking.address, sGLBD.address);
        BUSD = await BUSDT.deploy();
        Treasury = await TreasuryT.deploy(GLBD.address, BUSD.address, BUSD.address, 0);
        Distributor = await DistributorT.deploy(Treasury.address, GLBD.address, EPOCLENGHTINBLOCKS, FIRSTBLOCKEPOCH);

        console.log("[Verifying contracts]");
        try {
            console.log("[[V] GLBD] ", GLBD.address);
            await hre.run("verify:verify", {
                address: GLBD.address,
                constructorArguments: [
                ],
            });
            console.log("[[V] GLBD] Success");
        } catch (err) {
            console.log(err.message);
        }

        try {
            console.log("[[V] SGLBD] ", sGLBD.address);
            await hre.run("verify:verify", {
                address: sGLBD.address,
                constructorArguments: [
                ],
            });
            console.log("[[V] SGLBD] Success");
        } catch (err) {
            console.log(err.message);
        }

        try {
            console.log("[[V] Staking] ", Staking.address);
            await hre.run("verify:verify", {
                address: Staking.address,
                constructorArguments: [
                    GLBD.address,
                    sGLBD.address,
                    FEE_ADDRESS,
                    EPOCLENGHTINBLOCKS,
                    FIRSTEPOCHNUMBER,
                    FIRSTBLOCKEPOCH
                ],
            });
            console.log("[[V] Staking] Success");
        } catch (err) {
            console.log(err.message);
        }

        try {
            console.log("[[V] Staking Helper] ", StakingHelper.address);
            await hre.run("verify:verify", {
                address: StakingHelper.address,
                constructorArguments: [
                    Staking.address,
                    GLBD.address
                ],
            });
            console.log("[[V] Staking Helper] Success");
        } catch (err) {
            console.log(err.message);
        }

        try {
            console.log("[[V] Staking Warm up] ", StakingWarmup.address);
            await hre.run("verify:verify", {
                address: StakingWarmup.address,
                constructorArguments: [
                    Staking.address,
                    sGLBD.address
                ],
            });
            console.log("[[V] Staking Warm up] Success");
        } catch (err) {
            console.log(err.message);
        }

        console.log("[Verifications sucessfull]");

        // Setup
        console.log("const GLBD_ADDRESS_V2 = '" + GLBD.address +"';");
        console.log("const SGLBD_ADDRESS_V2 = '" + sGLBD.address+"';");
        console.log("const STAKING_ADDRESS_V2 = '" + Staking.address+"';");
        console.log("const STAKING_HELPER_ADDRESS_V2 = '" + StakingHelper.address+"';");
        console.log("const STAKING_WARMUP_ADDRESS_V2 = '" + StakingWarmup.address+"';");
        console.log("const DISTRIBUTOR_ADDRESS_V2 = '" + Distributor.address+"';");
        console.log("const BUSD_V2 = '" + BUSD.address+"';");
        console.log("const TREASURY_ADDRESS_V2 = '" + Treasury.address+"';");

        console.log("[Set up] Deployer: " + DEPLOYER_ADDRESS);
        console.log("[GLBD.setVault "+ DEPLOYER_ADDRESS +"]");
        GLBD.setVault(DEPLOYER_ADDRESS);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));


        console.log("[GLBD.mint "+ DEPLOYER_ADDRESS +", "+INITIAL_SUPPLY_LITTLE+" ]");
        GLBD.mint(DEPLOYER_ADDRESS, INITIAL_SUPPLY_LITTLE);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));


        console.log("[GLBD.approve "+ StakingHelper.address +", "+INITIAL_SUPPLY_LITTLE+" ]");
        GLBD.approve(StakingHelper.address, INITIAL_SUPPLY_LITTLE);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));

        console.log("[sGLBD.initialize "+ Staking.address +"]");
        sGLBD.initialize(Staking.address);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));

        console.log("[sGLBD.setIndex "+ INIT_INDEX +"]");
        sGLBD.setIndex(INIT_INDEX);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));

        console.log("[sGLBD.approve "+ Staking.address +", "+INITIAL_SUPPLY_LITTLE+" ]");
        sGLBD.approve(Staking.address, INITIAL_SUPPLY_LITTLE);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));

        console.log("[Staking.setWarmup 0");
        Staking.setWarmup(0);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));

        console.log("[Staking.setContract 0 " + Distributor.address + "]");
        await Staking.setContract('0', Distributor.address);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));

        // Staking SetContract to StakingWarmUp
        console.log("[Staking.setContract 1" + StakingWarmup.address);
        await Staking.setContract('1', StakingWarmup.address);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    } else {
        GLBD = await GLBDT.attach(GLBD_ADDRESS_V2);
        sGLBD = await sGLBDT.attach(SGLBD_ADDRESS_V2);
        Staking = await StakingT.attach(STAKING_ADDRESS_V2);
        StakingHelper = await StakingHelperT.attach(STAKING_HELPER_ADDRESS_V2);
        StakingWarmup = await StakingWarmupT.attach(STAKING_WARMUP_ADDRESS_V2);
        Treasury = await TreasuryT.attach(TREASURY_ADDRESS_V2);
        BUSD = await BUSDT.attach(BUSD_V2);
        Distributor = await DistributorT.attach(DISTRIBUTOR_ADDRESS_V2);
    }

    if (!deploys) {
        // Info general
        console.log("const GLBD_ADDRESS_V2 = '" + GLBD.address + "';");
        console.log("const SGLBD_ADDRESS_V2 = '" + sGLBD.address + "';");
        console.log("const STAKING_ADDRESS_V2 = '" + Staking.address + "';");
        console.log("const STAKING_HELPER_ADDRESS_V2 = '" + StakingHelper.address + "';");
        console.log("const STAKING_WARMUP_ADDRESS_V2 = '" + StakingWarmup.address + "';");
        console.log("const DISTRIBUTOR_ADDRESS_V2 = '" + Distributor.address + "';");
        console.log("const BUSD_V2 = '" + BUSD.address + "';");
        console.log("const TREASURY_ADDRESS_V2 = '" + Treasury.address + "';");
    }

    let _fullAmount = 100000000000;
    let _base9 = 1000000000;
    Staking.setFeeWallet(FEE_ADDRESS_B);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));
    Staking.setEarlyUnstakingFee(2000);
    await new Promise(r => setTimeout(() => r(), timeoutPeriod));

    let _GLBDFee;
    let _userAmount;

    if (test1) {
        // Stake 1 básico. Nota: la fee és general i el seu valor no depèn del moment de l'staking
        console.log("------------------------------------------------------------------------------ 1 ------------------------------------------------------------------------------");
        console.log("[Deployer] balance GLBD and sGLBD before staking --> = '" + await GLBD.balanceOf(DEPLOYER_ADDRESS)/_base9 + "' y '" + await sGLBD.balanceOf(DEPLOYER_ADDRESS)/_base9 + "'");
        console.log("[Staking] balance GLBD and sGLBD before staking --> = '" + await GLBD.balanceOf(Staking.address)/_base9 + "' y '" + await sGLBD.balanceOf(Staking.address)/_base9 + "'");
        console.log("[Fee wallet] balance GLBD and sGLBD before staking --> = '" + await GLBD.balanceOf(FEE_ADDRESS_B)/_base9 + "' y '" + await sGLBD.balanceOf(FEE_ADDRESS_B)/_base9 + "'");
        console.log("[GLBD to stake = '" + _fullAmount/_base9 + "']");
        let fee2apply = await Staking.unstakingFee(DEPLOYER_ADDRESS, 0);
        await StakingHelper.stake(_fullAmount, DEPLOYER_ADDRESS);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));

        console.log("[Deployer] balance GLBD and sGLBD after staking --> = '" + await GLBD.balanceOf(DEPLOYER_ADDRESS)/_base9 + "' y '" + await sGLBD.balanceOf(DEPLOYER_ADDRESS)/_base9 + "'");
        console.log("[Staking] balance GLBD and sGLBD after staking --> = '" + await GLBD.balanceOf(Staking.address)/_base9 + "' y '" + await sGLBD.balanceOf(Staking.address)/_base9 + "'");

        _GLBDFee = fee2apply == 0 ? 0 : (_fullAmount * (fee2apply)) / (10000);
        _userAmount = _fullAmount - _GLBDFee;
        console.log("[fee2apply: '" + fee2apply/100 + "']");
        console.log("[_GLBDFee: '" + _GLBDFee/_base9 + "']");
        console.log("[_userAmount: '" + _userAmount/_base9 + "']");

        Staking.unstake(_fullAmount);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));

        console.log("[Deployer] balance GLBD and sGLBD after unstaking --> = '" + await GLBD.balanceOf(DEPLOYER_ADDRESS)/_base9 + "' y '" + await sGLBD.balanceOf(DEPLOYER_ADDRESS)/_base9 + "'");
        console.log("[Staking] balance GLBD and sGLBD after unstaking --> = '" + await GLBD.balanceOf(Staking.address)/_base9 + "' y '" + await sGLBD.balanceOf(Staking.address)/_base9 + "'");
        console.log("[Fee wallet] balance GLBD and sGLBD after unstaking --> = '" + await GLBD.balanceOf(FEE_ADDRESS_B)/_base9 + "' y '" + await sGLBD.balanceOf(FEE_ADDRESS_B)/_base9 + "'");
        console.log("Quantitat que hem stakejat i unstakejat: " + _fullAmount/_base9 + " = _userAmount("+_userAmount/_base9+") + _GLBDFee("+_GLBDFee/_base9+")");
    }

    if (test2) {
        // Stake 2 básico.
        console.log("------------------------------------------------------------------------------ 2 ------------------------------------------------------------------------------");
        await Staking.setFeeWallet(FEE_ADDRESS_B);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));

        await Staking.setEarlyUnstakingFee(750);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));
        console.log("[Deployer] balance GLBD and sGLBD before staking --> = '" + await GLBD.balanceOf(DEPLOYER_ADDRESS)/_base9 + "' y '" + await sGLBD.balanceOf(DEPLOYER_ADDRESS)/_base9 + "'");
        console.log("[Staking] balance GLBD and sGLBD before staking --> = '" + await GLBD.balanceOf(Staking.address)/_base9 + "' y '" + await sGLBD.balanceOf(Staking.address)/_base9 + "'");
        console.log("[Fee wallet] balance GLBD and sGLBD before staking --> = '" + await GLBD.balanceOf(FEE_ADDRESS_B)/_base9 + "' y '" + await sGLBD.balanceOf(FEE_ADDRESS_B)/_base9 + "'");
        console.log("[GLBD to stake = '" + _fullAmount/_base9 + "']");
        fee2apply = await Staking.unstakingFee(DEPLOYER_ADDRESS, 0);
        await StakingHelper.stake(_fullAmount, DEPLOYER_ADDRESS);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));

        console.log("[Deployer] balance GLBD and sGLBD after staking --> = '" + await GLBD.balanceOf(DEPLOYER_ADDRESS)/_base9 + "' y '" + await sGLBD.balanceOf(DEPLOYER_ADDRESS)/_base9 + "'");
        console.log("[Staking] balance GLBD and sGLBD after staking --> = '" + await GLBD.balanceOf(Staking.address)/_base9 + "' y '" + await sGLBD.balanceOf(Staking.address)/_base9 + "'");

        _GLBDFee = fee2apply == 0 ? 0 : (_fullAmount * (fee2apply)) / (10000);
        _userAmount = _fullAmount - _GLBDFee;
        console.log("[fee2apply: '" + fee2apply/100 + "']");
        console.log("[_GLBDFee: '" + _GLBDFee/_base9 + "']");
        console.log("[_userAmount: '" + _userAmount/_base9 + "']");

        await Staking.unstake(_fullAmount);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));

        console.log("[Deployer] balance GLBD and sGLBD after unstaking --> = '" + await GLBD.balanceOf(DEPLOYER_ADDRESS)/_base9 + "' y '" + await sGLBD.balanceOf(DEPLOYER_ADDRESS)/_base9 + "'");
        console.log("[Staking] balance GLBD and sGLBD after unstaking --> = '" + await GLBD.balanceOf(Staking.address)/_base9 + "' y '" + await sGLBD.balanceOf(Staking.address)/_base9 + "'");
        console.log("[Fee wallet] balance GLBD and sGLBD after unstaking --> = '" + await GLBD.balanceOf(FEE_ADDRESS_B)/_base9 + "' y '" + await sGLBD.balanceOf(FEE_ADDRESS_B)/_base9 + "'");
        console.log("Quantitat que hem stakejat i unstakejat: " + _fullAmount/_base9 + " = _userAmount("+_userAmount/_base9+") + _GLBDFee("+_GLBDFee/_base9+")");
    }
    if (test3) {
        // Migrators
        console.log("------------------------------------------------------------------------------ 3 ------------------------------------------------------------------------------");
        let _withdrawAmount = 1000000000;
        console.log("[Staking] balance GLBD and sGLBD BEFORE recovering "+_withdrawAmount/_base9+" tokens --> = '" + await GLBD.balanceOf(Staking.address)/_base9 + "' y '" + await sGLBD.balanceOf(Staking.address)/_base9 + "'");
        await Staking.recoverWrongTokensIERC20(SGLBD_ADDRESS_V2, _withdrawAmount);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));

        //await Staking.recoverWrongTokensIERC20(GLBD_ADDRESS_V2, _withdrawAmount);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));
        console.log("[Staking] balance GLBD and sGLBD AFTER recovering twice "+_withdrawAmount/_base9+" tokens --> = '" + await GLBD.balanceOf(Staking.address)/_base9 + "' y '" + await sGLBD.balanceOf(Staking.address)/_base9 + "'");

    }

    if (test4) {
        // PeriodInBlocks
        console.log("------------------------------------------------------------------------------ 4 ------------------------------------------------------------------------------");

        let _stakingAmount = 100000000000; //100
        let _unstakingAmount = 100000000000/4; //100
        await Staking.setBlockPeriod(20);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));

        await Staking.setEarlyUnstakingFee(500);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));

        await StakingHelper.stake(_stakingAmount, DEPLOYER_ADDRESS);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod*2));
        let _PeriodInBlocks = await Staking.periodInBlocks();
        let _unstakingFee = await Staking.unstakingFee(DEPLOYER_ADDRESS, 0);
        console.log("[Staking 1] Block period --> = '" + _PeriodInBlocks + "'. Fee actual: " + _unstakingFee + ". Current time: "+returnHours()+":"+returnMinutes()+":" + returnSeconds() + ". Last deposit: " + await Staking.lastBlockDepositedByWallet(DEPLOYER_ADDRESS) + "'");
        await Staking.unstake(_unstakingAmount);
        let _GLBDFee = _unstakingFee == 0 ? 0 : (_unstakingAmount * (_unstakingFee)) / (10000);
        let _userAmount = _unstakingAmount - _GLBDFee;
        console.log("[fee2apply 1: '" + _unstakingFee + "']");
        console.log("[_GLBDFee 1: '" + _GLBDFee + "']");
        console.log("[_userAmount 1: '" + _userAmount + "']");
        await new Promise(r => setTimeout(() => r(), timeoutPeriod*21));

        _PeriodInBlocks = await Staking.periodInBlocks();
        _unstakingFee = await Staking.unstakingFee(DEPLOYER_ADDRESS, 0);
        console.log("[Staking 2] Block period --> = '" + _PeriodInBlocks + "'. Fee actual: " + _unstakingFee + ". Current time: "+returnHours()+":"+returnMinutes()+":" + returnSeconds() + ". Last deposit: " + await Staking.lastBlockDepositedByWallet(DEPLOYER_ADDRESS) + "'");
        await Staking.unstake(_unstakingAmount);
        _GLBDFee = _unstakingFee == 0 ? 0 : (_unstakingAmount * (_unstakingFee)) / (10000);
        _userAmount = _unstakingAmount - _GLBDFee;
        console.log("[fee2apply 2: '" + _unstakingFee + "']");
        console.log("[_GLBDFee 2: '" + _GLBDFee + "']");
        console.log("[_userAmount 2: '" + _userAmount + "']");
        await new Promise(r => setTimeout(() => r(), timeoutPeriod*20));

        _PeriodInBlocks = await Staking.periodInBlocks();
        _unstakingFee = await Staking.unstakingFee(DEPLOYER_ADDRESS, 0);
        console.log("[Staking 3] Block period --> = '" + _PeriodInBlocks + "'. Fee actual: " + _unstakingFee + ". Current time: "+returnHours()+":"+returnMinutes()+":" + returnSeconds() + ". Last deposit: " + await Staking.lastBlockDepositedByWallet(DEPLOYER_ADDRESS) + "'");
        await Staking.unstake(_unstakingAmount);
        _GLBDFee = _unstakingFee == 0 ? 0 : (_unstakingAmount * (_unstakingFee)) / (10000);
        _userAmount = _unstakingAmount - _GLBDFee;
        console.log("[fee2apply 3: '" + _unstakingFee + "']");
        console.log("[_GLBDFee 3: '" + _GLBDFee + "']");
        console.log("[_userAmount 3: '" + _userAmount + "']");
        await new Promise(r => setTimeout(() => r(), timeoutPeriod*21));

        _PeriodInBlocks = await Staking.periodInBlocks();
        _unstakingFee = await Staking.unstakingFee(DEPLOYER_ADDRESS, 0);
        console.log("[Staking 4] Block period --> = '" + _PeriodInBlocks + "'. Fee actual: " + _unstakingFee + ". Current time: "+returnHours()+":"+returnMinutes()+":" + returnSeconds() + ". Last deposit: " + await Staking.lastBlockDepositedByWallet(DEPLOYER_ADDRESS) + "'");
        await Staking.unstake(_unstakingAmount);
        _GLBDFee = _unstakingFee == 0 ? 0 : (_unstakingAmount * (_unstakingFee)) / (10000);
        _userAmount = _unstakingAmount - _GLBDFee;
        console.log("[fee2apply 4: '" + _unstakingFee + "']");
        console.log("[_GLBDFee 4: '" + _GLBDFee + "']");
        console.log("[_userAmount 4: '" + _userAmount + "']");
    }

    if (test5) {
        // PeriodInBlocks. Provem de posar un o varios stakers que fan una migració
        console.log("------------------------------------------------------------------------------ 5 ------------------------------------------------------------------------------");
        let _stakingAmount = 100000000000; //100
        let _unstakingAmount = 100000000000/4; //100
        await Staking.setBlockPeriod(10); // 0.5 minutos = 30''
        console.log("[New staking --> = setBlockPeriod]");
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));

        await Staking.setEarlyUnstakingFee(500);
        console.log("[New staking --> = setEarlyUnstakingFee]");
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));

        await StakingHelper.stake(_stakingAmount, DEPLOYER_ADDRESS); // Random account stakes GLBD so staking contract has tokens in
        console.log("[New staking DEPLOYER--> = StakingHelper.stake]. Current time: "+returnHours()+":"+returnMinutes()+":" + returnSeconds());
        await new Promise(r => setTimeout(() => r(), timeoutPeriod*2));

        Staking.setInitialDepositDateForStaker('21005846', addr1.address); // Aquest bloc ja ha passat fa temps així que tot i que el deployer acaba de fer staking i ha d'esperar per treure sense fee, el addr1 hauria de poder-ho treureu tot sense pagar la fee.
        console.log("[New staking --> = setInitialDepositDateForStaker: 21005846. "+addr1.address+"]");
        await new Promise(r => setTimeout(() => r(), timeoutPeriod*2));

        Staking.setInitialDepositDateForStakers(['21005846', '2100584'], [addr2.address, addr3.address]); // Aquest bloc ja ha passat fa temps així que tot i que el deployer acaba de fer staking i ha d'esperar per treure sense fee, el addr1 hauria de poder-ho treureu tot sense pagar la fee.
        console.log("[New staking --> = setInitialDepositDateForStaker: 21005846 -> "+addr2.address+". 2100584 -> "+addr3.address+"]");
        await new Promise(r => setTimeout(() => r(), timeoutPeriod*2));

        let _PeriodInBlocks = await Staking.periodInBlocks();
        let _unstakingFee0 = await Staking.unstakingFee(DEPLOYER_ADDRESS, 0);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));
        console.log("[New Staking --> = '" + _PeriodInBlocks + "'. Fee deployer: " + _unstakingFee0 + ". Current time: "+returnMinutes()+":" + returnSeconds() + ". Last deposit: " + await Staking.lastBlockDepositedByWallet(DEPLOYER_ADDRESS) + ". Unstaking fee: '" + _unstakingFee0 + "'");
        let _GLBDFee0 = _unstakingFee0 == 0 ? 0 : (_unstakingAmount * (_unstakingFee0)) / (10000);
        let _userAmount0 = _unstakingAmount - _GLBDFee0;
        console.log("[fee2apply 0 (deployer - max): '" + _unstakingFee0 + "']");
        console.log("[_GLBDFee 0: '" + _GLBDFee0 + "']");
        console.log("[_userAmount 0: '" + _userAmount0 + "']");

        let _unstakingFee1 = await Staking.connect(addr1.address).unstakingFee(addr1.address, 0);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));
        console.log("[New Staking --> = '" + _PeriodInBlocks + "'. Fee addr1: " + _unstakingFee1 + ". Current time: "+returnMinutes()+":" + returnSeconds() + ". Last deposit: " + await Staking.lastBlockDepositedByWallet(addr1.address) + ". Unstaking fee: '" + _unstakingFee1 + "'");
        let _GLBDFee1 = _unstakingFee1 == 0 ? 0 : (_unstakingAmount * (_unstakingFee1)) / (10000);
        let _userAmount1 = _unstakingAmount - _GLBDFee1;
        console.log("[fee2apply 1 (old - no fee): '" + _unstakingFee1 + "']");
        console.log("[_GLBDFee 1: '" + _GLBDFee1 + "']");
        console.log("[_userAmount 1: '" + _userAmount1 + "']");

        let _unstakingFee2 = await Staking.connect(addr2.address).unstakingFee(addr2.address, 0);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));
        console.log("[New Staking --> = '" + _PeriodInBlocks + "'. Fee addr2: " + _unstakingFee2 + ". Current time: "+returnMinutes()+":" + returnSeconds() + ". Last deposit: " + await Staking.lastBlockDepositedByWallet(addr2.address) + ". Unstaking fee: '" + _unstakingFee2 + "'");
        let _GLBDFee2 = _unstakingFee2 == 0 ? 0 : (_unstakingAmount * (_unstakingFee2)) / (10000);
        let _userAmount2 = _unstakingAmount - _GLBDFee2;
        console.log("[fee2apply 2 (old - no fee): '" + _unstakingFee2 + "']");
        console.log("[_GLBDFee 2: '" + _GLBDFee2 + "']");
        console.log("[_userAmount 2: '" + _userAmount2 + "']");

        let _unstakingFee3 = await Staking.connect(addr3.address).unstakingFee(addr3.address, 0);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));
        console.log("[New Staking --> = '" + _PeriodInBlocks + "'. Fee addr3: " + _unstakingFee3 + ". Current time: "+returnMinutes()+":" + returnSeconds() + ". Last deposit: " + await Staking.lastBlockDepositedByWallet(addr3.address) + ". Unstaking fee: '" + _unstakingFee3 + "'");
        let _GLBDFee3 = _unstakingFee3 == 0 ? 0 : (_unstakingAmount * (_unstakingFee3)) / (10000);
        let _userAmount3 = _unstakingAmount - _GLBDFee3;
        console.log("[fee2apply 3 (old - no fee): '" + _unstakingFee3 + "']");
        console.log("[_GLBDFee 3: '" + _GLBDFee3 + "']");
        console.log("[_userAmount 3: '" + _userAmount3 + "']");

        // NECESSITEM SGLBD PER TAL DE PODER FER UNSTAKE!!!!!!!!
        await Staking.connect(addr1.address).unstake(_unstakingAmount);
        /*
        await Staking.unstake(_unstakingAmount);
        /*
        await new Promise(r => setTimeout(() => r(), timeoutPeriod*5));

        await Staking.connect(addr1.address).unstake(_unstakingAmount);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));

        await Staking.connect(addr2.address).unstake(_unstakingAmount);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));

        await Staking.connect(addr3.address).unstake(_unstakingAmount);
        await new Promise(r => setTimeout(() => r(), timeoutPeriod));*/
    }
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
    })


