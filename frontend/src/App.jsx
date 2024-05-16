import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import CreateTokenPage from "./pages/CreateTokenPage";
import { useSelector } from "react-redux";
import UserDeatils from "./pages/UserDetails";
import CreateLPPage from "./pages/CreateLPPage";
import SwapTokensPage from "./pages/SwapTokensPage";
import ConnectWalletPage from "./pages/ConnectWalletPage";
import BuyTokensPage from "./pages/BuyTokensPage";
import Navbar from "./components/navbar";

function App() {
  const userAddress = useSelector((state) => state.userDetails.address);
  console.log("user address", userAddress);

  const isUserConnected = userAddress !== "";
  return (
    <div className="App">
      <Router>
        {isUserConnected && <Navbar />}
        <Routes>
          <Route
            exact
            path="/"
            element={isUserConnected ? <UserDeatils /> : <ConnectWalletPage />}
          />
          <Route path="/createToken" element={<CreateTokenPage />} />
          <Route path="/createLP" element={<CreateLPPage />} />
          <Route path="/swap" element={<SwapTokensPage />} />
          <Route path="/buy" element={<BuyTokensPage />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
