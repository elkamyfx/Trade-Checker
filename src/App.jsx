import React, { useState } from 'react';
import RecordTrade from './components/RecordTrade';
import CheckTrade from './components/CheckTrade';
import './index.css';

function App() {
  const [selectedStrategy, setSelectedStrategy] = useState('Strategy A');
  const [mode, setMode] = useState('record'); // 'record' or 'check'

  const strategies = [
    'Strategy A',
    'Strategy B', 
    'Strategy C',
    'Strategy D',
    'Strategy E'
  ];

  return (
    <div className="app-container">
      <div className="header">
        <h1>Trade Checker System</h1>
        <p>Professional Trading Analysis & Record Management</p>
      </div>

      <div className="strategy-selector">
        <label htmlFor="strategy-select">Select Trading Strategy: </label>
        <select 
          id="strategy-select"
          value={selectedStrategy}
          onChange={(e) => setSelectedStrategy(e.target.value)}
        >
          {strategies.map(strategy => (
            <option key={strategy} value={strategy}>
              {strategy}
            </option>
          ))}
        </select>
      </div>

      <div className="mode-selector">
        <button
          className={`mode-btn ${mode === 'record' ? 'active' : ''}`}
          onClick={() => setMode('record')}
        >
          Record Trade
        </button>
        <button
          className={`mode-btn ${mode === 'check' ? 'active' : ''}`}
          onClick={() => setMode('check')}
        >
          Check Trade
        </button>
      </div>

      <div className="dashboard-content">
        {mode === 'record' ? (
          <RecordTrade strategy={selectedStrategy} />
        ) : (
          <CheckTrade strategy={selectedStrategy} />
        )}
      </div>
    </div>
  );
}

export default App;