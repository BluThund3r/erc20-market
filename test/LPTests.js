const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LP Tests", function () {
    async function deployContract(tokenA, tokenB) {
        const LP = await ethers.getContractFactory("LP");
        const LPContract = await LP.deploy(tokenA, tokenB);
        return LPContract;  // Directly return the deployed contract
    }

    async function deployERC20ContractOK() {
        const initialTokens = 10 ** 6;
        const ERC20 = await ethers.getContractFactory("ERC20");

        const [owner, user2, user3, user4, user5] = await ethers.getSigners();

        const erc20Contract = await ERC20.connect(owner).deploy(initialTokens);

        return { erc20Contract, owner, user2, user3, user4, user5 };
    }

    it("Should deploy LP contract", async function () {
        const { erc20Contract: tokenA } = await deployERC20ContractOK();
        const { erc20Contract: tokenB } = await deployERC20ContractOK();

        const LP = await deployContract(tokenA, tokenB);

        // Validate that the contracts have been deployed
        expect(LP).to.not.be.undefined;
    });

    it("Should add liquidity for first time", async function () {
        const { erc20Contract: tokenA } = await deployERC20ContractOK();
        const { erc20Contract: tokenB } = await deployERC20ContractOK();

        const LP = await deployContract(tokenA, tokenB);

        const amountA = 1000;
        const amountB = 1000;

        await tokenA.approve(LP.target, amountA);
        await tokenB.approve(LP.target, amountB);

        await LP.firstAddLiquidity(amountA, amountB);

        const LPBalanceA = await tokenA.balanceOf(LP.target);
        const LPBalanceB = await tokenB.balanceOf(LP.target);

        expect(LPBalanceA).to.equal(1000);
        expect(LPBalanceB).to.equal(1000);
    });

    it("Should add more liquidity", async function () {
        const { erc20Contract: tokenA } = await deployERC20ContractOK();
        const { erc20Contract: tokenB } = await deployERC20ContractOK();

        const LP = await deployContract(tokenA, tokenB);

        const amountA = 500;
        const amountB = 1000;

        await tokenA.approve(LP.target, amountA);
        await tokenB.approve(LP.target, amountB);

        await LP.firstAddLiquidity(amountA, amountB);

        const amount = 1000;

        await tokenA.approve(LP.target, amount);
        await tokenB.approve(LP.target, LP.getAmountBNecesary(amount));

        await LP.addLiquidity(amount);

        const LPBalanceA = await tokenA.balanceOf(LP.target);
        const LPBalanceB = await tokenB.balanceOf(LP.target);

        expect(LPBalanceA).to.equal(1500);
        expect(LPBalanceB).to.equal(3000);
    });

    it("Should remove liquidity", async function () {
        const { erc20Contract: tokenA } = await deployERC20ContractOK();
        const { erc20Contract: tokenB } = await deployERC20ContractOK();

        const LP = await deployContract(tokenA, tokenB);

        const amountA = 500;
        const amountB = 1000;

        await tokenA.approve(LP.target, amountA);
        await tokenB.approve(LP.target, amountB);

        await LP.firstAddLiquidity(amountA, amountB);

        const amount = 1000;

        await tokenA.approve(LP.target, amount);
        await tokenB.approve(LP.target, LP.getAmountBNecesary(amount));

        await LP.addLiquidity(amount);

        await LP.removeLiquidity(amount);

        const LPBalanceA = await tokenA.balanceOf(LP.target);
        const LPBalanceB = await tokenB.balanceOf(LP.target);

        expect(LPBalanceA).to.equal(500);
        expect(LPBalanceB).to.equal(1000);
    });

    it("Should have a specific price 1", async function () {
        const { erc20Contract: tokenA } = await deployERC20ContractOK();
        const { erc20Contract: tokenB } = await deployERC20ContractOK();

        const LP = await deployContract(tokenA, tokenB);

        const amountA = 1000;
        const amountB = 1000;

        await tokenA.approve(LP.target, amountA);
        await tokenB.approve(LP.target, amountB);

        await LP.firstAddLiquidity(amountA, amountB);

        const price = await LP.getPrice();

        expect(price).to.equal(1 * 1e9);
    });

    it("Should have a specific price 50", async function () {
        const { erc20Contract: tokenA } = await deployERC20ContractOK();
        const { erc20Contract: tokenB } = await deployERC20ContractOK();

        const LP = await deployContract(tokenA, tokenB);

        const amountA = 1000;
        const amountB = 50000;

        await tokenA.approve(LP.target, amountA);
        await tokenB.approve(LP.target, amountB);

        await LP.firstAddLiquidity(amountA, amountB);

        const price = await LP.getPrice();

        expect(price).to.equal(50 * 1e9);
    });

    it("Should getReturn return corect amount", async function () {
        const { erc20Contract: tokenA } = await deployERC20ContractOK();
        const { erc20Contract: tokenB } = await deployERC20ContractOK();

        const LP = await deployContract(tokenA, tokenB);

        const amountA = 1000;
        const amountB = 1000;

        await tokenA.approve(LP.target, amountA);
        await tokenB.approve(LP.target, amountB);

        await LP.firstAddLiquidity(amountA, amountB);

        const amount = 500;

        const returnAmount = await LP.getReturn(tokenA, amount);

        expect(returnAmount).to.equal(333);
    });

    it("Shoud swap tokens", async function () {
        const { erc20Contract: tokenA } = await deployERC20ContractOK();
        const { erc20Contract: tokenB } = await deployERC20ContractOK();

        const LP = await deployContract(tokenA, tokenB);

        const amountA = 1000;
        const amountB = 1000;

        await tokenA.approve(LP.target, amountA);
        await tokenB.approve(LP.target, amountB);

        await LP.firstAddLiquidity(amountA, amountB);

        const amount = 100;

        await tokenA.approve(LP.target, amount);

        await LP.swap(tokenA, amount);

        const LPBalanceA = await tokenA.balanceOf(LP.target);
        const LPBalanceB = await tokenB.balanceOf(LP.target);

        expect(LPBalanceA).to.equal(1100);
        expect(LPBalanceB).to.equal(910);
    });
});
