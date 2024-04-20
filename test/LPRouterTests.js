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
      "TT"
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
    const { erc20Contract: tokenA } = await deployERC20ContractOK();
    const { erc20Contract: tokenB } = await deployERC20ContractOK();

    const LPRouter = await deployLPRouterContractOK();
    const [owner, user2] = await ethers.getSigners();

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

    await tokenA.connect(user2).approve(LPaddress, 100);
    await tokenB.connect(user2).approve(LPaddress, 100);

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

  it("Should swap tokens with indirect link using LPRouter", async function () {
    const { erc20Contract: tokenA } = await deployERC20ContractOK();
    const { erc20Contract: tokenB } = await deployERC20ContractOK();
    const { erc20Contract: tokenC } = await deployERC20ContractOK();

    const LPRouter = await deployLPRouterContractOK();
    const [owner, user2] = await ethers.getSigners();

    const initialLiquidity = 1000;
    const allowance = initialLiquidity;
    const LP1tx = await LPRouter.createLP(tokenA, tokenB);
    const LP1Receipt = await LP1tx.wait();
    const LP1address = await getLPAddress(LP1Receipt);
    const LP1 = await ethers.getContractAt("LP", LP1address);

    const LP2tx = await LPRouter.createLP(tokenB, tokenC);
    const LP2Receipt = await LP2tx.wait();
    const LP2address = await getLPAddress(LP2Receipt);
    const LP2 = await ethers.getContractAt("LP", LP2address);

    const LPdetails = [
      [LP1, LP1address, tokenA, tokenB],
      [LP2, LP2address, tokenB, tokenC],
    ];

    for (const [LP, LPAddress, token1, token2] of LPdetails) {
      await token1.connect(owner).approve(LPAddress, allowance);
      await token2.connect(owner).approve(LPAddress, allowance);
      await LP.connect(owner).firstAddLiquidity(
        initialLiquidity,
        initialLiquidity
      );

      await token1.connect(user2).approve(LPAddress, allowance);
      await token2.connect(user2).approve(LPAddress, allowance);
    }

    const amount = 100;
    await tokenA.connect(owner).transfer(user2, amount);
    const expectedResult = 82; // dupa calcule :)
    const swapTx = await LPRouter.connect(user2).swap(tokenA, tokenC, amount);
    await swapTx.wait();
    const result = await tokenC.balanceOf(user2.address);

    expect(result).to.equal(Math.floor(expectedResult));
  });

  it("Should run dijkstra", async function () {
    LPRouterContract = await deployLPRouterContractOK();

    const { erc20Contract: tokenA } = await deployERC20ContractOK();
    const { erc20Contract: tokenB } = await deployERC20ContractOK();
    const { erc20Contract: tokenC } = await deployERC20ContractOK();

    await LPRouterContract.createLP(tokenA, tokenB);
    await LPRouterContract.createLP(tokenB, tokenC);

    const path = await LPRouterContract.dijkstra(tokenA, tokenC);
    expect(path).to.not.be.undefined;
  });

  it("Should run deijkstra and return a list", async function () {
    LPRouterContract = await deployLPRouterContractOK();

    const { erc20Contract: tokenA } = await deployERC20ContractOK();
    const { erc20Contract: tokenB } = await deployERC20ContractOK();
    const { erc20Contract: tokenC } = await deployERC20ContractOK();

    // console.log("Token A: ")
    // console.log(tokenA);
    // console.log("Token B: ")
    // console.log(tokenB);
    // console.log("Token C: ")
    // console.log(tokenC);

    await LPRouterContract.createLP(tokenA, tokenB);
    await LPRouterContract.createLP(tokenB, tokenC);

    const transaction = await LPRouterContract.dijkstra(tokenA, tokenC);

    const receipt = await transaction.wait();
    // console.log(receipt);

    // for (const log of receipt.logs) {
    //   console.log(log); // Afișează detaliile fiecărui log/event
    // }

    // print data from the path
    // console.log("path.data: " + path.data)

    // console.log(path)

    // expect(path).to.not.be.undefined;
  });
});
