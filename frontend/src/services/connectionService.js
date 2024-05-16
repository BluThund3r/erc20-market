export async function connectUser() {
  if (window.ethereum) {
    console.log("Metamask is installed");
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("Accounts", accounts);
      return accounts[0]; 
    } catch (e) {
      console.error(e);
    }
  } else console.log("Metamask is not installed");

  return null;
}
