const { ethers } = require("hardhat");

async function test() {
  console.log("STARTING TRANSACTION");

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  const lpRouter = await ethers.getContractAt("LPRouter", contractAddress);

  const [tokenNames, tokenSymbols, balances] = await lpRouter.getTokens();

  for (let i = 0; i < tokenNames.length; i++) {
    console.log(
      `Token Name: ${tokenNames[i]}, Symbol: ${tokenSymbols[i]}, Balance: ${balances[i]}`
    );
  }
}

test();
