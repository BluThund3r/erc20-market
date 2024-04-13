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

    it("Should add liquidity", async function () {
        const { erc20Contract: tokenA } = await deployERC20ContractOK();
        const { erc20Contract: tokenB } = await deployERC20ContractOK();

        const LP = await deployContract(tokenA, tokenB);

        const amountA = 1000;
        const amountB = 1000;

        await tokenA.approve(LP.target, amountA);
        await tokenB.approve(LP.target, amountB);

        await LP.addLiquidity(amountA, amountB);

        const LPBalanceA = await tokenA.balanceOf(LP.target);
        const LPBalanceB = await tokenB.balanceOf(LP.target);

        expect(LPBalanceA).to.equal(1000);
        expect(LPBalanceB).to.equal(1000);
    });

    it("Should remove liquidity", async function () {
        const { erc20Contract: tokenA } = await deployERC20ContractOK();
        const { erc20Contract: tokenB } = await deployERC20ContractOK();

        const LP = await deployContract(tokenA, tokenB);

        const amountA = 1000;
        const amountB = 1000;

        await tokenA.approve(LP.target, amountA);
        await tokenB.approve(LP.target, amountB);

        await LP.addLiquidity(amountA, amountB);

        await LP.removeLiquidity(1000, 1000);

        const LPBalanceA = await tokenA.balanceOf(LP.target);
        const LPBalanceB = await tokenB.balanceOf(LP.target);

        expect(LPBalanceA).to.equal(0);
        expect(LPBalanceB).to.equal(0);
    });

    it("Should have a specific price 1", async function () {
        const { erc20Contract: tokenA } = await deployERC20ContractOK();
        const { erc20Contract: tokenB } = await deployERC20ContractOK();

        const LP = await deployContract(tokenA, tokenB);

        const amountA = 1000;
        const amountB = 1000;

        await tokenA.approve(LP.target, amountA);
        await tokenB.approve(LP.target, amountB);

        await LP.addLiquidity(amountA, amountB);

        const price = await LP.getPrice();

        expect(price).to.equal(1 * 1e9);
    });

    it("Should have a specific price 50", async function () {
        const { erc20Contract: tokenA } = await deployERC20ContractOK();
        const { erc20Contract: tokenB } = await deployERC20ContractOK();

        const LP = await deployContract(tokenA, tokenB);

        const amountA = 1000;
        const amountB = 50000;
        // 1 tokenA = 50 tokenB

        await tokenA.approve(LP.target, amountA);
        await tokenB.approve(LP.target, amountB);

        await LP.addLiquidity(amountA, amountB);

        const price = await LP.getPrice();

        expect(price).to.equal(50 * 1e9);
    });


});
