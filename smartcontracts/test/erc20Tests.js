const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");

describe("ERC20", function () {
  async function deployContract(initialTokens, name, symbol) {
    const ERC20 = await ethers.getContractFactory("ERC20");
    const erc20Contract = await ERC20.deploy(
      initialTokens,
      name,
      symbol,
      false
    );

    return { erc20Contract };
  }

  async function deployContractOK() {
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

  describe("Deployment (constructor)", function () {
    it("Should fail to deploy with a negative initial supply", async function () {
      const error = await deployContract(-1, "TestToken", "TT").catch((e) => e);
      expect(error.message).to.include("value=-1");
      expect(error.message).to.include("value out-of-bounds");
    });

    it("Should fail to deploy with supply of 0", async function () {
      await expect(deployContract(0, "TestToken", "TT")).to.be.rejectedWith(
        "Initial supply should be a positive integer"
      );
    });

    it("Should fail to deploy with a an initial supply >= 2^256", async function () {
      const error = await deployContract(2 ** 256, "TestToken", "TT").catch(
        (e) => e
      );
      expect(error.message).to.include("overflow");
    });

    it("Should deploy the contract successfully and test the total supply to be 1M", async function () {
      const { erc20Contract } = await loadFixture(deployContractOK); // loadFixture saves a snapshot of the blockchain for efficiency
      expect(await erc20Contract.totalSupply()).to.equal(
        10 ** 6,
        "TestToken",
        "TT"
      );
    });

    it("Should should fail to deploy with an empty token name", async function () {
      await expect(deployContract(10 ** 6, "", "TT")).to.be.rejectedWith(
        "Name should not be empty"
      );
    });

    it("Should should fail to deploy with an empty token symbol", async function () {
      await expect(deployContract(10 ** 6, "TestToken", "")).to.be.rejectedWith(
        "Symbol should not be empty"
      );
    });
  });

  describe("approve function", function () {
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

  describe("transfer function", function () {
    it("Should fail to transfer to an invalid address", async function () {
      const { erc20Contract, owner } = await loadFixture(deployContractOK);
      await expect(
        erc20Contract.connect(owner).transfer("0x111111111", 10)
      ).to.be.rejectedWith(
        "Method 'HardhatEthersProvider.resolveName' is not implemented" // This is a hardhat error
        // in the remix IDE, the error is "invalid address"
      );
    });

    it("Should fail to transfer negative amount of tokens", async function () {
      const { erc20Contract, owner, user2 } = await loadFixture(
        deployContractOK
      );
      await expect(
        erc20Contract.connect(owner).transfer(user2.address, -1)
      ).to.be.rejectedWith("value=-1");
    });

    it("Should pass to transfer valid amount of tokens to valid address", async function () {
      const { erc20Contract, owner, user2 } = await loadFixture(
        deployContractOK
      );
      await erc20Contract.connect(owner).transfer(user2.address, 100);
      expect(await erc20Contract.balanceOf(user2.address)).to.equal(100);
    });

    it("Should fail to transfer an amount of tokens greater than the balance", async function () {
      const { erc20Contract, owner, user2 } = await loadFixture(
        deployContractOK
      );
      await expect(
        erc20Contract.connect(owner).transfer(user2.address, 10 ** 6 + 1)
      ).to.be.rejectedWith("Insufficient funds");
    });

    it("Should fail to transfer an amount of tokens that causes overflow", async function () {
      const { erc20Contract, owner, user2 } = await loadFixture(
        deployContractOK
      );
      await expect(
        erc20Contract.connect(owner).transfer(user2.address, 2 ** 256)
      ).to.be.rejectedWith("overflow");
    });
  });

  describe("balanceOf function", function () {
    it("Should fail to return the balance for an invalid address", async function () {
      const { erc20Contract } = await loadFixture(deployContractOK);
      await expect(erc20Contract.balanceOf("0x111111111")).to.be.rejectedWith(
        "Method 'HardhatEthersProvider.resolveName' is not implemented" // This is a hardhat error
        // in the remix IDE, the error is "invalid address"
      );
    });

    it("Should return 0 for an address that has not yet been added to the balances mapping", async function () {
      const { erc20Contract, user3 } = await loadFixture(deployContractOK);
      expect(await erc20Contract.balanceOf(user3.address)).to.equal(0);
    });

    it("Should return the correct balance associated with an address added in the mapping", async function () {
      const { erc20Contract, owner } = await loadFixture(deployContractOK);
      expect(await erc20Contract.balanceOf(owner.address)).to.equal(10 ** 6);
    });
  });

  describe("allowance function", function () {
    it("Should fail to check allowance with an invalid tokenOwner address", async function () {
      const { erc20Contract, user2 } = await loadFixture(deployContractOK);
      await expect(
        erc20Contract.allowance("0x111111111", user2.address)
      ).to.be.rejectedWith(
        "Method 'HardhatEthersProvider.resolveName' is not implemented"
      );
    });

    it("Should fail to check allowance with an invalid spender address", async function () {
      const { erc20Contract, owner } = await loadFixture(deployContractOK);
      await expect(
        erc20Contract.allowance(owner.address, "0x111111111")
      ).to.be.rejectedWith(
        "Method 'HardhatEthersProvider.resolveName' is not implemented"
      );
    });

    it("Should return 0 if the tokenOwner address is not in the outer mapping", async function () {
      const { erc20Contract, user3, user2 } = await loadFixture(
        deployContractOK
      );
      expect(
        await erc20Contract.allowance(user3.address, user2.address)
      ).to.equal(0);
    });

    it("Should return 0 if the spender address is not in the inner mapping", async function () {
      const { erc20Contract, owner, user3 } = await loadFixture(
        deployContractOK
      );
      expect(
        await erc20Contract.allowance(owner.address, user3.address)
      ).to.equal(0);
    });

    it("Should return the correct spendlimit ammount approved by tokenOwner for spender", async function () {
      const { erc20Contract, owner, user2 } = await loadFixture(
        deployContractOK
      );
      const approvedAmount = 1000;
      await erc20Contract.connect(owner).approve(user2.address, approvedAmount);
      expect(
        await erc20Contract.allowance(owner.address, user2.address)
      ).to.equal(approvedAmount);
    });
  });

  describe("transferFrom function", function () {
    it("Should fail if the 'from' address is invalid", async function () {
      const { erc20Contract, user2, user3 } = await loadFixture(
        deployContractOK
      );
      await expect(
        erc20Contract
          .connect(user2)
          .transferFrom("0x111111111", user3.address, 100)
      ).to.be.rejectedWith(
        "Method 'HardhatEthersProvider.resolveName' is not implemented"
      );
    });

    it("Should fail if the 'to' address is invalid", async function () {
      const { erc20Contract, owner, user2 } = await loadFixture(
        deployContractOK
      );
      await expect(
        erc20Contract
          .connect(user2)
          .transferFrom(owner.address, "0x111111111", 100)
      ).to.be.rejectedWith(
        "Method 'HardhatEthersProvider.resolveName' is not implemented"
      );
    });

    it("Should fail when trying to transfer a negative amount of tokens", async function () {
      const { erc20Contract, owner, user2, user3 } = await loadFixture(
        deployContractOK
      );
      await erc20Contract.connect(owner).approve(user2.address, 100);
      await expect(
        erc20Contract
          .connect(user2)
          .transferFrom(owner.address, user3.address, -1)
      ).to.be.rejectedWith("value=-1");
    });

    it("Should transfer the amount of money successfully", async function () {
      const { erc20Contract, owner, user2, user3 } = await loadFixture(
        deployContractOK
      );
      await erc20Contract.connect(owner).approve(user2.address, 100);
      await erc20Contract
        .connect(user2)
        .transferFrom(owner.address, user3.address, 100);
      expect(await erc20Contract.balanceOf(user3.address)).to.equal(100);
    });

    it("Should fail if the caller does not have sufficient allowance", async function () {
      const { erc20Contract, owner, user2, user3 } = await loadFixture(
        deployContractOK
      );
      await erc20Contract.connect(owner).approve(user2.address, 100);
      await expect(
        erc20Contract
          .connect(user2)
          .transferFrom(owner.address, user3.address, 101)
      ).to.be.rejectedWith("Insufficient allowance");
    });

    it("Should fail if the amount transfered is greater than the balance of the tokenOwner", async function () {
      const { erc20Contract, owner, user2, user3 } = await loadFixture(
        deployContractOK
      );
      await erc20Contract.connect(owner).approve(user2.address, 10 ** 10);
      await expect(
        erc20Contract
          .connect(user2)
          .transferFrom(owner.address, user3.address, 10 ** 6 + 1)
      ).to.be.rejectedWith("Insufficient funds");
    });

    it("Should fail if the amount transfered causes an overflow", async function () {
      const { erc20Contract, owner, user2, user3 } = await loadFixture(
        deployContractOK
      );
      await erc20Contract.connect(owner).approve(user2.address, 10 ** 6);
      await expect(
        erc20Contract
          .connect(user2)
          .transferFrom(owner.address, user3.address, 2 ** 256)
      ).to.be.rejectedWith("overflow");
    });
  });
});
