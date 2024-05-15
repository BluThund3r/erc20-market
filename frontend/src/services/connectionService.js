import { ethers } from "hardhat";

export async function connectUser() {
  if (window.ethereum) {
    console.log("Metamask is installed");
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log(accounts);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      return provider;
    } catch (e) {
      console.error(e);
    }
  } else console.log("Metamask is not installed");

  return null;
}
