import { shortenAddress } from "../utils/wallet";

function Navbar({ account, isConnecting, onConnect, onDisconnect }) {
  return (
    <nav className="navbar">
      <h1 className="navbar-title">ETH Wallet Dashboard</h1>

      {account ? (
        <div className="navbar-right">
          <span className="address-pill">{shortenAddress(account)}</span>
          <button className="btn btn-secondary" onClick={onDisconnect}>
            Disconnect Wallet
          </button>
        </div>
      ) : (
        <button
          className="btn btn-primary"
          onClick={onConnect}
          disabled={isConnecting}
        >
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </button>
      )}
    </nav>
  );
}

export default Navbar;