import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { BrowserProvider, ethers } from "ethers";
import { getTokensOfUser } from "../services/lpRouterService";

function UserDetails() {
  const [balance, setBalance] = useState(0);
  const userAddress = useSelector((state) => state.userDetails.address);
  const [userTokens, setUserTokens] = useState([]);

  async function getETHBalance() {
    if (window.ethereum) {
      const provider = new BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(userAddress);
      const ethBalance = ethers.formatEther(balance);
      setBalance(ethBalance);
    }
  }

  async function fetchUserTokens() {
    const provider = new BrowserProvider(window.ethereum);
    const tokens = await getTokensOfUser(provider);
    setUserTokens(tokens);
  }

  useEffect(() => {
    getETHBalance();
    fetchUserTokens();
  }, []);

  return (
    <>
      <h1 className="font-bold text-3xl">User Details</h1>
      <div className="mt-4">
        <p className="text-xl">
          <span className="font-bold">Your address is:</span> {userAddress}
        </p>
        <p className="text-xl">
          <span className="font-bold">ETH Balance:</span> {balance}
        </p>
      </div>

      <div className="flex flex-col items-center mt-10">
        <h2 className="text-2xl font-bold">Your Tokens</h2>
        {userTokens.map((token, index) => {
          if (token.balance === 0) return null;
          return (
            <div
              key={index}
              className="flex flex-col items-center border border-gray-300 p-4 mt-4"
            >
              <p className="text-xl">
                <span className="font-bold">Token Name:</span> {token.name}
              </p>
              <p className="text-xl">
                <span className="font-bold">Token Symbol:</span> {token.symbol}
              </p>
              <p className="text-xl">
                <span className="font-bold">Token Balance:</span>{" "}
                {token.balance}
              </p>
            </div>
          );
        })}
        {userTokens.length === 0 && (
          <p className="text-xl text-red-700">No tokens found</p>
        )}
      </div>
    </>
  );
}

export default UserDetails;
