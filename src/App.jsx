import { useState } from "react";
import Navbar from "./components/Navbar";
import { connectWallet, isMetaMaskInstalled } from "./utils/wallet";

function App() {
  const [account, setAccount] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState("");

  async function handleConnect() {
    setError("");

    if (!isMetaMaskInstalled()) {
      setError("MetaMask is not installed. Please install it to continue.");
      return;
    }

    try {
      setIsConnecting(true);
      const address = await connectWallet();
      setAccount(address);
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
    setAccount(null);
    setError("");
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
          <div className="card">
            <p className="label">Connected wallet address</p>
            <p className="address">{account}</p>
          </div>
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