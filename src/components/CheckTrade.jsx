import React, { useState } from 'react';
import { PARAMETER_GROUPS, initializeParameters, validateParameters } from './parameters';
import dbService from '../database';

const CheckTrade = ({ strategy }) => {
  const [parameters, setParameters] = useState(initializeParameters());
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleParameterChange = (paramKey, value) => {
    setParameters(prev => ({
      ...prev,
      [paramKey]: value
    }));
  };

  const handleCheck = async () => {
    // Validate all parameters are set
    if (!validateParameters(parameters)) {
      setMessage({
        type: 'error',
        text: 'Please fill in all 15 parameters before checking.'
      });
      return;
    }

    setIsSearching(true);
    setMessage({ type: '', text: '' });

    try {
      // Search for historical matches
      const result = dbService.findHistoricalMatches(strategy, parameters);
      
      if (result.success) {
        setSearchResults(result);
        
        if (result.totalOccurrences === 0) {
          setMessage({
            type: 'info',
            text: 'No historical matches found for this parameter combination.'
          });
        } else {
          setMessage({
            type: 'success',
            text: `Found ${result.totalOccurrences} historical occurrence(s) matching these parameters.`
          });
        }
      } else {
        setMessage({
          type: 'error',
          text: `Error searching historical data: ${result.error}`
        });
        setSearchResults(null);
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Unexpected error: ${error.message}`
      });
      setSearchResults(null);
    } finally {
      setIsSearching(false);
    }

    // Clear message after 5 seconds
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleReset = () => {
    setParameters(initializeParameters());
    setSearchResults(null);
    setMessage({ type: '', text: '' });
  };

  return (
    <div className="check-trade">
      <h2>Check Trade - {strategy}</h2>
      
      {message.text && (
        <div className={`${message.type}-message`}>
          {message.text}
        </div>
      )}

      <div className="parameters-container">
        {PARAMETER_GROUPS.map((group, groupIndex) => (
          <div key={groupIndex} className="parameter-group">
            <h3>{group.title}</h3>
            {group.parameters.map((param) => (
              <div key={param.key} className="parameter-row">
                <div className="parameter-label" title={param.description}>
                  {param.label}
                </div>
                <div className="parameter-options">
                  <button
                    className={`option-btn yes ${parameters[param.key] === true ? 'selected' : ''}`}
                    onClick={() => handleParameterChange(param.key, true)}
                  >
                    Yes
                  </button>
                  <button
                    className={`option-btn no ${parameters[param.key] === false ? 'selected' : ''}`}
                    onClick={() => handleParameterChange(param.key, false)}
                  >
                    No
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="action-buttons">
        <button 
          className="action-btn primary-btn" 
          onClick={handleCheck}
          disabled={isSearching}
        >
          {isSearching ? 'Searching...' : 'Check Historical Data'}
        </button>
        <button className="action-btn secondary-btn" onClick={handleReset}>
          Reset Form
        </button>
      </div>

      {searchResults && (
        <div className="historical-results">
          <h3>Historical Analysis Results</h3>
          
          {searchResults.totalOccurrences === 0 ? (
            <div className="no-results">
              <p>No historical trades found with this exact parameter combination.</p>
              <p>This would be a new unique scenario for {strategy}.</p>
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: '20px', padding: '15px', background: '#e3f2fd', borderRadius: '8px' }}>
                <h4>Summary</h4>
                <p><strong>Total Historical Occurrences:</strong> {searchResults.totalOccurrences}</p>
                <p><strong>Unique Result Types:</strong> {searchResults.matches.length}</p>
              </div>

              {searchResults.matches.map((match, index) => (
                <div key={index} className="result-item">
                  <div className="result-header">
                    <span className={`result-outcome ${match.result.toLowerCase().includes('win') ? 'win' : 'loss'}`}>
                      {match.result}
                    </span>
                    <span className="result-count">
                      Occurred {match.count} time{match.count !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <div className="result-dates">
                    <strong>Dates:</strong> {match.dates.join(', ')}
                  </div>

                  {match.comments && match.comments.length > 0 && (
                    <div className="comments-section">
                      <h5>Associated Comments:</h5>
                      {match.comments.map((commentObj, commentIndex) => (
                        <div key={commentIndex} className="result-comments">
                          <div style={{ fontSize: '0.9em', color: '#666', marginBottom: '5px' }}>
                            {commentObj.date}
                          </div>
                          <div>{commentObj.comment}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <div style={{ marginTop: '20px', padding: '15px', background: '#fff3cd', borderRadius: '8px' }}>
                <h4>Statistical Analysis</h4>
                {(() => {
                  const winCount = searchResults.matches
                    .filter(m => m.result.toLowerCase().includes('win'))
                    .reduce((sum, m) => sum + m.count, 0);
                  const lossCount = searchResults.matches
                    .filter(m => m.result.toLowerCase().includes('loss'))
                    .reduce((sum, m) => sum + m.count, 0);
                  const otherCount = searchResults.totalOccurrences - winCount - lossCount;
                  
                  return (
                    <div>
                      <p><strong>Win Rate:</strong> {((winCount / searchResults.totalOccurrences) * 100).toFixed(1)}% ({winCount}/{searchResults.totalOccurrences})</p>
                      <p><strong>Loss Rate:</strong> {((lossCount / searchResults.totalOccurrences) * 100).toFixed(1)}% ({lossCount}/{searchResults.totalOccurrences})</p>
                      {otherCount > 0 && (
                        <p><strong>Other Results:</strong> {((otherCount / searchResults.totalOccurrences) * 100).toFixed(1)}% ({otherCount}/{searchResults.totalOccurrences})</p>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
        <h4>Progress Summary</h4>
        <p>
          Parameters filled: {Object.values(parameters).filter(v => v !== null).length}/15
        </p>
      </div>
    </div>
  );
};

export default CheckTrade;