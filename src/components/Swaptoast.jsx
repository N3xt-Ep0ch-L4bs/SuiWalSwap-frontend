import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import "../App.css";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function SwapPopup({ status, onRetry }) {
  const theme = document.documentElement.getAttribute("data-theme") || "light";
  const isDark = theme === "dark";

  const popupVariants = {
    hidden: {
      opacity: 0,
      x: 100,
      scale: 0.8,
    },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
      },
    },
    exit: {
      opacity: 0,
      x: 100,
      scale: 0.8,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <div className={`popup-container ${isDark ? "dark" : "light"}`}>
      <AnimatePresence mode="wait">
        {status === "loading" && (
          <motion.div
            key="loading"
            className="popup-box loading"
            variants={popupVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="icon" size={22} />
            </motion.div>
            <p>Confirming Swap...</p>
          </motion.div>
        )}

        {status === "success" && (
          <motion.div
            key="success"
            className="popup-box success"
            variants={popupVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
            >
              <CheckCircle className="icon success-icon" size={22} />
            </motion.div>
            <div>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                Swap Successful!
              </motion.p>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                10.00 SUI → 9.98 WAL • Confirmed
              </motion.span>
              <motion.a
                href="#"
                className="explorer-link"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View in Explorer
              </motion.a>
            </div>
          </motion.div>
        )}

        {status === "error" && (
          <motion.div
            key="error"
            className="popup-box error"
            variants={popupVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <XCircle className="icon error-icon" size={22} />
            </motion.div>
            <div>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                Swap Failed
              </motion.p>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Execution reverted, slippage exceeded
              </motion.span>
              <motion.button
                className="retry-btn"
                onClick={onRetry}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Retry
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
