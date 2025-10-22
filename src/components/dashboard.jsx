import { useState } from "react";
import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import "../App.css";
import SwapPopup from "./Swaptoast"; 

function Dashboard() {
  const [theme, setTheme] = useState("light");
  const [sendToken, setSendToken] = useState("Sui");
  const [receiveToken, setReceiveToken] = useState("Walrus");
  const [sendAmount, setSendAmount] = useState(1);
  const [receiveAmount, setReceiveAmount] = useState(2.3);
  const [popupStatus, setPopupStatus] = useState(null);

  const currentAccount = useCurrentAccount();

  const data = [
    { date: "12 Oct 2025", pair: "Sui → WAL", input: "1.02 SUI", output: "2.03 WAL", hash: "0x239...12d4", status: "Success" },
    { date: "08 Oct 2025", pair: "WAL → SUI", input: "5.02 WAL", output: "2.07 SUI", hash: "0xf64...11e8", status: "Failed" },
    { date: "03 Oct 2025", pair: "Sui → WAL", input: "3.02 SUI", output: "6.09 WAL", hash: "0x9ba...00f2", status: "Pending" },
  ];

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const handleSwap = async () => {
    if (!currentAccount) {
      alert("Please connect your Sui wallet first!");
      return;
    }

    setPopupStatus("loading");

    try {
      await new Promise((res) => setTimeout(res, 2000));

      const isSuccess = Math.random() > 0.3;

      if (isSuccess) {
        setPopupStatus("success");
      } else {
        setPopupStatus("error");
      }

      setTimeout(() => setPopupStatus(null), 4000);
    } catch {
      setPopupStatus("error");
    }
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

  const handleTokenSwitch = () => {
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
          <ConnectButton />
        </div>
      </nav>

      <section className="hero">
        <h2><span>Sui</span> <span>&#8596;</span> <span>Walrus</span> <span>Swap</span></h2>
        <p>Seamlessly swap your assets between Sui and Walrus</p>
      </section>
      <div className="content-wrapper">
        <div className="swap-box">
          <section className="section">
          <div className="section-title">
            <h2>Send</h2>
          </div>
          <div className="section-p">
           <p><b>&#9881;</b></p>
           </div>
          </section>
          <div className="swap-section">
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

          <div className="swap-divider" onClick={handleTokenSwitch} title="Swap tokens">⇅</div>
              <div className="section-title">
                  <h2>Recieve</h2>
              </div>
            <div className="swap-section">
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

          <div className="confirm-container">
            <button
              className="confirm-btn"
              onClick={handleSwap}
            >
              {currentAccount ? "Confirm and Swap" : "Connect Wallet"}
            </button>
          </div>
        </div>

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
         <label className="theme-toggle">
            <input type="checkbox" onChange={toggleTheme} checked={theme === "dark"} />
            <span className="slider"></span>
          </label>
      </footer>

      <SwapPopup
        status={popupStatus}
        onRetry={() => {
          setPopupStatus(null);
          handleSwap();
        }}
      />
    </div>
  );
}

export default Dashboard;
