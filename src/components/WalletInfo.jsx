function WalletInfo({ account, balance, network, isLoading, onRefresh }) {
  // Show 4 decimals for readability. This is display-only formatting.
  const displayBalance =
    balance === null ? "--" : Number(balance).toFixed(4);

  return (
    <>
      <div className="card">
        <p className="label">Connected wallet address</p>
        <p className="address">{account}</p>
      </div>

      <div className="card">
        <p className="label">Network</p>
        {network ? (
          <>
            <p className="network-row">
              <span className="network-name">{network.name}</span>
              <span className={network.isSepolia ? "badge badge-ok" : "badge badge-warn"}>
                {network.isSepolia ? "Correct network" : "Wrong network"}
              </span>
            </p>
            <p className="chain-id">Chain ID: {network.chainId.toString()}</p>

            {!network.isSepolia && (
              <div className="alert alert-warning">
                This app only works on the Sepolia test network. Open MetaMask,
                switch to <strong>Sepolia</strong>, then click Refresh.
              </div>
            )}
          </>
        ) : (
          <p>--</p>
        )}
      </div>

      <div className="card">
        <p className="label">ETH balance</p>
        <p className="balance">
          {isLoading ? "Loading..." : `${displayBalance} ETH`}
        </p>
        <button
          className="btn btn-secondary"
          onClick={onRefresh}
          disabled={isLoading}
        >
          {isLoading ? "Refreshing..." : "Refresh"}
        </button>
      </div>
    </>
  );
}

export default WalletInfo;