import React from 'react';

const Summary = ({ summary }) => {
  if (!summary) return null;

  return (
    <div className="summary">
      <h2>Validation Summary</h2>
      
      <div className="summary-stats">
        <div className="stat-card total">
          <h3>{summary.total}</h3>
          <p>Total Emails</p>
        </div>
        
        <div className="stat-card valid">
          <h3>{summary.valid}</h3>
          <p>Valid Emails</p>
          <small>{((summary.valid / summary.total) * 100).toFixed(1)}%</small>
        </div>
        
        <div className="stat-card invalid">
          <h3>{summary.invalid}</h3>
          <p>Invalid Emails</p>
          <small>{((summary.invalid / summary.total) * 100).toFixed(1)}%</small>
        </div>
      </div>

      {summary.invalid > 0 && Object.keys(summary.reasons).length > 0 && (
        <div>
          <h3>Reasons for Invalid Emails:</h3>
          <ul>
            {Object.entries(summary.reasons).map(([reason, count]) => (
              <li key={reason}>
                <strong>{reason}:</strong> {count} emails ({(count / summary.total * 100).toFixed(1)}%)
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Summary;