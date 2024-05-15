import WalletContext from "./WalletContext";
import { connectUser } from "../services/connectionService";
import { useState } from "react";

export function WalletProvider({ children }) {
  const [connected, setConnected] = useState(false);
  const [provider, setProvider] = useState(null);

  const connect = async () => {
    const provider = await connectUser();
    setProvider(provider);
    setConnected(true);
  };

  return (
    <WalletContext.Provider value={{ provider, connected, connect }}>
      {children}
    </WalletContext.Provider>
  );
}
