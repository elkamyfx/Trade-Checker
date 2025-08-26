import React, { useState } from 'react';
import { PARAMETER_GROUPS, initializeParameters, validateParameters } from './parameters';
import dbService from '../database';

const RecordTrade = ({ strategy }) => {
  const [parameters, setParameters] = useState(initializeParameters());
  const [result, setResult] = useState('');
  const [comments, setComments] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleParameterChange = (paramKey, value) => {
    setParameters(prev => ({
      ...prev,
      [paramKey]: value
    }));
  };

  const handleResultChange = (resultValue) => {
    setResult(resultValue);
  };

  const handleSave = () => {
    // Validate all parameters are set
    if (!validateParameters(parameters)) {
      setMessage({
        type: 'error',
        text: 'Please fill in all 15 parameters before saving.'
      });
      return;
    }

    // Validate result is set
    if (!result) {
      setMessage({
        type: 'error', 
        text: 'Please select a trade result before saving.'
      });
      return;
    }

    // Save to database
    const saveResult = dbService.saveTrade(strategy, parameters, result, comments);
    
    if (saveResult.success) {
      setMessage({
        type: 'success',
        text: `Trade record saved successfully! Trade ID: ${saveResult.trade.id}`
      });
      
      // Reset form
      setParameters(initializeParameters());
      setResult('');
      setComments('');
    } else {
      setMessage({
        type: 'error',
        text: `Error saving trade: ${saveResult.error}`
      });
    }

    // Clear message after 5 seconds
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleReset = () => {
    setParameters(initializeParameters());
    setResult('');
    setComments('');
    setMessage({ type: '', text: '' });
  };

  return (
    <div className="record-trade">
      <h2>Record Trade - {strategy}</h2>
      
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

      <div className="result-section">
        <h3>Trade Result</h3>
        <div className="result-options">
          {['Win', 'Loss', 'Break Even', 'Partial Win', 'Partial Loss'].map(resultOption => (
            <button
              key={resultOption}
              className={`result-btn ${result === resultOption ? 'selected' : ''}`}
              onClick={() => handleResultChange(resultOption)}
            >
              {resultOption}
            </button>
          ))}
        </div>
        
        <div className="comments-section">
          <h4>Comments (Optional)</h4>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Add any additional notes about this trade..."
            maxLength={1000}
          />
          <small>{comments.length}/1000 characters</small>
        </div>
      </div>

      <div className="action-buttons">
        <button className="action-btn primary-btn" onClick={handleSave}>
          Save Trade Record
        </button>
        <button className="action-btn secondary-btn" onClick={handleReset}>
          Reset Form
        </button>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
        <h4>Progress Summary</h4>
        <p>
          Parameters filled: {Object.values(parameters).filter(v => v !== null).length}/15
          {result && ' | Result selected: ' + result}
        </p>
      </div>
    </div>
  );
};

export default RecordTrade;