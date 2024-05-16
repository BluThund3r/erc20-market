import { Button } from "@mui/material";
import { useState } from "react";
import { toast } from "react-toastify";

function CreateTokenPage() {
  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    supply: 0,
  });

  const handleSubmit = (event) => {
    event.preventDefault(); // Prevents the default form submission behavior
    // Call your function here, passing the form data as needed
    console.log("Form submitted with data:", formData);
    if (formData.supply <= 0) {
      toast.error("Supply must be greater than 0");
      return;
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
