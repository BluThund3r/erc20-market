import { Button } from "@mui/material";
import "../index.css";
import "../style.css";
import { useDispatch } from "react-redux";
import { connectUser } from "../services/connectionService";
import { setUserAddress } from "../state/userDetailsSlice";

function ConnectWalletPage() {
  const dispatch = useDispatch();

  return (
    <div className="flex flex-col justify-center items-center gap-5 h-screen ">
      <h1 className="text-3xl font-bold text-red-700">
        You have to connect your wallet first
      </h1>
      <h3 className="font-bold">
        Click on the button to connect to your MetaMask Wallet
      </h3>
      <Button
        variant="contained"
        color="primary"
        className="w-fit"
        onClick={async () => {
          const address = await connectUser();
          if (address) dispatch(setUserAddress({ address }));
        }}
      >
        Connect
      </Button>
    </div>
  );
}

export default ConnectWalletPage;
