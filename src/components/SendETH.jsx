import { useState } from "react";
import { ethers } from "ethers";
import {
  getNetworkInfo,
  estimateTransfer,
  sendEth,
  isUserRejection,
} from "../utils/wallet";

function SendETH({ account, onTxUpdate, onTxConfirmed }) {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [error, setError] = useState("");

  const isBusy = isSending || isWaiting;

  // Waits until the transaction is mined, then reports the real outcome.
  async function waitForConfirmation(tx, details) {
    try {
            setIsWaiting(true);
      console.log("Waiting for transaction:", tx.hash);

      const receipt = await tx.wait(); // pauses here until the transaction is in a block
      console.log("Receipt received:", receipt);

      if (receipt && receipt.status === 1) {
        onTxUpdate({ ...details, status: "confirmed" });
      } else if (receipt) {
        onTxUpdate({ ...details, status: "failed" });
      } else {
        // No receipt: we cannot tell what happened, so don't claim anything.
        setError("Could not read the transaction result. Check Etherscan for its status.");
        return;
      }

      onTxConfirmed(); // refresh the balance (gas is spent even if it failed)
    } catch (err) {
      if (err.code === "TRANSACTION_REPLACED") {
        // The user sped up or cancelled the transaction in MetaMask.
        if (err.reason === "cancelled") {
          onTxUpdate({ ...details, status: "failed" });
          setError("The transaction was cancelled.");
        } else {
          const success = err.receipt && err.receipt.status === 1;
          onTxUpdate({
            ...details,
            hash: err.replacement.hash,
            status: success ? "confirmed" : "failed",
          });
        }
        onTxConfirmed();
      } else if (err.code === "CALL_EXCEPTION") {
        // The transaction was mined but reverted.
        onTxUpdate({ ...details, status: "failed" });
        setError("The transaction was included in a block but failed.");
        onTxConfirmed();
      } else {
        // Probably a network hiccup while waiting. The status is unknown, so leave it as pending.
        setError(
          "Lost track of the transaction while waiting: " +
            (err.shortMessage || err.message || "unknown error") +
            ". Check Etherscan for its real status."
        );
      }
    } finally {
      setIsWaiting(false);
    }
  }

  async function handleSend() {
    setError("");

    // Check 1: is a wallet connected?
    if (!account) {
      setError("Connect your wallet first.");
      return;
    }

    // Check 2: is the recipient a valid Ethereum address?
    const to = recipient.trim();
    if (!ethers.isAddress(to)) {
      setError("The recipient is not a valid Ethereum address.");
      return;
    }

    // Check 3: is the amount a valid positive number?
    const amountText = amount.trim();
    let valueWei;
    try {
      valueWei = ethers.parseEther(amountText); // ETH text -> Wei (BigInt)
    } catch {
      setError("Enter a valid amount, for example 0.001.");
      return;
    }
    if (valueWei <= 0n) {
      setError("The amount must be greater than zero.");
      return;
    }

    try {
      setIsSending(true);

      // Check 4: are we on Sepolia RIGHT NOW? (re-checked at click time)
      const net = await getNetworkInfo();
      if (!net.isSepolia) {
        setError(
          `You are on "${net.name}". Switch MetaMask to Sepolia before sending. Nothing was sent.`
        );
        return;
      }

      // Check 5: can the user afford amount + gas fee?
      const { balanceWei, gasCostWei } = await estimateTransfer(account, to, valueWei);
      const totalWei = valueWei + gasCostWei;
      if (totalWei > balanceWei) {
        setError(
          `Not enough ETH. You need up to ${ethers.formatEther(totalWei)} ETH ` +
            `(amount + maximum gas fee) but have ${ethers.formatEther(balanceWei)} ETH.`
        );
        return;
      }

      // Ask MetaMask. A popup opens and we wait for approve/reject.
      const tx = await sendEth(to, valueWei);

      // The transaction was SUBMITTED. It is NOT confirmed yet.
      const details = { hash: tx.hash, to: to, amount: amountText };
      onTxUpdate({ ...details, status: "pending" });

      setRecipient("");
      setAmount("");
      setIsSending(false);

      // Now wait for the network to actually include it in a block.
      await waitForConfirmation(tx, details);
    } catch (err) {
      if (isUserRejection(err)) {
        setError("You rejected the transaction in MetaMask. Nothing was sent.");
      } else {
        setError("Transaction failed: " + (err.shortMessage || err.message || "unknown error"));
      }
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="card">
      <p className="label">Send ETH (Sepolia test network only)</p>

      <div className="form-group">
        <label htmlFor="recipient" className="field-label">
          Recipient address
        </label>
        <input
          id="recipient"
          className="input"
          type="text"
          placeholder="0x..."
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          disabled={isBusy}
          autoComplete="off"
          spellCheck={false}
        />
      </div>

      <div className="form-group">
        <label htmlFor="amount" className="field-label">
          Amount (ETH)
        </label>
        <input
          id="amount"
          className="input"
          type="text"
          inputMode="decimal"
          placeholder="0.001"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={isBusy}
          autoComplete="off"
        />
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <button className="btn btn-primary" onClick={handleSend} disabled={isBusy}>
        {isSending
          ? "Check MetaMask..."
          : isWaiting
          ? "Waiting for confirmation..."
          : "Send"}
      </button>
    </div>
  );
}

export default SendETH;