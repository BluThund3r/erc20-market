import { useState, useEffect } from "react";
import { getLPs } from "../services/lpRouterService";
import { BrowserProvider, ethers } from "ethers";
import { Button } from "@mui/material";
// import { swap } from "../services/lpRouterService";



function SwapTokensPage() {
    const [LPs, setLPs] = useState([]);

    const [formData, setFormData] = useState({
        LP: "",
        fromToken: "",
        amountIn: 0,
    });

    async function fetchLPs() {
        const provider = new BrowserProvider(window.ethereum);
        const lps = await getLPs(provider);

        // remove duplicates from lps
        const uniqueLps = lps.filter((lp, index, self) => self.findIndex((t) => t.address === lp.address) === index);

        // remove 0x0 address
        const uniqueLpsNew = uniqueLps.filter((lp) => lp.address !== "0x0000000000000000000000000000000000000000");

        setLPs(uniqueLpsNew);
    }

    useEffect(() => {
        fetchLPs();
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();

        console.log("formData:", formData);

        try {
            await swap(
                formData.LP,

                formData.amountIn
            );
            toast.success("LP created successfully");
        } catch (error) {
            console.error("Error swaping:", error.message);
            toast.error(`Error swaping \n(${getRevertReason(error.message)})`);
        }
    };

    const handleChange = (event) => {
        event.preventDefault();

        console.log(event.target.name, " = ", event.target.value);
        console.log("formData:", formData);

        const { name, value } = event.target;

        setFormData({
            ...formData,
            [name]: value,
        });

    };

    return (
        <>
            <h1 className="text-3xl font-bold">SwapTokensPage LP:</h1>
            <form className="mt-20 w-screen" onSubmit={handleSubmit}>
                <div className="flex w-screen gap-10 justify-center mt-5">

                    <select
                        className="p-2"
                        onChange={handleChange}
                        name="LP"
                    >
                        <option value="">Choose the Liquidity Pool</option>
                        {LPs.map((lp) => (
                            <option key={lp.address} value={lp.address}>
                                Pair: {lp.tokenAname} to {lp.tokenBname}
                            </option>
                        ))}
                    </select>

                    {formData.LP && (
                        <select
                            className="p-2"
                            onChange={handleChange}
                            name="fromToken"
                        >
                            <option value="">From</option>
                            <option key={1} value={1}>
                                From: {LPs.find((lp) => lp.address === formData.LP).tokenAname}
                            </option>
                            <option key={2} value={2}>
                                From: {LPs.find((lp) => lp.address === formData.LP).tokenBname}
                            </option>
                        </select>
                    )}

                </div>
                <div className="flex w-screen gap-10 justify-center mt-5">
                    <input
                        className="p-2"
                        type="number"
                        onChange={handleChange}
                        placeholder="ammount"
                        name="amountIn"
                    />
                </div>
                <div className="mt-10">
                    <Button variant="contained" type="submit" onSubmit={handleSubmit}>
                        Swap
                    </Button>
                </div>
            </form>

            {/* {LPs.map((lp, index) => {
                return (
                    <form onSubmit={handleSubmit}>



                        <div>LP Address: {lp.address} {lp.tokenA} {lp.tokenB}</div>
                        <div> Swap tokenA for tokenB:</div>
                        <div className="flex w-screen gap-10 justify-center mt-5">
                            <input
                                className="p-2"
                                type="number"
                                onChange={handleChange}
                                placeholder="tokenA Amount"
                                name="tokenAAmount"
                            />
                        </div>
                        <div className="mt-10">
                            <Button variant="contained" type="submit" onSubmit={handleSubmit}>
                                Swap
                            </Button>
                        </div>
                    </form>

                );
            })} */}

        </>);


}

export default SwapTokensPage;