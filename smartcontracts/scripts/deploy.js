const { ethers } = require("hardhat");

async function deploy() {
  const lpRouterFactory = await ethers.getContractFactory("LPRouter");
  const ethTokenFactory = await ethers.getContractFactory("EthTokenExchange");

  const lpRouter = await lpRouterFactory.deploy(ethers.ZeroAddress);
  const ethToken = await ethTokenFactory.deploy();

  console.log("LPRouter deployed to:", lpRouter.target);
  console.log("EthToken deployed to:", ethToken.target);
}

deploy()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
