const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LPRouter Tests", function () {
    async function deployLPContract(tokenA, tokenB) {
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

        const LP = await deployLPContract(tokenA, tokenB);

        // Validate that the contracts have been deployed
        expect(LP).to.not.be.undefined;
    });

    it("Should deploy LPRouter contract", async function () {
        const LPRouter = await ethers.getContractFactory("LPRouter");
        const LPRouterContract = await LPRouter.deploy();
        expect(LPRouterContract).to.not.be.undefined;
    });

    it("Should deploy LP using LPRouter", async function () {
        const { erc20Contract: tokenA } = await deployERC20ContractOK();
        const { erc20Contract: tokenB } = await deployERC20ContractOK();

        const LPRouter = await ethers.getContractFactory("LPRouter");
        const LPRouterContract = await LPRouter.deploy();

        const LP = await LPRouterContract.createLP(tokenA, tokenB);
        expect(LP).to.not.be.undefined;
    });

    it("Should deploy more LP contracts using LPRouter", async function () {
        const { erc20Contract: tokenA } = await deployERC20ContractOK();
        const { erc20Contract: tokenB } = await deployERC20ContractOK();
        const { erc20Contract: tokenC } = await deployERC20ContractOK();

        const LPRouter = await ethers.getContractFactory("LPRouter");

        const LPRouterContract = await LPRouter.deploy();

        const LP = await LPRouterContract.createLP(tokenA, tokenB);
        const LP2 = await LPRouterContract.createLP(tokenB, tokenC);

        expect(LP).to.not.be.undefined;
        expect(LP2).to.not.be.undefined;
    });

});