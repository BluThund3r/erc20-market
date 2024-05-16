import { BrowserProvider, ethers } from "ethers";
import { addresses } from "../contracts/contractsAddresses";
import LPRouter from "../contracts/abis/LPRouter.json";

const lpRouterAbi = LPRouter.abi;
const lpRouterAddress = addresses.lpRouterAddress;

export async function getTokensOfUser(provider) {
  const signer = await provider.getSigner();
  const lpRouter = new ethers.Contract(lpRouterAddress, lpRouterAbi, signer);
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

export async function createToken(tokenName, tokenSymbol, tokenSupply) {
  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const lpRouter = new ethers.Contract(lpRouterAddress, lpRouterAbi, signer);
  const createTokenTx = await lpRouter.createToken(
    tokenName,
    tokenSymbol,
    tokenSupply
  );
  const createTokenReceipt = await createTokenTx.wait();

  console.log("createTokenReceipt", createTokenReceipt);
}
