const fs = require("fs");
const path = require("path");

const contracts = [
  "LPRouter",
  "EthTokenExchange",
  "IERC20",
  "ERC20",
  "LP",
  "LPRouter",
  "MinPath",
  "Queue",
]; // Add your contract names here

contracts.forEach((contractName) => {
  const artifactPath = path.join(
    __dirname,
    `../artifacts/contracts/${contractName}.sol/${contractName}.json`
  );
  const destinationPath = path.join(
    __dirname,
    `../../frontend/src/contracts/abis/${contractName}.json`
  );

  if (!fs.existsSync(artifactPath)) {
    console.log(`Artifact for ${contractName} not found at ${artifactPath}`);
    return;
  }

  fs.copyFileSync(artifactPath, destinationPath);
  console.log(
    `Copied ABI for ${contractName} to frontend/src/contracts/abis/${contractName}.json`
  );
});
