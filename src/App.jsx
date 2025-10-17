import { useState } from 'react'
import './App.css'

function App() {
  

  return (
    <>
     <nav className="">
      <div>
      <img src="" />
      <h3>SuiWalSwap</h3>
      </div>
      <button className="connect-btn">Connect wallet</button>
     </nav>
     <div className="body">
      <div className="header">
        <h2>Sui Walrus Swap</h2>
        <p>Seamlessly swap your assets between sui and Walrus</p>
      </div>
      <div className="swap-card">
        <div className="send">
          <div>
            <p>Send</p>
            <label>Prize type</label>
              <select
                name="type"
                className="select-field">
                  <option value="">Select a token</option>
                <option><img src="" />Sui</option>
                <option><img src="" />Walrus</option>
                </select>
          </div>
          <div>
            <img src="" />
            {/* <input name="number"
              className="select-number">
              0</input> */}
          </div>
        </div>
        <div className="recieve">
          <div className="send">
            <div>
              <p>Recieve</p>
              <label>Prize type</label>
              <select
                name="type"
                className="select-field">
                  <option value="">Select a token</option>
                <option><img src="" />Sui</option>
                <option><img src="" />Walrus</option>
                </select>
            </div>
          <div className="">
            
          </div>
          </div>
        </div>
      </div>
     </div>
    </>
  )
}

export default App
