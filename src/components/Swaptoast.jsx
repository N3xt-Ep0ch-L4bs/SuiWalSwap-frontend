import React from "react";
import "../App.css";
import { Loader2, CheckCircle, XCircle } from "lucide-react"; // icons

export default function SwapPopup({ status, onRetry }) {
  if (!status) return null;

  const theme = document.documentElement.getAttribute("data-theme") || "light";
  const isDark = theme === "dark";

  return (
    <div className={`popup-container ${isDark ? "dark" : "light"}`}>
      {status === "loading" && (
        <div className="popup-box loading">
          <Loader2 className="icon spin" size={22} />
          <p>Confirming Swap...</p>
        </div>
      )}

      {status === "success" && (
        <div className="popup-box success">
          <CheckCircle className="icon success-icon" size={22} />
          <div>
            <p>Swap Successful!</p>
            <span>10.00 SUI → 9.98 WAL • Confirmed</span>
            <a href="#" className="explorer-link">View in Explorer</a>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="popup-box error">
          <XCircle className="icon error-icon" size={22} />
          <div>
            <p>Swap Failed</p>
            <span>Execution reverted, slippage exceeded</span>
            <button className="retry-btn" onClick={onRetry}>Retry</button>
          </div>
        </div>
      )}
    </div>
  );
}
