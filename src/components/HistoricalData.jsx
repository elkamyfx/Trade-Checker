import React, { useState, useEffect } from 'react';
import { PARAMETER_GROUPS, getParameterDisplayValue } from './parameters';
import dbService from '../database';

const HistoricalData = ({ strategy }) => {
  const [historicalData, setHistoricalData] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grouped'); // 'grouped' or 'chronological'
  const [expandedGroups, setExpandedGroups] = useState(new Set());
  const [selectedStrategy, setSelectedStrategy] = useState(strategy);

  useEffect(() => {
    loadHistoricalData();
  }, [selectedStrategy]);

  const loadHistoricalData = () => {
    setLoading(true);
    
    // Get grouped historical data
    const groupedResult = dbService.getHistoricalDataGrouped(selectedStrategy);
    if (groupedResult.success) {
      setHistoricalData(groupedResult.data);
    }

    // Get statistics
    const statsResult = dbService.getStatistics(selectedStrategy);
    if (statsResult.success) {
      setStatistics(statsResult.data);
    }

    setLoading(false);
  };

  const toggleGroup = (index) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedGroups(newExpanded);
  };

  const getParameterSummary = (parameters) => {
    const summary = [];
    PARAMETER_GROUPS.forEach(group => {
      const groupValues = group.parameters.map(param => 
        getParameterDisplayValue(parameters[param.key])
      );
      summary.push(`${group.title}: ${groupValues.join(', ')}`);
    });
    return summary.join(' | ');
  };

  const getResultColor = (result) => {
    if (result.toLowerCase().includes('win')) return '#28a745';
    if (result.toLowerCase().includes('loss')) return '#dc3545';
    return '#6c757d';
  };

  const calculateWinRate = (results) => {
    const total = Object.values(results).reduce((sum, count) => sum + count, 0);
    const wins = Object.entries(results)
      .filter(([result]) => result.toLowerCase().includes('win'))
      .reduce((sum, [, count]) => sum + count, 0);
    
    return total > 0 ? ((wins / total) * 100).toFixed(1) : '0.0';
  };

  if (loading) {
    return (
      <div className="historical-data loading">
        <h2>Loading Historical Data...</h2>
      </div>
    );
  }

  return (
    <div className="historical-data">
      <div className="historical-header">
        <h2>Historical Data Analysis - {selectedStrategy || 'All Strategies'}</h2>
        
        {/* Strategy Filter */}
        <div className="strategy-filter">
          <label>Filter by Strategy: </label>
          <select 
            value={selectedStrategy || ''} 
            onChange={(e) => setSelectedStrategy(e.target.value || null)}
          >
            <option value="">All Strategies</option>
            {statistics?.strategies.map(strat => (
              <option key={strat} value={strat}>{strat}</option>
            ))}
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="view-mode-selector">
          <button
            className={`view-btn ${viewMode === 'grouped' ? 'active' : ''}`}
            onClick={() => setViewMode('grouped')}
          >
            Grouped View
          </button>
          <button
            className={`view-btn ${viewMode === 'chronological' ? 'active' : ''}`}
            onClick={() => setViewMode('chronological')}
          >
            Chronological View
          </button>
        </div>
      </div>

      {/* Statistics Summary */}
      {statistics && (
        <div className="statistics-summary">
          <h3>Summary Statistics</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Total Trades:</span>
              <span className="stat-value">{statistics.totalTrades}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Unique Patterns:</span>
              <span className="stat-value">{statistics.uniqueParameterCombinations}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Date Range:</span>
              <span className="stat-value">
                {statistics.dateRange.first} - {statistics.dateRange.last}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Overall Win Rate:</span>
              <span className="stat-value">
                {calculateWinRate(statistics.results)}%
              </span>
            </div>
          </div>
          
          <div className="results-breakdown">
            <h4>Results Breakdown:</h4>
            {Object.entries(statistics.results).map(([result, count]) => (
              <span 
                key={result} 
                className="result-badge"
                style={{ backgroundColor: getResultColor(result) }}
              >
                {result}: {count}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Historical Data Display */}
      {historicalData.length === 0 ? (
        <div className="no-data">
          <h3>No Historical Data Found</h3>
          <p>Start recording trades to build your historical database.</p>
        </div>
      ) : (
        <div className="historical-content">
          <h3>
            Parameter Combinations ({historicalData.length} unique patterns)
          </h3>
          
          {historicalData.map((group, index) => (
            <div key={index} className="parameter-group-card">
              <div 
                className="group-header"
                onClick={() => toggleGroup(index)}
              >
                <div className="group-info">
                  <h4>Pattern #{index + 1}</h4>
                  <div className="group-stats">
                    <span className="occurrence-count">
                      {group.totalOccurrences} occurrence{group.totalOccurrences !== 1 ? 's' : ''}
                    </span>
                    <span className="win-rate">
                      Win Rate: {calculateWinRate(group.results)}%
                    </span>
                    <span className="date-range">
                      {group.firstSeen} - {group.lastSeen}
                    </span>
                  </div>
                </div>
                
                <div className="results-preview">
                  {Object.entries(group.results).map(([result, count]) => (
                    <span 
                      key={result}
                      className="result-preview"
                      style={{ color: getResultColor(result) }}
                    >
                      {result}: {count}
                    </span>
                  ))}
                </div>
                
                <div className="expand-icon">
                  {expandedGroups.has(index) ? '▼' : '▶'}
                </div>
              </div>

              {expandedGroups.has(index) && (
                <div className="group-details">
                  {/* Parameter Details */}
                  <div className="parameters-display">
                    <h5>Parameter Combination:</h5>
                    {PARAMETER_GROUPS.map((paramGroup, groupIndex) => (
                      <div key={groupIndex} className="param-group-display">
                        <strong>{paramGroup.title}:</strong>
                        <div className="param-values">
                          {paramGroup.parameters.map(param => (
                            <span 
                              key={param.key} 
                              className={`param-value ${group.parameters[param.key] ? 'yes' : 'no'}`}
                            >
                              {param.label.split(':')[0]}: {getParameterDisplayValue(group.parameters[param.key])}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Individual Trades */}
                  <div className="trades-list">
                    <h5>Individual Trade Records:</h5>
                    {group.trades
                      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                      .map((trade, tradeIndex) => (
                        <div key={trade.id} className="trade-record">
                          <div className="trade-header">
                            <span className="trade-number">#{tradeIndex + 1}</span>
                            <span className="trade-date">{trade.date}</span>
                            <span 
                              className="trade-result"
                              style={{ color: getResultColor(trade.result) }}
                            >
                              {trade.result}
                            </span>
                          </div>
                          {trade.comments && (
                            <div className="trade-comments">
                              <strong>Comments:</strong> {trade.comments}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="action-buttons">
        <button 
          className="action-btn secondary-btn" 
          onClick={loadHistoricalData}
        >
          Refresh Data
        </button>
        <button 
          className="action-btn primary-btn" 
          onClick={() => {
            const result = dbService.exportTrades();
            if (result.success) {
              const dataStr = JSON.stringify(result.data, null, 2);
              const dataBlob = new Blob([dataStr], {type: 'application/json'});
              const url = URL.createObjectURL(dataBlob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `trade-history-${new Date().toISOString().split('T')[0]}.json`;
              link.click();
            }
          }}
        >
          Export Data
        </button>
      </div>
    </div>
  );
};

export default HistoricalData;