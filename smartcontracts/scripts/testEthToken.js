const { ethers } = require("hardhat");

async function test() {
  console.log("STARTING TRANSACTION");

  const [owner] = await ethers.getSigners();

  const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

  const ethToken = await ethers.getContractAt(
    "EthTokenExchange",
    contractAddress
  );

  const tx = {
    to: contractAddress,
    value: ethers.parseEther("1"),
  };

  const trans = await owner.sendTransaction(tx);
  const receipt = await trans.wait();

  console.log("ETH sent", receipt.logs);

  const trans2 = await ethToken
    .connect(owner)
    .token_to_ETH(ethers.parseEther("1"));

  const receipt2 = await trans2.wait();
  console.log("ETH received", receipt2.logs);
}

test();
