// Returns true if MetaMask (or any wallet) injected window.ethereum.
export function isMetaMaskInstalled() {
  return typeof window !== "undefined" && typeof window.ethereum !== "undefined";
}

// Asks MetaMask for permission to see the user's account.
// Returns the first account address, e.g. "0xAbC...123".
export async function connectWallet() {
  if (!isMetaMaskInstalled()) {
    throw new Error("METAMASK_NOT_INSTALLED");
  }

  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });

  return accounts[0];
}

// Turns "0x1234567890abcdef...cdef" into "0x1234...cdef" for display.
export function shortenAddress(address) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}