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

    const [owner, user2, user3, user4, user5] = await ethers.getSigners();

    const erc20Contract = await ERC20.connect(owner).deploy(initialTokens);

    await erc20Contract.connect(owner).approve(user2.address, 1000);

    return { erc20Contract, owner, user2, user3, user4, user5 };
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
    it("Should fail to approve with an invalid address", async function () {
      const { erc20Contract, owner } = await loadFixture(deployContractOK);
      await expect(
        erc20Contract.connect(owner).approve("0x111111111", 1000)
      ).to.be.rejectedWith(
        "Method 'HardhatEthersProvider.resolveName' is not implemented" // This is a hardhat error
        // in the remix IDE, the error is "invalid address"
      );
    });

    it("Should fail to approve with a negative amount", async function () {
      const { erc20Contract, owner, user2 } = await loadFixture(
        deployContractOK
      );
      await expect(
        erc20Contract.connect(owner).approve(user2.address, -1)
      ).to.be.rejectedWith("value=-1");
    });

    it("Should fail due to uint overflow", async function () {
      const { erc20Contract, owner, user2 } = await loadFixture(
        deployContractOK
      );
      await expect(
        erc20Contract.connect(owner).approve(user2.address, 2 ** 256)
      ).to.be.rejectedWith("overflow");
    });

    it("Should pass and set the spendlimit to 100", async function () {
      const { erc20Contract, owner, user2 } = await loadFixture(
        deployContractOK
      );

      await erc20Contract.connect(owner).approve(user2.address, 100);

      expect(
        await erc20Contract.allowance(owner.address, user2.address)
      ).to.equal(100);
    });
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
