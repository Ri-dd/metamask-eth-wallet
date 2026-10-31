function TransactionInfo({ tx }) {
  if (!tx) {
    return (
      <div className="card">
        <p className="label">Transaction status</p>
        <p>No transactions yet.</p>
      </div>
    );
  }

  const explorerUrl = `https://sepolia.etherscan.io/tx/${tx.hash}`;

  const statusText = {
    pending: "Pending (submitted, not confirmed yet)",
    confirmed: "Confirmed (success)",
    failed: "Failed",
  }[tx.status];

  const badgeClass = {
    pending: "badge badge-warn",
    confirmed: "badge badge-ok",
    failed: "badge badge-error",
  }[tx.status];

  return (
    <div className="card">
      <p className="label">Transaction status</p>

      <p className="tx-status">
        <span className={badgeClass}>{statusText}</span>
      </p>

      <p className="label">Transaction hash</p>
      <p className="address">{tx.hash}</p>

      <p className="label tx-gap">Recipient</p>
      <p className="address">{tx.to}</p>

      <p className="label tx-gap">Amount</p>
      <p>{tx.amount} ETH</p>

      <p className="tx-gap">
        <a href={explorerUrl} target="_blank" rel="noreferrer">
          View on Sepolia Etherscan
        </a>
      </p>
    </div>
  );
}

export default TransactionInfo;