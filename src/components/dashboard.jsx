import { useState, useEffect, useRef } from "react";
import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import { motion, useInView } from "framer-motion";
import { ArrowUpDown, ChevronLeft, ChevronRight, ChevronDown, Github, Twitter, Linkedin, Globe } from "lucide-react";
import "../App.css";
import SwapPopup from "./Swaptoast"; 
import { useWalrusExchange } from "../hooks/useWalrusExchange"; 
import { getWalRateForNetwork, getSuiUsd, getWalUsdMainnet } from "../utils/prices";

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
  const [network, setNetwork] = useState(() => {
    const savedNetwork = localStorage.getItem("network");
    return savedNetwork || "testnet";
  });
  const [isNetworkMenuOpen, setIsNetworkMenuOpen] = useState(false);
  const [suiBalance, setSuiBalance] = useState(0);
  const [walrusBalance, setWalrusBalance] = useState(0);
  const [walPerSui, setWalPerSui] = useState(0.5);
  const [suiUsd, setSuiUsd] = useState(0);
  const [walUsd, setWalUsd] = useState(0);

  const currentAccount = useCurrentAccount();
  const { convertSuiToWal, getWalBalance, getSuiBalance, connected } = useWalrusExchange();

  useEffect(() => {
    // Update theme when it changes
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    // Save network preference
    localStorage.setItem("network", network);
  }, [network]);

  // Fetch WAL per SUI rate based on network
  useEffect(() => {
    let cancelled = false;
    const loadRate = async () => {
      try {
        const rate = await getWalRateForNetwork(network);
        if (!cancelled) setWalPerSui(rate || 0);
      } catch (e) {
        if (!cancelled) setWalPerSui(0);
      }
    };
    loadRate();
    return () => {
      cancelled = true;
    };
  }, [network]);

  // Fetch real prices (USD) even on testnet
  useEffect(() => {
    let cancelled = false;
    const loadPrices = async () => {
      try {
        const [sui, wal] = await Promise.all([getSuiUsd(), getWalUsdMainnet()]);
        if (!cancelled) {
          setSuiUsd(Number(sui) || 0);
          setWalUsd(Number(wal) || 0);
        }
      } catch (e) {
        if (!cancelled) {
          setSuiUsd(0);
          setWalUsd(0);
        }
      }
    };
    loadPrices();
    const id = setInterval(loadPrices, 60_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [network]);

  // Fetch balances when account is connected
  useEffect(() => {
    const fetchBalances = async () => {
      if (!connected || !currentAccount?.address) {
        setSuiBalance(0);
        setWalrusBalance(0);
        return;
      }

      try {
        // Fetch SUI balance (returns in MIST)
        const suiBalanceMist = await getSuiBalance();
        const suiBalanceFormatted = Number(suiBalanceMist) / 1e9; // Convert from MIST to SUI
        setSuiBalance(suiBalanceFormatted || 0);

        // Fetch WAL balance (returns in smallest unit)
        // This will return 0 if user doesn't have WAL tokens
        const walBalanceMist = await getWalBalance();
        const walBalanceFormatted = Number(walBalanceMist) / 1e9; // Convert to WAL (assuming same decimals as SUI)
        setWalrusBalance(walBalanceFormatted || 0);
      } catch (error) {
        console.error("Error fetching balances:", error);
        setSuiBalance(0);
        setWalrusBalance(0);
      }
    };

    fetchBalances();
    // Refresh balances every 10 seconds
    const interval = setInterval(fetchBalances, 10000);
    return () => clearInterval(interval);
  }, [connected, currentAccount?.address, getSuiBalance, getWalBalance]);

  // Auto-calc receive amount for SUI -> WAL based on current rate
  useEffect(() => {
    if (sendToken === "Sui" && receiveToken === "Walrus") {
      const est = Number((Number(sendAmount || 0) * Number(walPerSui || 0)).toFixed(4));
      setReceiveAmount(est);
    }
  }, [sendAmount, walPerSui, sendToken, receiveToken]);

  const networks = [
    { value: "mainnet", label: "Mainnet" },
    { value: "testnet", label: "Testnet" },
  ];

  const handleNetworkChange = (newNetwork) => {
    setNetwork(newNetwork);
    setIsNetworkMenuOpen(false);
    // Note: Actual network switching would need to be handled at the wallet/App level
    // This updates the UI preference
  };

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
    if (!connected || !currentAccount) {
      alert("Please connect your Sui wallet first!");
      return;
    }

    // Only support SUI -> WAL swaps for now
    if (sendToken !== "Sui" || receiveToken !== "Walrus") {
      alert("Currently only SUI → WAL swaps are supported.");
      return;
    }

    // Validate amount
    if (!sendAmount || sendAmount <= 0) {
      alert("Please enter a valid amount to swap.");
      return;
    }

    // Check sufficient balance
    if (sendAmount > suiBalance) {
      alert("Insufficient SUI balance.");
      return;
    }

    setPopupStatus("loading");

    try {
      // Convert SUI amount to MIST (1 SUI = 1_000_000_000 MIST)
      const amountInMist = BigInt(Math.floor(sendAmount * 1e9));

      // Execute the swap
      const result = await convertSuiToWal(amountInMist);

      // Success!
      console.log("Swap successful! Transaction digest:", result.digest);
        setPopupStatus("success");

      // Refresh balances after successful swap (wait a bit for blockchain to update)
      setTimeout(async () => {
        try {
          const suiBalanceMist = await getSuiBalance();
          const walBalanceMist = await getWalBalance();
          setSuiBalance(Number(suiBalanceMist) / 1e9);
          setWalrusBalance(Number(walBalanceMist) / 1e9);
        } catch (error) {
          console.error("Error refreshing balances:", error);
        }
      }, 3000);

      setTimeout(() => setPopupStatus(null), 4000);
    } catch (error) {
      console.error("Swap error:", error);
      setPopupStatus("error");
      setTimeout(() => setPopupStatus(null), 4000);
    }
  };

  const tokens = ["Sui", "Walrus"];

  const cycleToken = (type, direction) => {
    if (type === "send") {
      const currentIndex = tokens.indexOf(sendToken);
      const nextIndex = direction === "next" 
        ? (currentIndex + 1) % tokens.length
        : (currentIndex - 1 + tokens.length) % tokens.length;
      const nextToken = tokens[nextIndex];
      if (nextToken === receiveToken) {
        // If switching to the receive token, swap them
        setReceiveToken(sendToken);
        setSendToken(nextToken);
      } else {
        setSendToken(nextToken);
      }
    } else {
      const currentIndex = tokens.indexOf(receiveToken);
      const nextIndex = direction === "next"
        ? (currentIndex + 1) % tokens.length
        : (currentIndex - 1 + tokens.length) % tokens.length;
      const nextToken = tokens[nextIndex];
      if (nextToken === sendToken) {
        // If switching to the send token, swap them
        setSendToken(receiveToken);
        setReceiveToken(nextToken);
      } else {
        setReceiveToken(nextToken);
      }
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

  const getTokenLogo = (symbol) => {
    if (!symbol) return "";
    return symbol.toLowerCase() === "sui"
      ? "src/assets/20947.png"
      : "src/assets/36119.png"; // Walrus
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

  // Close network menu when clicking outside
  const networkSelectorRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        networkSelectorRef.current &&
        !networkSelectorRef.current.contains(e.target)
      ) {
        setIsNetworkMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

        <motion.div
          ref={networkSelectorRef}
          className="network-selector"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.button
            className="network-btn"
            onClick={() => setIsNetworkMenuOpen(!isNetworkMenuOpen)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-expanded={isNetworkMenuOpen}
            aria-haspopup="listbox"
          >
            {networks.find(n => n.value === network)?.label || "Testnet"}
            <ChevronDown 
              size={16} 
              style={{ 
                marginLeft: "6px",
                transform: isNetworkMenuOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease"
              }} 
            />
          </motion.button>
          {isNetworkMenuOpen && (
            <motion.ul
              className="network-menu"
              role="listbox"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {networks.map((net) => (
                <li
                  key={net.value}
                  role="option"
                  aria-selected={network === net.value}
                  className={`network-item ${network === net.value ? "selected" : ""}`}
                  onClick={() => handleNetworkChange(net.value)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleNetworkChange(net.value);
                    }
                  }}
                >
                  {net.label}
                </li>
              ))}
            </motion.ul>
          )}
        </motion.div>

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
                <motion.button
                  type="button"
                  className="token-arrow-btn"
                  onClick={() => cycleToken("send", "prev")}
                  aria-label="Previous token"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ChevronLeft size={18} />
                </motion.button>
                <img
                  src={getTokenLogo(sendToken)}
                  alt={`${sendToken} logo`}
                  className="token-icon"
                />
                <span className="token-name">{sendToken}</span>
                <motion.button
                  type="button"
                  className="token-arrow-btn"
                  onClick={() => cycleToken("send", "next")}
                  aria-label="Next token"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ChevronRight size={18} />
                </motion.button>
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
                <span className="amount-sub">
                  ≈ $
                  {(() => {
                    const amt = Number(sendAmount || 0);
                    const price = sendToken === "Sui" ? suiUsd : walUsd;
                    return (amt * (price || 0)).toFixed(2);
                  })()}
                </span>
                {currentAccount && (
                  <span className="balance-display">
                    Balance: {sendToken === "Sui" ? suiBalance.toFixed(4) : walrusBalance.toFixed(4)} {sendToken === "Sui" ? "SUI" : "WAL"}
                  </span>
                )}
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
                <motion.button
                  type="button"
                  className="token-arrow-btn"
                  onClick={() => cycleToken("receive", "prev")}
                  aria-label="Previous token"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ChevronLeft size={18} />
                </motion.button>
                <img
                  src={getTokenLogo(receiveToken)}
                  alt={`${receiveToken} logo`}
                  className="token-icon"
                />
                <span className="token-name">{receiveToken}</span>
                <motion.button
                  type="button"
                  className="token-arrow-btn"
                  onClick={() => cycleToken("receive", "next")}
                  aria-label="Next token"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ChevronRight size={18} />
                </motion.button>
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
                <span className="amount-sub">
                  ≈ $
                  {(() => {
                    const amt = Number(receiveAmount || 0);
                    const price = receiveToken === "Sui" ? suiUsd : walUsd;
                    return (amt * (price || 0)).toFixed(2);
                  })()}
                </span>
                {currentAccount && (
                  <span className="balance-display">
                    Balance: {receiveToken === "Sui" ? suiBalance.toFixed(4) : walrusBalance.toFixed(4)} {receiveToken === "Sui" ? "SUI" : "WAL"}
                  </span>
                )}
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
        <p className="footer-text">Built by NEXT EPOCH LABS</p>
        <div className="footer-social">
          <motion.a
            href="https://github.com/NextEpochLabs"
            target="_blank"
            rel="noopener noreferrer"
            className="social-link"
            whileHover={{ scale: 1.15, y: -2 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Visit our GitHub"
          >
            <Github size={20} />
          </motion.a>
          <motion.a
            href="https://x.com/NextEpochLabs"
            target="_blank"
            rel="noopener noreferrer"
            className="social-link"
            whileHover={{ scale: 1.15, y: -2 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Visit our X profile"
          >
            <img src="src/assets/X-logo.png" alt="X logo" />
          </motion.a>
          <motion.a
            href="https://linkedin.com/company/next-epoch-labs"
            target="_blank"
            rel="noopener noreferrer"
            className="social-link"
            whileHover={{ scale: 1.15, y: -2 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Visit our LinkedIn"
          >
            <Linkedin size={20} />
          </motion.a>
          <motion.a
            href="https://nextepochlabs.com"
            target="_blank"
            rel="noopener noreferrer"
            className="social-link"
            whileHover={{ scale: 1.15, y: -2 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Visit our website"
          >
            <Globe size={20} />
          </motion.a>
        </div>
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
