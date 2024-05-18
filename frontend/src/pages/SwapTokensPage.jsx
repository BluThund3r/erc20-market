import { useState, useEffect } from "react";
import { getLPs } from "../services/lpRouterService";
import { BrowserProvider, ethers } from "ethers";
import { Button } from "@mui/material";
// import { swap } from "../services/lpRouterService";



function SwapTokensPage() {
    const [LPs, setLPs] = useState([]);
    async function fetchLPs() {
        const provider = new BrowserProvider(window.ethereum);
        const lps = await getLPs(provider);

        // remove duplicates from lps
        const uniqueLps = lps.filter((lp, index, self) => self.findIndex((t) => t.address === lp.address) === index);

        setLPs(uniqueLps);
    }

    useEffect(() => {
        fetchLPs();
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            await swap(
                // formData.
            );
            toast.success("LP created successfully");
        } catch (error) {
            console.error("Error swaping:", error.message);
            toast.error(`Error swaping \n(${getRevertReason(error.message)})`);
        }
    };

    const handleChange = (event) => { return; };

    return (
        <>
            <div>SwapTokensPage LP:</div>
            <form onSubmit={handleSubmit}>

                <select
                    className="p-2"
                    onChange={handleChange}
                    name="LP"
                >
                    <option value="">Choose the Liquidity Pool</option>
                    {LPs.map((lp) => (
                        <option key={lp.address} value={lp.address}>
                            {lp.tokenA} to {lp.tokenB}
                        </option>
                    ))}
                </select>
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