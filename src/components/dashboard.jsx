import { useState } from "react";
import {
  ConnectButton,
  useCurrentAccount,
} from "@mysten/dapp-kit";
import "../App.css";

function Dashboard() {
  const [theme, setTheme] = useState("light");
  const [sendToken, setSendToken] = useState("Sui");
  const [receiveToken, setReceiveToken] = useState("Walrus");
  const [sendAmount, setSendAmount] = useState(1);
  const [receiveAmount, setReceiveAmount] = useState(2.3);

  const currentAccount = useCurrentAccount();

  const data = [
    { date: "12 Oct 2025", pair: "Sui → WAL", input: "1.02 SUI", output: "2.03 WAL", hash: "0x239...12d4", status: "Success" },
    { date: "08 Oct 2025", pair: "WAL → SUI", input: "5.02 WAL", output: "2.07 SUI", hash: "0xf64...11e8", status: "Failed" },
    { date: "03 Oct 2025", pair: "Sui → WAL", input: "3.02 SUI", output: "6.09 WAL", hash: "0x9ba...00f2", status: "Pending" },
  ];

  // Theme toggle
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  // Swap tokens
  const handleSwap = () => {
    const tempToken = sendToken;
    const tempAmount = sendAmount;
    setSendToken(receiveToken);
    setReceiveToken(tempToken);
    setSendAmount(receiveAmount);
    setReceiveAmount(tempAmount);
  };

  const handleTokenChange = (type, value) => {
    if (type === "send") {
      if (value === receiveToken) setReceiveToken(sendToken);
      setSendToken(value);
    } else {
      if (value === sendToken) setSendToken(receiveToken);
      setReceiveToken(value);
    }
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

          <ConnectButton className="connect-wallet" />
          <label className="theme-toggle">
            <input type="checkbox" onChange={toggleTheme} checked={theme === "dark"} />
            <span className="slider"></span>
          </label>
        </div>
      </nav>

      <div className="content-wrapper">
        <div className="swap-box">
          <div className="swap-section">
            <span className="section-title">Send</span>
            <div className="token-select">
              <select
                value={sendToken}
                onChange={(e) => handleTokenChange("send", e.target.value)}
                className="token-dropdown"
              >
                <option value="Sui">Sui</option>
                <option value="Walrus">Walrus</option>
              </select>
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

          {/* Swap Divider */}
          <div className="swap-divider" onClick={handleSwap} title="Swap tokens">⇅</div>

          <div className="swap-section">
            <span className="section-title">Receive</span>
            <div className="token-select">
              <select
                value={receiveToken}
                onChange={(e) => handleTokenChange("receive", e.target.value)}
                className="token-dropdown"
              >
                <option value="Sui">Sui</option>
                <option value="Walrus">Walrus</option>
              </select>
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

          {/* Confirm */}
          <div className="confirm-container">
            <button
              className="confirm-btn"
              onClick={() => {
                if (!currentAccount) {
                  alert("Please connect your Sui wallet first!");
                } else {
                  console.log("Confirming swap...");
                }
              }}
            >
              {currentAccount ? "Confirm and Swap" : "Connect Wallet"}
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
        <p>Built by NEXT EPOCH LABS <img src="src/assets/X-logo.png" /></p>
      </footer>
    </div>
  );
}

export default Dashboard;
