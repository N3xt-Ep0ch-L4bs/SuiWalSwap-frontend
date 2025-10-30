import { useState, useEffect, useRef } from "react";
import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import { motion, useInView } from "framer-motion";
import { ArrowUpDown } from "lucide-react";
import "../App.css";
import SwapPopup from "./Swaptoast"; 

function Dashboard() {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme || "light";
  });
  const [sendToken, setSendToken] = useState("Sui");
  const [receiveToken, setReceiveToken] = useState("Walrus");
  const [sendAmount, setSendAmount] = useState(1);
  const [receiveAmount, setReceiveAmount] = useState(2.3);
  const [popupStatus, setPopupStatus] = useState(null);

  const currentAccount = useCurrentAccount();

  useEffect(() => {
    // Update theme when it changes
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const data = [
    { date: "12 Oct 2025", pair: "Sui → WAL", input: "1.02 SUI", output: "2.03 WAL", hash: "0x239...12d4", status: "Success" },
    { date: "08 Oct 2025", pair: "WAL → SUI", input: "5.02 WAL", output: "2.07 SUI", hash: "0xf64...11e8", status: "Failed" },
    { date: "03 Oct 2025", pair: "Sui → WAL", input: "3.02 SUI", output: "6.09 WAL", hash: "0x9ba...00f2", status: "Pending" },
  ];

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "success":
        return "var(--accent-success)";
      case "failed":
        return "var(--accent-error)";
      case "pending":
        return "var(--accent-warning)";
      default:
        return "var(--text-secondary)";
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const swapBoxRef = useRef(null);
  const tableRef = useRef(null);
  const isSwapBoxInView = useInView(swapBoxRef, { once: true, margin: "-100px" });
  const isTableInView = useInView(tableRef, { once: true, margin: "-100px" });

  // Interactive background grid parallax (mouse-driven)
  const rafRef = useRef(null);
  const lastPosRef = useRef({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const xRatio = e.clientX / window.innerWidth - 0.5;
    const yRatio = e.clientY / window.innerHeight - 0.5;
    // Subtle offset, scaled down for smoothness
    const x = Math.round(xRatio * 20);
    const y = Math.round(yRatio * 20);
    lastPosRef.current = { x, y };

    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      document.documentElement.style.setProperty("--grid-x", `${lastPosRef.current.x}px`);
      document.documentElement.style.setProperty("--grid-y", `${lastPosRef.current.y}px`);
      document.documentElement.style.setProperty("--spot-x", `${e.clientX}px`);
      document.documentElement.style.setProperty("--spot-y", `${e.clientY}px`);
      rafRef.current = null;
    });
  };

  const handleMouseLeave = () => {
    document.documentElement.style.setProperty("--spot-x", `50%`);
    document.documentElement.style.setProperty("--spot-y", `50%`);
  };

  return (
    <div className={`swap-page ${theme}`} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      {/* Animated grid glow overlays */}
      <div className="grid-glow glow1"></div>
      <div className="grid-glow glow2"></div>
      <div className="grid-glow glow3"></div>
      {/* Skip Link for Accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Navbar */}
      <motion.nav
        className="navbar"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="nav-left">
          <motion.img
            src="src/assets/logo.png"
            alt="SuiWalSwap logo"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400 }}
          />
          <span className="logo-text">SuiWalSwap</span>
        </div>

        <motion.button
          className="network-btn"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Mainnet
        </motion.button>

        <div className="nav-right">
          <div className="connect-wrapper">
            <ConnectButton />
          </div>
          <label className="theme-toggle" aria-label="Toggle dark mode">
            <input
              type="checkbox"
              onChange={toggleTheme}
              checked={theme === "dark"}
              aria-label="Theme toggle"
            />
            <span className="slider"></span>
          </label>
        </div>
      </motion.nav>

      <motion.section
        className="hero"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <h2>
          <span>Sui</span> <span>&#8596;</span> <span>Walrus</span> <span>Swap</span>
        </h2>
        <p>Seamlessly swap your assets between Sui and Walrus</p>
      </motion.section>

      <main id="main-content" className="content-wrapper">
        <motion.div
          ref={swapBoxRef}
          className="swap-box"
          variants={itemVariants}
          initial="hidden"
          animate={isSwapBoxInView ? "visible" : "hidden"}
        >
          {/* Send Section */}
          <div className="swap-section">
            <div className="section-title">Send</div>
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
              <motion.div
                className="token-select"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <select
                  value={sendToken}
                  onChange={(e) => handleTokenChange("send", e.target.value)}
                  className="token-dropdown"
                  aria-label="Select token to send"
                >
                  <option value="Sui">Sui</option>
                  <option value="Walrus">Walrus</option>
                </select>
              </motion.div>

              <div className="amount-display">
                <input
                  type="number"
                  className="amount-input"
                  value={sendAmount}
                  onChange={(e) => setSendAmount(Number(e.target.value))}
                  aria-label="Amount to send"
                  min="0"
                  step="0.01"
                />
                <span className="amount-sub">≈ $3.47</span>
              </div>
            </div>
          </div>

          {/* Swap Divider */}
          <motion.div
            className="swap-divider"
            onClick={handleTokenSwitch}
            title="Swap tokens"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleTokenSwitch();
              }
            }}
            aria-label="Swap tokens"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowUpDown size={24} style={{ color: "var(--accent-primary)" }} />
          </motion.div>

          {/* Receive Section */}
          <div className="swap-section">
            <div className="section-title">Receive</div>
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
              <motion.div
                className="token-select"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <select
                  value={receiveToken}
                  onChange={(e) => handleTokenChange("receive", e.target.value)}
                  className="token-dropdown"
                  aria-label="Select token to receive"
                >
                  <option value="Sui">Sui</option>
                  <option value="Walrus">Walrus</option>
                </select>
              </motion.div>

              <div className="amount-display">
                <input
                  type="number"
                  className="amount-input"
                  value={receiveAmount}
                  onChange={(e) => setReceiveAmount(Number(e.target.value))}
                  aria-label="Amount to receive"
                  min="0"
                  step="0.01"
                />
                <span className="amount-sub">≈ $3.37</span>
              </div>
            </div>
          </div>

          {/* Confirm Button */}
          <div className="confirm-container">
            <motion.button
              className="confirm-btn"
              onClick={handleSwap}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={popupStatus === "loading"}
            >
              {currentAccount
                ? popupStatus === "loading"
                  ? "Processing..."
                  : "Confirm and Swap"
                : "Connect Wallet"}
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          ref={tableRef}
          className="txn-table-wrapper"
          variants={itemVariants}
          initial="hidden"
          animate={isTableInView ? "visible" : "hidden"}
        >
          <h3 className="txn-title">Transaction History</h3>
          <div style={{ overflowX: "auto" }}>
            <table className="txn-table" role="table">
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
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.01 }}
                  >
                    <td>{tx.date}</td>
                    <td>{tx.pair}</td>
                    <td>{tx.input}</td>
                    <td>{tx.output}</td>
                    <td>
                      <a
                        href={`#${tx.hash}`}
                        style={{
                          color: "var(--accent-primary)",
                          textDecoration: "none",
                        }}
                        onMouseEnter={(e) => (e.target.style.textDecoration = "underline")}
                        onMouseLeave={(e) => (e.target.style.textDecoration = "none")}
                      >
                        {tx.hash}
                      </a>
                    </td>
                    <td>
                      <span
                        style={{
                          color: getStatusColor(tx.status),
                          fontWeight: 600,
                        }}
                      >
                        {tx.status}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </main>

      <motion.footer
        className="footer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <p>
          Built by NEXT EPOCH LABS
          <motion.a
            href="https://x.com"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Visit our Twitter"
          >
            <img src="src/assets/X-logo.png" alt="Twitter" />
          </motion.a>
        </p>
      </motion.footer>

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
