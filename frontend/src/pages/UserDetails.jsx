import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { BrowserProvider, ethers } from "ethers";

function UserDetails() {
  const [balance, setBalance] = useState(0);
  const userAddress = useSelector((state) => state.userDetails.address);

  async function getETHBalance() {
    if (window.ethereum) {
      const provider = new BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(userAddress);
      const ethBalance = ethers.formatEther(balance);
      setBalance(ethBalance);
    }
  }

  useEffect(() => {
    getETHBalance();
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
    </>
  );
}

export default UserDetails;
