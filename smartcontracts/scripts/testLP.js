const { ethers } = require("hardhat");

async function test() {
  console.log("STARTING TRANSACTION");

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  const lpRouter = await ethers.getContractAt("LPRouter", contractAddress);

  const lpAddress = await lpRouter.getLP(
    "0xB7A5bd0345EF1Cc5E66bf61BdeC17D2461fBd968",
    "0xeEBe00Ac0756308ac4AaBfD76c05c4F3088B8883"
  );

  console.log("LP Address:", lpAddress);
}

test();
