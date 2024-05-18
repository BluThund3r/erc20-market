import { Button } from "@mui/material";
import { useState } from "react";
import { toast } from "react-toastify";
import { createToken } from "../services/lpRouterService";

function CreateTokenPage() {
  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    supply: 0,
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log("Form submitted with data:", formData);
    if (isNaN(formData.supply)) {
      toast.error("Supply must be a number");
      return;
    }

    if (formData.name.length === 0) {
      toast.error("Token name cannot be empty");
      return;
    }

    if (formData.symbol.length === 0) {
      toast.error("Token symbol cannot be empty");
      return;
    }

    if (formData.supply <= 0) {
      toast.error("Supply must be greater than 0");
      return;
    }

    try {
      await createToken(formData.name, formData.symbol, formData.supply);
      toast.success("Token created successfully");
    } catch (error) {
      console.error("Error creating token:", error);
      toast.error("Error creating token");
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: name === "supply" ? parseFloat(value) : value,
    });
  };

  return (
    <>
      <h1 className="text-3xl font-bold">Create ERC20 Token</h1>
      <form className="mt-20" onSubmit={handleSubmit}>
        <div className="mt-4">
          <label className="text-xl font-bold mr-3" htmlFor="name">
            Token Name
          </label>
          <input
            className="border border-gray-300 p-2 mt-2"
            type="text"
            id="name"
            name="name"
            onChange={handleChange}
          />
        </div>
        <div className="mt-4">
          <label className="text-xl font-bold mr-3" htmlFor="symbol">
            Token Symbol
          </label>
          <input
            className="border border-gray-300 p-2 mt-2"
            type="text"
            id="symbol"
            name="symbol"
            onChange={handleChange}
          />
        </div>
        <div className="mt-4">
          <label className="text-xl font-bold mr-3" htmlFor="supply">
            Token Supply
          </label>
          <input
            className="border border-gray-300 p-2 mt-2"
            type="number"
            id="supply"
            name="supply"
            onChange={handleChange}
          />
        </div>
        <div className="mt-4">
          <Button variant="contained" type="submit">
            Create Token
          </Button>
        </div>
      </form>
    </>
  );
}

export default CreateTokenPage;
