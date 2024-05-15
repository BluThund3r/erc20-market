const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LPRouter Tests", function () {
  async function deployLPContract(tokenA, tokenB) {
    const LP = await ethers.getContractFactory("LP");
    const LPContract = await LP.deploy(tokenA, tokenB);
    return LPContract; // Directly return the deployed contract
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

  async function deployERC20ContractOK() {
    const initialTokens = 10 ** 6;
    const ERC20 = await ethers.getContractFactory("ERC20");

    const [owner, user2, user3, user4, user5] = await ethers.getSigners();

    const erc20Contract = await ERC20.connect(owner).deploy(
      initialTokens,
      "TestToken",
      "TT",
      false
    );

    return { erc20Contract, owner, user2, user3, user4, user5 };
  }

  async function getLPAddress(txReceipt) {
    return txReceipt.logs[0].args[0];
  }

  it("Should deploy LP contract", async function () {
    const { erc20Contract: tokenA } = await deployERC20ContractOK();
    const { erc20Contract: tokenB } = await deployERC20ContractOK();

    const LP = await deployLPContract(tokenA, tokenB);

    // Validate that the contracts have been deployed
    expect(LP).to.not.be.undefined;
  });

  it("Should deploy the Queue contract", async function () {
    const queueContract = await deployQueueContractOK();
    expect(queueContract).to.not.be.undefined;
  });

  it("Should deploy LPRouter contract", async function () {
    const LPRouterContract = await deployLPRouterContractOK();
    expect(LPRouterContract).to.not.be.undefined;
  });

  it("Should deploy LP using LPRouter", async function () {
    const { erc20Contract: tokenA } = await deployERC20ContractOK();
    const { erc20Contract: tokenB } = await deployERC20ContractOK();

    const LPRouter = await deployLPRouterContractOK();

    const LPtx = await LPRouter.createLP(tokenA, tokenB);
    await LPtx.wait();
    const LPAddress = await LPRouter.getLP(tokenA.target, tokenB.target);
    expect(ethers.isAddress(LPAddress)).to.be.true;
  });

  it("Should deploy more LP contracts using LPRouter", async function () {
    const { erc20Contract: tokenA } = await deployERC20ContractOK();
    const { erc20Contract: tokenB } = await deployERC20ContractOK();
    const { erc20Contract: tokenC } = await deployERC20ContractOK();

    const LPRouter = await deployLPRouterContractOK();

    const LPtx = await LPRouter.createLP(tokenA, tokenB);
    await LPtx.wait();
    const LP2tx = await LPRouter.createLP(tokenB, tokenC);
    await LP2tx.wait();

    const LPAddress1 = await LPRouter.getLP(tokenA.target, tokenB.target);
    const LPAddress2 = await LPRouter.getLP(tokenB.target, tokenC.target);
    expect(ethers.isAddress(LPAddress1) && LPAddress1 !== ethers.ZeroAddress).to
      .be.true;
    expect(ethers.isAddress(LPAddress2) && LPAddress1 !== ethers.ZeroAddress).to
      .be.true;
  });

  it("Should check the path and LPs between two tokens that are directly linked", async function () {
    const { erc20Contract: tokenA } = await deployERC20ContractOK();
    const { erc20Contract: tokenB } = await deployERC20ContractOK();

    const LPRouter = await deployLPRouterContractOK();

    const LPtx = await LPRouter.createLP(tokenA, tokenB);
    await LPtx.wait();
    const LPAddress = await LPRouter.getLP(tokenA.target, tokenB.target);

    const testTx = await LPRouter.testLPs(tokenA.target, tokenB.target);
    const testReceipt = await testTx.wait();

    const logs = testReceipt.logs;
    const tokenPath = logs
      .filter((log) => log.fragment.name === "LogTokenAddress")
      .map((log) => log.args[0]);
    const lps = logs
      .filter((log) => log.fragment.name === "LogLPAddress")
      .map((log) => log.args[0]);
    expect(tokenPath).to.deep.equal([tokenA.target, tokenB.target]);
    expect(lps).to.deep.equal([LPAddress]);
  });

  it("Should check the path and LPs between two tokens that are not directly linked", async function () {
    const { erc20Contract: tokenA } = await deployERC20ContractOK();
    const { erc20Contract: tokenB } = await deployERC20ContractOK();
    const { erc20Contract: tokenC } = await deployERC20ContractOK();

    const LPRouter = await deployLPRouterContractOK();

    const LPtx = await LPRouter.createLP(tokenA, tokenB);
    await LPtx.wait();
    const LPAddress = await LPRouter.getLP(tokenA.target, tokenB.target);

    const LP2tx = await LPRouter.createLP(tokenB, tokenC);
    await LP2tx.wait();
    const LP2Address = await LPRouter.getLP(tokenB.target, tokenC.target);

    const testTx = await LPRouter.testLPs(tokenA.target, tokenC.target);
    const testReceipt = await testTx.wait();

    const logs = testReceipt.logs;
    const tokenPath = logs
      .filter((log) => log.fragment.name === "LogTokenAddress")
      .map((log) => log.args[0]);
    const lps = logs
      .filter((log) => log.fragment.name === "LogLPAddress")
      .map((log) => log.args[0]);
    expect(tokenPath).to.deep.equal([
      tokenA.target,
      tokenB.target,
      tokenC.target,
    ]);
    expect(lps).to.deep.equal([LPAddress, LP2Address]);
  });

  it("Should swap tokens with direct link using LPRouter", async function () {
    // const { erc20Contract: tokenA } = await deployERC20ContractOK();
    // const { erc20Contract: tokenB } = await deployERC20ContractOK();

    const LPRouter = await deployLPRouterContractOK();
    const [owner, user2] = await ethers.getSigners();

    const tokenATx = await LPRouter.createToken(10 ** 6, "TestTokenA", "TTA");
    const tokenAReceipt = await tokenATx.wait();
    const tokenBTx = await LPRouter.createToken(10 ** 6, "TestTokenB", "TTB");
    const tokenBReceipt = await tokenBTx.wait();

    const tokenAAddress = tokenAReceipt.logs[0].args[0];
    const tokenBAddress = tokenBReceipt.logs[0].args[0];

    const tokenA = await ethers.getContractAt("ERC20", tokenAAddress);
    const tokenB = await ethers.getContractAt("ERC20", tokenBAddress);

    const initialLiquidity = 1000;
    const LPtx = await LPRouter.createLP(tokenA, tokenB);
    const LPReceipt = await LPtx.wait();
    const LPaddress = await getLPAddress(LPReceipt);
    const LP = await ethers.getContractAt("LP", LPaddress);

    await tokenA.connect(owner).approve(LPaddress, initialLiquidity);
    await tokenB.connect(owner).approve(LPaddress, initialLiquidity);
    await LP.connect(owner).firstAddLiquidity(
      initialLiquidity,
      initialLiquidity
    );

    // await tokenA.connect(user2).approve(LPaddress, 100);
    // await tokenB.connect(user2).approve(LPaddress, 100);

    expect(await LPRouter.getLP(tokenA.target, tokenB.target)).to.equal(
      LPaddress
    );

    const amount = 100;
    await tokenA.connect(owner).transfer(user2, amount);
    const expectedResult =
      initialLiquidity -
      (initialLiquidity * initialLiquidity) / (initialLiquidity + amount);
    const swapTx = await LPRouter.connect(user2).swap(tokenA, tokenB, amount);
    await swapTx.wait();
    const result = await tokenB.balanceOf(user2.address);

    expect(result).to.equal(Math.floor(expectedResult));
  });

  it("Should find the path between two directly linked tokens", async function () {
    const { erc20Contract: tokenA } = await deployERC20ContractOK();
    const { erc20Contract: tokenB } = await deployERC20ContractOK();

    const LPRouter = await deployLPRouterContractOK();

    const LPtx = await LPRouter.createLP(tokenA, tokenB);
    await LPtx.wait();
    const LPAddress = await LPRouter.getLP(tokenA.target, tokenB.target);

    const testTx = await LPRouter.testLPs(tokenA.target, tokenB.target);
    const testReceipt = await testTx.wait();

    const logs = testReceipt.logs;
    const tokenPath = logs
      .filter((log) => log.fragment.name === "LogTokenAddress")
      .map((log) => log.args[0]);
    const lps = logs
      .filter((log) => log.fragment.name === "LogLPAddress")
      .map((log) => log.args[0]);
    expect(tokenPath).to.deep.equal([tokenA.target, tokenB.target]);
    expect(lps).to.deep.equal([LPAddress]);
  });

  it("Should find the path between two indirectly linked tokens", async function () {
    const { erc20Contract: tokenA } = await deployERC20ContractOK();
    const { erc20Contract: tokenB } = await deployERC20ContractOK();
    const { erc20Contract: tokenC } = await deployERC20ContractOK();

    const LPRouter = await deployLPRouterContractOK();

    const LPtx = await LPRouter.createLP(tokenA, tokenB);
    await LPtx.wait();
    const LPAddress = await LPRouter.getLP(tokenA.target, tokenB.target);

    const LP2tx = await LPRouter.createLP(tokenB, tokenC);
    await LP2tx.wait();
    const LP2Address = await LPRouter.getLP(tokenB.target, tokenC.target);

    const testTx = await LPRouter.testLPs(tokenA.target, tokenC.target);
    const testReceipt = await testTx.wait();

    const logs = testReceipt.logs;
    const tokenPath = logs
      .filter((log) => log.fragment.name === "LogTokenAddress")
      .map((log) => log.args[0]);
    const lps = logs
      .filter((log) => log.fragment.name === "LogLPAddress")
      .map((log) => log.args[0]);
    expect(tokenPath).to.deep.equal([
      tokenA.target,
      tokenB.target,
      tokenC.target,
    ]);
    expect(lps).to.deep.equal([LPAddress, LP2Address]);
  });
});
