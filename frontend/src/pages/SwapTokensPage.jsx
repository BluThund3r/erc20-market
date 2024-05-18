import { useState, useEffect } from "react";
import { getLPs } from "../services/lpRouterService";
import { BrowserProvider, ethers } from "ethers";

function SwapTokensPage() {
    const [LPs, setLPs] = useState([]);
    async function fetchLPs() {
        const provider = new BrowserProvider(window.ethereum);
        const lps = await getLPs(provider);
        setLPs(lps);
    }

    useEffect(() => {
        fetchLPs();
    }, []);

    return (
        <>
            <div>SwapTokensPage LP:</div>
            {LPs.map((lp, index) => {
                return (
                    <div key={index}>
                        <div>LP Address: {lp.address} {lp.tokenA} {lp.tokenB}</div>
                        <div> Swap tokenA for tokenB:</div>
                        <div> ammount:</div>
                        <input type="number" />
                        {/* <div className="mt-10">
                            <Button variant="contained" type="submit" onSubmit={handleSubmit}>
                                Create LP
                            </Button>
                        </div> */}
                    </div>
                );
            })}

        </>);


}

export default SwapTokensPage;