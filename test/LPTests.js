const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LP Tests", function () {
  async function deployContract(tokenA, tokenB) {
    const LP = await ethers.getContractFactory("LP");
    const LPContract = await LP.deploy(tokenA, tokenB);
    return LPContract; // Directly return the deployed contract
  }

  async function deployERC20ContractOK(
    initialTokens = 10 ** 6,
    name = "TestToken",
    symbol = "TT"
  ) {
    const ERC20 = await ethers.getContractFactory("ERC20");

    const [owner, user2, user3, user4, user5] = await ethers.getSigners();

    const erc20Contract = await ERC20.connect(owner).deploy(
      initialTokens,
      name,
      symbol
    );

    return { erc20Contract, owner, user2, user3, user4, user5 };
  }

  async function deployERC20AndLP(
    firstTokenInfo = {
      initialTokens: 10 ** 6,
      name: "TestTokenA",
      symbol: "TTA",
    },
    secondTokenInfo = {
      initialTokens: 10 ** 6,
      name: "TestTokenB",
      symbol: "TTB",
    }
  ) {
    const {
      erc20Contract: tokenA,
      owner,
      user2,
      user3,
      user4,
      user5,
    } = await deployERC20ContractOK();
    const { erc20Contract: tokenB } = await deployERC20ContractOK();

    const LP = await deployContract(tokenA, tokenB);

    return { LP, tokenA, tokenB, owner, user2, user3, user4, user5 };
  }

  async function approveAndFirstAddLiquidity(
    contract1,
    contract2,
    liquidityPoolContract,
    amount1,
    amount2
  ) {
    await contract1.approve(liquidityPoolContract.target, amount1);
    await contract2.approve(liquidityPoolContract.target, amount2);
    await liquidityPoolContract.firstAddLiquidity(amount1, amount2);
  }

  async function approveAndAddLiquidity(
    contract1,
    contract2,
    liquidityPoolContract,
    amount1,
    amount2
  ) {
    await contract1.approve(liquidityPoolContract.target, amount1);
    await contract2.approve(liquidityPoolContract.target, amount2);
    await liquidityPoolContract.addLiquidity(amount1);
  }

  it("Should deploy LP contract", async function () {
    const { LP } = await deployERC20AndLP();

    // Validate that the contracts have been deployed
    expect(LP).to.not.be.undefined;
  });

  it("Should add liquidity for first time", async function () {
    const { LP, tokenA, tokenB } = await deployERC20AndLP();

    const amountA = 1000;
    const amountB = 1000;

    await approveAndFirstAddLiquidity(tokenA, tokenB, LP, amountA, amountB);

    expect(await tokenA.balanceOf(LP.target)).to.equal(1000);
    expect(await tokenB.balanceOf(LP.target)).to.equal(1000);
  });

  it("Should add more liquidity", async function () {
    const { LP, tokenA, tokenB } = await deployERC20AndLP();

    const amountA = 500;
    const amountB = 1000;
    await approveAndFirstAddLiquidity(tokenA, tokenB, LP, amountA, amountB);

    const amount = 1000;
    await approveAndAddLiquidity(
      tokenA,
      tokenB,
      LP,
      amount,
      LP.getAmountBNecesary(amount)
    );

    expect(await tokenA.balanceOf(LP.target)).to.equal(1500);
    expect(await tokenB.balanceOf(LP.target)).to.equal(3000);
  });

  it("Should remove liquidity", async function () {
    const { LP, tokenA, tokenB } = await deployERC20AndLP();

    const amountA = 500;
    const amountB = 1000;
    await approveAndFirstAddLiquidity(tokenA, tokenB, LP, amountA, amountB);

    const amount = 1000;
    await approveAndAddLiquidity(
      tokenA,
      tokenB,
      LP,
      amount,
      LP.getAmountBNecesary(amount)
    );

    await LP.removeLiquidity(amount);

    expect(await tokenA.balanceOf(LP.target)).to.equal(500);
    expect(await tokenB.balanceOf(LP.target)).to.equal(1000);
  });

  it("Should have a specific price 1", async function () {
    const { LP, tokenA, tokenB } = await deployERC20AndLP();

    const amountA = 1000;
    const amountB = 1000;
    await approveAndFirstAddLiquidity(tokenA, tokenB, LP, amountA, amountB);

    expect(await LP.getPrice()).to.equal(1 * 1e9);
  });

  it("Should have a specific price 50", async function () {
    const { LP, tokenA, tokenB } = await deployERC20AndLP();

    const amountA = 1000;
    const amountB = 50000;
    await approveAndFirstAddLiquidity(tokenA, tokenB, LP, amountA, amountB);

    expect(await LP.getPrice()).to.equal(50 * 1e9);
  });

  it("Should getReturn return corect amount", async function () {
    const { LP, tokenA, tokenB } = await deployERC20AndLP();

    const amountA = 1000;
    const amountB = 1000;
    await approveAndFirstAddLiquidity(tokenA, tokenB, LP, amountA, amountB);

    const amount = 500;
    expect(await LP.getReturn(tokenA, amount)).to.equal(333);
  });

  it("Shoud swap tokens", async function () {
    const { LP, tokenA, tokenB } = await deployERC20AndLP();

    const amountA = 1000;
    const amountB = 1000;
    await approveAndFirstAddLiquidity(tokenA, tokenB, LP, amountA, amountB);

    const amount = 100;
    await tokenA.approve(LP.target, amount);
    await LP.swap(tokenA, amount);

    expect(await tokenA.balanceOf(LP.target)).to.equal(1100);
    expect(await tokenB.balanceOf(LP.target)).to.equal(910);
  });

  // it("Should not allow another user to remove liquidity", async function () {
  //     const { erc20Contract: tokenA } = await deployERC20ContractOK();
  //     const { erc20Contract: tokenB } = await deployERC20ContractOK();

  //     const LP = await deployContract(tokenA, tokenB);

  //     const amountA = 500;
  //     const amountB = 1000;

  //     await tokenA.approve(LP.target, amountA);
  //     await tokenB.approve(LP.target, amountB);

  //     await LP.firstAddLiquidity(amountA, amountB);

  //     const [user2, user3, user4, user5, user6] = await ethers.getSigners();

  //     const amount = 100;

  //     await LP.connect(user6).removeLiquidity(amount);

  //     // This should fail

  //     const balanceAuser = await tokenA.balanceOf(user6.address);

  //     console.log(balanceAuser.toString());

  //     // expect balanceAuser to be 0
  //     expect(balanceAuser).to.equal(0);

  // });
});
