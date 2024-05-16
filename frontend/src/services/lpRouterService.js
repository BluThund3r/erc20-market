import { ethers } from "ethers";
import { addresses } from "../contracts/contractsAddresses";
import LPRouter from "../contracts/abis/LPRouter.json";

const lpRouterAbi = LPRouter.abi;

export async function getTokensOfUser(provider) {
  const signer = await provider.getSigner();
  const contractAddress = addresses.lpRouterAddress;
  const lpRouter = new ethers.Contract(contractAddress, lpRouterAbi, signer);
  const tokensDetails = await lpRouter.myTokens();
  return tokensDetails.map((tokenDetails) => {
    const [tokenName, tokenSymbol, tokenBalance] = tokenDetails.split("%");
    return {
      name: tokenName,
      symbol: tokenSymbol,
      balance: parseFloat(tokenBalance),
    };
  });
}
