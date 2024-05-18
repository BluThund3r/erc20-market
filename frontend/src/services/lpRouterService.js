import { BrowserProvider, ethers } from "ethers";
import { addresses } from "../contracts/contractsAddresses";
import LPRouter from "../contracts/abis/LPRouter.json";
import LP from "../contracts/abis/LP.json";
import ERC20 from "../contracts/abis/ERC20.json";

const lpRouterAbi = LPRouter.abi;
const lpAbi = LP.abi;
const erc20Abi = ERC20.abi;
const lpRouterAddress = addresses.lpRouterAddress;

export async function getTokensOfUser(provider) {
    const signer = await provider.getSigner();
    const lpRouter = new ethers.Contract(lpRouterAddress, lpRouterAbi, signer);
    const [tokenNames, tokenSymbols, balances] = await lpRouter
        .connect(signer)
        .myTokens();
    return tokenNames
        .map((name, index) => {
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

export async function getAllTokens() {
    const provider = new BrowserProvider(window.ethereum);
    const lpRouter = new ethers.Contract(lpRouterAddress, lpRouterAbi, provider);
    const [tokenNames, tokenSymbols, tokenAddresses] = await lpRouter.getTokens();
    return tokenNames.map((name, index) => {
        return {
            name,
            symbol: tokenSymbols[index],
            address: tokenAddresses[index],
        };
    });
}

export async function createLP(
    addressTokenA,
    addressTokenB,
    initialSupplyA,
    initialSupplyB
) {
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const lpRouter = new ethers.Contract(lpRouterAddress, lpRouterAbi, signer);
    const createLPTx = await lpRouter
        .connect(signer)
        .createLP(addressTokenA, addressTokenB);
    const createLPReceipt = await createLPTx.wait();

    console.log("createLPReceipt", createLPReceipt);

    const lpAddress = await lpRouter.getLP(addressTokenA, addressTokenB);
    const lpContract = new ethers.Contract(lpAddress, lpAbi, signer);

    const tokenAContract = new ethers.Contract(addressTokenA, erc20Abi, signer);
    const tokenBContract = new ethers.Contract(addressTokenB, erc20Abi, signer);

    const approveTokenATx = await tokenAContract
        .connect(signer)
        .approve(lpAddress, initialSupplyA);
    await approveTokenATx.wait();

    const approveTokenBTx = await tokenBContract
        .connect(signer)
        .approve(lpAddress, initialSupplyB);
    await approveTokenBTx.wait();

    const addInitialLiquidityTx = await lpContract
        .connect(signer)
        .firstAddLiquidity(initialSupplyA, initialSupplyB);
    await addInitialLiquidityTx.wait();
}

export async function getLPs() {
    const provider = new BrowserProvider(window.ethereum);
    const lpRouter = new ethers.Contract(lpRouterAddress, lpRouterAbi, provider);
    const [lps, tokenAaddresses, tokenBaddresses, tokenAnames, tokenBnames] = await lpRouter.getLPs();

    return lps.map((lp, index) => {
        return {
            address: lp,
            tokenAaddress: tokenAaddresses[index],
            tokenBaddress: tokenBaddresses[index],
            tokenAname: tokenAnames[index],
            tokenBname: tokenBnames[index],
        };
    });

}

export async function swap(lpAddress, fromToken, amountIn) {
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const lpRouter = new ethers.Contract(lpRouterAddress, lpRouterAbi, signer);
    const swapTx = await lpRouter.connect(signer).swap(lpAddress, amountIn);
    await swapTx.wait();
}