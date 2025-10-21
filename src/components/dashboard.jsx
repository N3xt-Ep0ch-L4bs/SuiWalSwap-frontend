import { useState } from "react";
import "../App.css";

function Dashboard() {
  const [theme, setTheme] = useState("light");
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [account, setAccount] = useState(null);

  const [sendToken, setSendToken] = useState("Sui");
  const [receiveToken, setReceiveToken] = useState("Walrus");
  const [sendAmount, setSendAmount] = useState(1);
  const [receiveAmount, setReceiveAmount] = useState(2.3);

  const data = [
    {
      date: "12 Oct 2025",
      pair: "Sui → WAL",
      input: "1.02 SUI",
      output: "2.03 WAL",
      hash: "0x239...12d4",
      status: "Success",
    },
    {
      date: "08 Oct 2025",
      pair: "WAL → SUI",
      input: "5.02 WAL",
      output: "2.07 SUI",
      hash: "0xf64...11e8",
      status: "Failed",
    },
    {
      date: "03 Oct 2025",
      pair: "Sui → WAL",
      input: "3.02 SUI",
      output: "6.09 WAL",
      hash: "0x9ba...00f2",
      status: "Pending",
    },
  ];

  // Theme toggle
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  // Simulate wallet connect
  const handleConnectWallet = () => {
    setConnecting(true);
    setTimeout(() => {
      setConnected(true);
      setAccount({ address: "0xA2394BcD12Ef4567890" });
      setConnecting(false);
      setShowModal(false);
    }, 1000);
  };

  const handleLogout = () => {
    setConnected(false);
    setAccount(null);
  };

  // 🌀 Swap function — swaps tokens and their amounts
  const handleSwap = () => {
    const tempToken = sendToken;
    const tempAmount = sendAmount;
    setSendToken(receiveToken);
    setReceiveToken(tempToken);
    setSendAmount(receiveAmount);
    setReceiveAmount(tempAmount);
  };

  return (
    <div className={`swap-page ${theme}`}>
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-left">
          <img src="src/assets/logo.png" alt="logo" />
          <span className="logo-text">SuiWalSwap</span>
        </div>

        <div className="token-select">
          <span>Mainnet</span>
        </div>

        <div className="nav-right">
          {!connected ? (
            <button
              className="connect-wallet"
              onClick={handleConnectWallet}
              disabled={connecting}
            >
              {connecting ? "Connecting..." : "Connect Wallet"}
            </button>
          ) : (
            <div className="wallet-actions">
              <button className="connect-wallet">
                {account?.address.slice(0, 6)}...{account?.address.slice(-4)}
              </button>
              <button className="logout" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}

          <label className="theme-toggle">
            <input
              type="checkbox"
              onChange={toggleTheme}
              checked={theme === "dark"}
            />
            <span className="slider"></span>
          </label>
        </div>
      </nav>

      {/* Content */}
      <div className="content-wrapper">
        <div className="swap-box">
          <div className="swap-section">
            <span className="section-title">Send</span>
            <div className="token-select">
              <span className="token-name">{sendToken}</span>
            </div>
            <div className="amount-display">
              <input
                type="number"
                className="amount-input"
                value={sendAmount}
                onChange={(e) => setSendAmount(Number(e.target.value))}
              />
              <span className="amount-sub">$3.47</span>
            </div>
          </div>

          {/* 👇 SWAP BUTTON (Dynamic) */}
          <div className="swap-divider" onClick={handleSwap} title="Swap tokens">
            ⇅
          </div>

          <div className="swap-section">
            <span className="section-title">Receive</span>
            <div className="token-select">
              <span className="token-name">{receiveToken}</span>
            </div>
            <div className="amount-display">
              <input
                type="number"
                className="amount-input"
                value={receiveAmount}
                onChange={(e) => setReceiveAmount(Number(e.target.value))}
              />
              <span className="amount-sub">$3.37</span>
            </div>
          </div>

          <div className="confirm-container">
            <button
              className="confirm-btn"
              onClick={() => {
                if (!connected) {
                  handleConnectWallet();
                } else {
                  console.log("Confirming swap...");
                }
              }}
            >
              {connected ? "Confirm and Swap" : "Connect Wallet"}
            </button>
          </div>
        </div>

        {/* Transaction Table */}
        <div className="txn-table-wrapper">
          <h3 className="txn-title">Transaction history</h3>
          <table className="txn-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Pair (From → To)</th>
                <th>Input</th>
                <th>Output</th>
                <th>Tx Hash</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((tx, index) => (
                <tr key={index}>
                  <td>{tx.date}</td>
                  <td>{tx.pair}</td>
                  <td>{tx.input}</td>
                  <td>{tx.output}</td>
                  <td>{tx.hash}</td>
                  <td>{tx.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <footer className="footer">
        <p>Built by NEXT EPOCH LABS ✕</p>
      </footer>
    </div>
  );
}

export default Dashboard;
