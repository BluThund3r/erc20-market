const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("Structural Tests", function () {
  async function deployERC20ContractOK(
    initialTokens = 10 ** 6,
    name = "TestToken",
    symbol = "TT"
  ) {
    const ERC20 = await ethers.getContractFactory("ERC20");

    const [owner] = await ethers.getSigners();

    const erc20Contract = await ERC20.connect(owner).deploy(
      initialTokens,
      name,
      symbol,
      false
    );

    return erc20Contract;
  }

  async function deployLPRouterContractOK() {
    const queue = await deployQueueContractOK();
    const LPRouter = await ethers.getContractFactory("LPRouter");
    const LPRouterContract = await LPRouter.deploy(queue.target);
    return LPRouterContract;
  }

  async function deployQueueContractOK() {
    const Queue = await ethers.getContractFactory("Queue");
    const QueueContract = await Queue.deploy();
    return QueueContract;
  }

  async function getLPAddress(txReceipt) {
    return txReceipt.logs[0].args[0];
  }

  async function deployLPByRouter(router, tokenA, tokenB) {
    const tx = await router.createLP(tokenA.target, tokenB.target);
    const txReceipt = await tx.wait();
    const LPAddress = await getLPAddress(txReceipt);
    const LP = await ethers.getContractAt("LP", LPAddress);
    return LP;
  }

  async function deployFirst() {
    const tokenA = await deployERC20ContractOK(10 ** 6, "TestTokenA", "TTA");
    const tokenB = await deployERC20ContractOK(10 ** 6, "TestTokenB", "TTB");
    const tokenC = await deployERC20ContractOK(10 ** 6, "TestTokenC", "TTC");
    const LPRouter = await deployLPRouterContractOK();
    const LPAB = await deployLPByRouter(LPRouter, tokenA, tokenB);
    const LPBC = await deployLPByRouter(LPRouter, tokenB, tokenC);

    return { tokenA, tokenB, tokenC, LPRouter, LPAB, LPBC };
  }

  async function deploySecond() {
    const tokenA = await deployERC20ContractOK(10 ** 6, "TestTokenA", "TTA");
    const tokenB = await deployERC20ContractOK(10 ** 6, "TestTokenB", "TTB");
    const tokenC = await deployERC20ContractOK(10 ** 6, "TestTokenC", "TTC");
    const tokenD = await deployERC20ContractOK(10 ** 6, "TestTokenD", "TTD");
    const LPRouter = await deployLPRouterContractOK();
    const LPAB = await deployLPByRouter(LPRouter, tokenA, tokenB);
    const LPCD = await deployLPByRouter(LPRouter, tokenC, tokenD);
    return { tokenA, tokenB, tokenC, tokenD, LPRouter, LPAB, LPCD };
  }

  it("Should find a min path from tokenA to tokenC", async () => {
    const { tokenA, tokenC, tokenB, LPRouter } = await loadFixture(deployFirst);
    const tx = await LPRouter.testMinPath(tokenA.target, tokenC.target);
    const receipt = await tx.wait();
    const path = receipt.logs.map((log) => log.args[0]).slice(1);
    expect(path).to.deep.equal([tokenA.target, tokenB.target, tokenC.target]);
  });

  it("Should fail to find a min path between tokenA and tokenC", async () => {
    const { tokenA, tokenC, LPRouter } = await loadFixture(deploySecond);
    const tx = await LPRouter.testMinPath(tokenA.target, tokenC.target);
    const receipt = await tx.wait();
    const path = receipt.logs.map((log) => log.args[0]).slice(1);
    expect(path).to.deep.equal([]);
  });
});
