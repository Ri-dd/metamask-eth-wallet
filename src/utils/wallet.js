import { ethers } from "ethers";

// Sepolia's chain ID as a BigInt (the "n" at the end makes it a BigInt).
export const SEPOLIA_CHAIN_ID = 11155111n;

// Friendly names for a few well-known networks.
const NETWORK_NAMES = {
  1: "Ethereum Mainnet",
  11155111: "Sepolia Testnet",
  560048: "Hoodi Testnet",
  137: "Polygon",
  56: "BNB Smart Chain",
  10: "Optimism",
  42161: "Arbitrum One",
  8453: "Base",
};

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
// Checks whether this site is ALREADY approved. Never shows a popup.
// Returns the first account address, or null if not approved yet.
export async function getConnectedAccount() {
  if (!isMetaMaskInstalled()) {
    return null;
  }

  const accounts = await window.ethereum.request({
    method: "eth_accounts",
  });

  return accounts.length > 0 ? accounts[0] : null;
}
// Reads the ETH balance of an address. Returns a string like "0.1".
export async function getBalance(address) {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const balanceInWei = await provider.getBalance(address);
  return ethers.formatEther(balanceInWei);
}

// Finds out which network MetaMask is currently using.
export async function getNetworkInfo() {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const network = await provider.getNetwork();
  const chainId = network.chainId; // a BigInt, e.g. 11155111n

  return {
    chainId,
    name: NETWORK_NAMES[Number(chainId)] || `Unknown network (chain ID ${chainId})`,
    isSepolia: chainId === SEPOLIA_CHAIN_ID,
  };
}

// Turns "0x1234567890abcdef...cdef" into "0x1234...cdef" for display.
export function shortenAddress(address) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}