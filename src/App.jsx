import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import WalletInfo from "./components/WalletInfo";
import {
  connectWallet,
  getBalance,
  getConnectedAccount,
  getNetworkInfo,
  isMetaMaskInstalled,
} from "./utils/wallet";

// Remembers that the user clicked "Disconnect Wallet" (survives page refresh).
const DISCONNECT_FLAG = "walletDisconnected";

function App() {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [network, setNetwork] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Loads the network and the balance for an address.
  async function loadWalletData(address) {
    try {
      setIsLoading(true);
      const networkInfo = await getNetworkInfo();
      setNetwork(networkInfo);

      const result = await getBalance(address);
      setBalance(result);
    } catch (err) {
      setError("Could not load wallet data: " + (err.message || "unknown error"));
    } finally {
      setIsLoading(false);
    }
  }

  // Runs once when the page loads: restore the connection if already approved.
  useEffect(() => {
    async function restoreConnection() {
      if (localStorage.getItem(DISCONNECT_FLAG) === "true") {
        return; // the user disconnected on purpose, so don't reconnect
      }

      try {
        const address = await getConnectedAccount();
        if (address) {
          setAccount(address);
          await loadWalletData(address);
        }
      } catch (err) {
        console.error("Could not restore connection:", err);
      }
    }

    restoreConnection();
  }, []);

  async function handleConnect() {
    setError("");

    if (!isMetaMaskInstalled()) {
      setError("MetaMask is not installed. Please install it to continue.");
      return;
    }

    try {
      setIsConnecting(true);
      const address = await connectWallet();
      localStorage.removeItem(DISCONNECT_FLAG);
      setAccount(address);
      await loadWalletData(address);
    } catch (err) {
      if (err.code === 4001) {
        setError("You rejected the connection request.");
      } else if (err.code === -32002) {
        setError("A connection request is already open. Check the MetaMask popup.");
      } else {
        setError("Could not connect: " + (err.message || "unknown error"));
      }
    } finally {
      setIsConnecting(false);
    }
  }

  function handleDisconnect() {
    localStorage.setItem(DISCONNECT_FLAG, "true");
    setAccount(null);
    setBalance(null);
    setNetwork(null);
    setError("");
  }

  function handleRefresh() {
    setError("");
    loadWalletData(account);
  }

  return (
    <div className="app">
      <Navbar
        account={account}
        isConnecting={isConnecting}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />

      <main className="container">
        {error && <div className="alert alert-error">{error}</div>}

        {!isMetaMaskInstalled() && (
          <div className="alert alert-warning">
            MetaMask was not detected. Install it from{" "}
            <a href="https://metamask.io/download" target="_blank" rel="noreferrer">
              metamask.io/download
            </a>
            , then refresh this page.
          </div>
        )}

        {account ? (
          <WalletInfo
            account={account}
            balance={balance}
            network={network}
            isLoading={isLoading}
            onRefresh={handleRefresh}
          />
        ) : (
          <div className="card">
            <p className="label">Not connected</p>
            <p>Click "Connect Wallet" to get started.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;