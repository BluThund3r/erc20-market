const fs = require("fs");
const path = require("path");

const contracts = ["LPRouter", "EthTokenExchange"]; // Add your contract names here

contracts.forEach((contractName) => {
  const artifactPath = path.join(
    __dirname,
    `../artifacts/contracts/${contractName}.sol/${contractName}.json`
  );
  const destinationPath = path.join(
    __dirname,
    `../../frontend/src/contracts/abis/${contractName}.json`
  );

  fs.copyFileSync(artifactPath, destinationPath);
  console.log(
    `Copied ABI for ${contractName} to frontend/src/contracts/abis/${contractName}.json`
  );
});
