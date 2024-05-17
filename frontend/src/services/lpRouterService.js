import { BrowserProvider, ethers } from "ethers";
import { addresses } from "../contracts/contractsAddresses";
import LPRouter from "../contracts/abis/LPRouter.json";

const lpRouterAbi = LPRouter.abi;
const lpRouterAddress = addresses.lpRouterAddress;

export async function getTokensOfUser(provider) {
  const signer = await provider.getSigner();
  const lpRouter = new ethers.Contract(lpRouterAddress, lpRouterAbi, signer);
  const [tokenNames, tokenSymbols, balances] = await lpRouter
    .connect(signer)
    .myTokens();
  return tokenNames
    .map((name, index) => {
      console.log(
        "name",
        name,
        "symbol",
        tokenSymbols[index],
        "balance",
        balances[index]
      );
      return {
        name,
        symbol: tokenSymbols[index],
        balance: parseFloat(balances[index]),
      };
    })
    .filter((token) => token.balance > 0);
}

export async function createToken(tokenName, tokenSymbol, tokenSupply) {
  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const lpRouter = new ethers.Contract(lpRouterAddress, lpRouterAbi, signer);
  const createTokenTx = await lpRouter
    .connect(signer)
    .createToken(tokenSupply, tokenName, tokenSymbol);
  const createTokenReceipt = await createTokenTx.wait();

  console.log("createTokenReceipt", createTokenReceipt);
}
