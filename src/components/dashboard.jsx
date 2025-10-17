import { useState } from "react";
import "../App.css";

function Dashboard() {
  const [sendToken] = useState("Sui");
  const [receiveToken] = useState("Walrus");
  const [sendAmount] = useState(1);
  const [receiveAmount] = useState(2.3);

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

  return (
    <div className="swap-page">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-left">
          <span className="logo-text">SuiWalSwap</span>
          <button className="network-btn">Mainnet</button>
        </div>
        <div className="nav-right">
          <button className="wallet-btn">0xah...gJhjsH</button>
        </div>
      </nav>

      <div className="content-wrapper">
        {/* Swap Box */}
        <div className="swap-box">
          {/* Send Section */}
          <div className="swap-section">
            <span className="section-title">Send</span>
            <div className="token-select">
              <span className="token-name">{sendToken}</span>
            </div>
            <div className="amount-display">
              <span className="amount-num">{sendAmount}</span>
              <span className="amount-sub">$3.47</span>
            </div>
          </div>

          {/* Divider Icon */}
          <div className="swap-divider">⇅</div>

          {/* Receive Section */}
          <div className="swap-section">
            <span className="section-title">Receive</span>
            <div className="token-select">
              <span className="token-name">{receiveToken}</span>
            </div>
            <div className="amount-display">
              <span className="amount-num">{receiveAmount}</span>
              <span className="amount-sub">$3.37</span>
            </div>
          </div>

          {/* Confirm Button */}
          <div className="confirm-container">
            <button className="confirm-btn">Confirm and Swap</button>
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
