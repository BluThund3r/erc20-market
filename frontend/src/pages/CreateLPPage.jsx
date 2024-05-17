import { Button } from "@mui/material";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getAllTokens } from "../services/lpRouterService";
import { addressRegex } from "../utils/utilRegexes";
import { createLP } from "../services/lpRouterService";
import { getRevertReason } from "../utils/getRevertReason";

function CreateLPPage() {
  const [formData, setFormData] = useState({
    fromTokenAddress: "",
    toTokenAddress: "",
    fromTokenAmount: 0,
    toTokenAmount: 0,
  });

  const [tokens, setTokens] = useState([]);

  useEffect(() => {
    fetchTokens();
  }, []);

  async function fetchTokens() {
    try {
      const tokens = await getAllTokens();
      console.log("Tokens:", tokens);
      setTokens(tokens);
    } catch (error) {
      console.error("Error fetching tokens:", error);
      toast.error("Error fetching tokens");
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.fromTokenAddress || !formData.toTokenAddress) {
      toast.error("Please select both tokens");
      return;
    }

    if (isNaN(formData.fromTokenAmount) || formData.fromTokenAmount <= 0) {
      toast.error("From amount must be a positive number");
      return;
    }

    if (isNaN(formData.toTokenAmount) || formData.toTokenAmount <= 0) {
      toast.error("To amount must be a positive number");
      return;
    }

    if (!addressRegex.test(formData.fromTokenAddress)) {
      toast.error("Invalid from token address");
      return;
    }

    if (!addressRegex.test(formData.toTokenAddress)) {
      toast.error("Invalid to token address");
      return;
    }

    try {
      await createLP(
        formData.fromTokenAddress,
        formData.toTokenAddress,
        formData.fromTokenAmount,
        formData.toTokenAmount
      );
      toast.success("LP created successfully");
    } catch (error) {
      console.error("Error creating LP:", error.message);
      toast.error(`Error creating LP \n(${getRevertReason(error.message)})`);
    }
  };

  const handleChange = (event) => {
    event.preventDefault();
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: name.includes("Amount") ? parseFloat(value) : value,
    });
  };

  return (
    <>
      <h1 className="text-3xl font-bold">Create LP</h1>
      <form className="mt-20 w-screen" onSubmit={handleSubmit}>
        <div className="flex w-screen gap-10 justify-center mt-5">
          <select
            className="p-2"
            onChange={handleChange}
            name="fromTokenAddress"
          >
            <option value="">From Token</option>
            {tokens.map((token) => (
              <option key={token.address} value={token.address}>
                {token.name} ({token.symbol})
              </option>
            ))}
          </select>
          <select className="p-2" onChange={handleChange} name="toTokenAddress">
            <option value="">To Token</option>
            {tokens.map((token) => (
              <option key={token.address} value={token.address}>
                {token.name} ({token.symbol})
              </option>
            ))}
          </select>
        </div>
        <div className="flex w-screen gap-10 justify-center mt-5">
          <input
            className="p-2"
            type="number"
            onChange={handleChange}
            placeholder="From Token Amount"
            name="fromTokenAmount"
          />
          <input
            className="p-2"
            type="number"
            onChange={handleChange}
            placeholder="To Token Amount"
            name="toTokenAmount"
          />
        </div>
        <div className="mt-10">
          <Button variant="contained" type="submit" onSubmit={handleSubmit}>
            Create LP
          </Button>
        </div>
      </form>
    </>
  );
}

export default CreateLPPage;
