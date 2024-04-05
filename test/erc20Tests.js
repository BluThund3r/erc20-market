const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");

describe("ERC20", function () {
  async function deployContract(initialTokens) {
    const ERC20 = await ethers.getContractFactory("ERC20");
    const erc20Contract = await ERC20.deploy(initialTokens);

    return { erc20Contract };
  }

  async function deployContractOK() {
    const initialTokens = 10 ** 6;
    const ERC20 = await ethers.getContractFactory("ERC20");
    const erc20Contract = await ERC20.deploy(initialTokens);
    console.log(`Deployed contract at address: ${erc20Contract.address}`);
    return { erc20Contract };
  }

  describe("Deployment (constructor)", function () {
    it("Should fail to deploy with a negative initial supply", async function () {
      const error = await deployContract(-1).catch((e) => e);
      expect(error.message).to.include("value=-1");
      expect(error.message).to.include("value out-of-bounds");
    });

    it("Should fail to deploy with supply of 0", async function () {
      await expect(deployContract(0)).to.be.rejectedWith(
        "Initial supply should be a positive integer"
      );
    });

    it("Should fail to deploy with a an initial supply >= 2^256", async function () {
      const error = await deployContract(2 ** 256).catch((e) => e);
      expect(error.message).to.include("overflow");
    });

    it("Should deploy the contract successfully and test the total supply to be 1M", async function () {
      const { erc20Contract } = await loadFixture(deployContractOK); // loadFixture saves a snapshot of the blockchain for efficiency
      expect(await erc20Contract.totalSupply()).to.equal(10 ** 6);
    });
  });

  describe("Approve function", function () {
    //! TODO: Add tests
  });

  describe("Transfer function", function () {
    //! TODO: Add tests
  });

  describe("Allowance function", function () {
    //! TODO: Add tests
  });

  describe("TransferFrom function", function () {
    //! TODO: Add tests
  });
});
