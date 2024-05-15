import React from "react";
import { Button } from "@mui/material";
import "../style.css";
import { useDispatch } from "react-redux";
import { connectUser } from "../services/connectionService";
import { setWalletProvider } from "../state/walletProviderSlice";

function ConnectWalletPage() {
  const dispatch = useDispatch();

  return (
    <div className="flex flex-col justify-center items-center gap-5 h-screen">
      <h1 className="text-3xl font-bold">
        You have to connect your wallet first
      </h1>
      <h3>Click on the button to connect to your MetaMask Wallet</h3>
      <Button
        variant="contained"
        color="primary"
        className="w-fit"
        onClick={async () => {
          const provider = await connectUser();
          if (provider) dispatch(setWalletProvider(provider));
        }}
      >
        Connect
      </Button>
    </div>
  );
}

export default ConnectWalletPage;
