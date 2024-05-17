const { ethers } = require("hardhat");

async function test() {
  console.log("STARTING TRANSACTION");

  const [owner] = await ethers.getSigners();

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  const lpRouter = await ethers.getContractAt("LPRouter", contractAddress);

  const tokenTx = await lpRouter
    .connect(owner)
    .createToken(1000, "TestToken", "TT");
  const tokenReceipt = await tokenTx.wait();

  console.log(tokenReceipt);

  const [tokenNames, tokenSymbols, balances] = await lpRouter
    .connect(owner)
    .myTokens();

  for (let i = 0; i < tokenNames.length; i++) {
    console.log(
      `Token Name: ${tokenNames[i]}, Symbol: ${tokenSymbols[i]}, Balance: ${balances[i]}`
    );
  }
}

test();
