import React, { useState, useMemo } from 'react';

const ResultsTable = ({ results, summary, loading }) => {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('email');

  if (loading) {
    return (
      <div className="validation-results loading">
        <div className="loading-spinner"></div>
        <p>Validating emails...</p>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="validation-results empty">
        <p>No validation results to display. Upload some emails to get started!</p>
      </div>
    );
  }

  // Get role breakdown for enhanced display
  const getRoleBreakdown = () => {
    const breakdown = {};
    results.forEach(result => {
      if (result.checks.roleAccount && result.details?.roleAccount) {
        const type = result.details.roleAccount.type || 'unknown';
        breakdown[type] = (breakdown[type] || 0) + 1;
      }
    });
    return breakdown;
  };

  const roleBreakdown = getRoleBreakdown();

  const filteredResults = useMemo(() => {
    let filtered = results.filter(result => {
      const matchesFilter = 
        filter === 'all' || 
        (filter === 'valid' && result.valid) || 
        (filter === 'invalid' && !result.valid) ||
        (filter === 'role-accounts' && result.checks.roleAccount) ||
        (filter === 'disposable' && result.checks.disposable);
      
      const matchesSearch = result.email.toLowerCase().includes(search.toLowerCase());
      
      return matchesFilter && matchesSearch;
    });

    // Sort results
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'email':
          return a.email.localeCompare(b.email);
        case 'validity':
          return (a.valid === b.valid) ? 0 : a.valid ? -1 : 1;
        case 'role':
          return (a.checks.roleAccount === b.checks.roleAccount) ? 0 : a.checks.roleAccount ? -1 : 1;
        case 'validationTime':
          return a.validationTime - b.validationTime;
        default:
          return 0;
      }
    });
  }, [results, filter, search, sortBy]);

  const getRoleBadge = (result) => {
    if (!result.checks.roleAccount) {
      return null;
    }

    const roleType = result.details?.roleAccount?.type || 'role_account';
    const confidence = result.details?.roleAccount?.confidence || 'medium';

    const confidenceColors = {
      high: '#dc3545',
      medium: '#fd7e14',
      low: '#ffc107'
    };

    const typeLabels = {
      exact_prefix: 'Role Prefix',
      role_with_numbers: 'Role + Numbers',
      role_combination: 'Role Combo',
      generic_role: 'Generic Role',
      departmental: 'Department',
      location_role: 'Location Role',
      role_account: 'Role Account'
    };

    return (
      <span 
        className="role-badge"
        style={{ 
          backgroundColor: confidenceColors[confidence],
          border: `2px solid ${confidenceColors[confidence]}`
        }}
        title={`Confidence: ${confidence}`}
      >
        {typeLabels[roleType] || roleType}
      </span>
    );
  };

  const getStatusIcon = (result) => {
    if (!result.valid) return '❌';
    if (result.checks.roleAccount) return '👥';
    return '✅';
  };

  const exportToCSV = () => {
    const headers = 'Email,Valid,Role Account,Role Type,Confidence,Syntax Check,Domain Check,Disposable Check,Reason,Validation Time (ms)\n';
    
    const csvRows = results.map(result => {
      const roleType = result.details?.roleAccount?.type || 'N/A';
      const confidence = result.details?.roleAccount?.confidence || 'N/A';
      
      const row = [
        `"${result.email.replace(/"/g, '""')}"`,
        result.valid ? 'YES' : 'NO',
        result.checks.roleAccount ? 'YES' : 'NO',
        `"${roleType}"`,
        `"${confidence}"`,
        result.checks.syntax ? 'PASS' : 'FAIL',
        result.checks.domain ? 'PASS' : 'FAIL',
        result.checks.disposable ? 'FAIL' : 'PASS',
        `"${result.reason.replace(/"/g, '""')}"`,
        result.validationTime
      ];
      return row.join(',');
    });

    const csvContent = headers + csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'email-validation-results.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToJSON = () => {
    const jsonData = {
      results: results,
      summary: summary,
      timestamp: new Date().toISOString()
    };
    const jsonString = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'email-validation-results.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="validation-results">
      {/* Enhanced Summary Section */}
      {summary && (
        <div className="results-summary enhanced">
          <h3>Validation Summary</h3>
          <div className="summary-grid">
            <div className="summary-card total">
              <div className="summary-value">{summary.total}</div>
              <div className="summary-label">Total Emails</div>
            </div>
            <div className="summary-card valid">
              <div className="summary-value">{summary.valid}</div>
              <div className="summary-label">Valid Emails</div>
              <div className="summary-rate">{summary.validityRate}%</div>
            </div>
            <div className="summary-card invalid">
              <div className="summary-value">{summary.invalid}</div>
              <div className="summary-label">Invalid Emails</div>
            </div>
            <div className="summary-card role-accounts">
              <div className="summary-value">{summary.roleAccounts || 0}</div>
              <div className="summary-label">Role Accounts</div>
              {summary.roleAccounts > 0 && (
                <div className="role-breakdown">
                  {Object.entries(roleBreakdown).map(([type, count]) => (
                    <span key={type} className="breakdown-item">
                      {type}: {count}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Role Accounts Insight */}
          {summary.roleAccounts > 0 && (
            <div className="role-insights">
              <h4>👥 Role Accounts Detected</h4>
              <div className="insight-cards">
                <div className="insight-card">
                  <strong>{summary.roleAccounts}</strong> role accounts found
                  ({((summary.roleAccounts / summary.valid) * 100).toFixed(1)}% of valid emails)
                </div>
                <div className="insight-card">
                  Common types: {Object.keys(roleBreakdown).slice(0, 3).join(', ')}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Enhanced Controls */}
      <div className="results-controls enhanced">
        {/* Tabs */}
        <div className="results-tabs">
          <button 
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All ({results.length})
          </button>
          <button 
            className={filter === 'valid' ? 'active' : ''}
            onClick={() => setFilter('valid')}
          >
            ✅ Valid ({results.filter(r => r.valid).length})
          </button>
          <button 
            className={filter === 'invalid' ? 'active' : ''}
            onClick={() => setFilter('invalid')}
          >
            ❌ Invalid ({results.filter(r => !r.valid).length})
          </button>
          <button 
            className={filter === 'role-accounts' ? 'active' : ''}
            onClick={() => setFilter('role-accounts')}
          >
            👥 Role Accounts ({results.filter(r => r.checks.roleAccount).length})
          </button>
          <button 
            className={filter === 'disposable' ? 'active' : ''}
            onClick={() => setFilter('disposable')}
          >
            🚫 Disposable ({results.filter(r => r.checks.disposable).length})
          </button>
        </div>

        {/* Search and Sort Controls */}
        <div className="filters-sort-container">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search emails..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="sort-controls">
            <label>Sort by:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="email">Email</option>
              <option value="validity">Validity</option>
              <option value="role">Role Account</option>
              <option value="validationTime">Validation Time</option>
            </select>
          </div>

          <div className="export-options">
            <button onClick={exportToCSV} className="export-btn">
              📊 Export CSV
            </button>
            <button onClick={exportToJSON} className="export-btn">
              📄 Export JSON
            </button>
          </div>
        </div>

        <div className="results-count">
          Showing {filteredResults.length} of {results.length} emails
        </div>
      </div>

      {/* Enhanced Table */}
      <div className="table-container enhanced">
        <table className="results-table enhanced">
          <thead>
            <tr>
              <th>Status</th>
              <th>Email Address</th>
              <th>Role Account</th>
              <th>Checks</th>
              <th>Reason</th>
              <th>Time (ms)</th>
            </tr>
          </thead>
          <tbody>
            {filteredResults.map((result, index) => (
              <tr key={index} className={result.valid ? 'valid' : 'invalid'}>
                <td className="status-cell">
                  <span className="status-icon">
                    {getStatusIcon(result)}
                  </span>
                </td>
                <td className="email-cell">
                  <div className="email-address">{result.email}</div>
                  {!result.valid && (
                    <div className="error-details">{result.reason}</div>
                  )}
                </td>
                <td className="role-cell">
                  {result.checks.roleAccount ? (
                    <div className="role-account-info">
                      {getRoleBadge(result)}
                      <div className="role-confidence">
                        Confidence: {result.details?.roleAccount?.confidence || 'medium'}
                      </div>
                    </div>
                  ) : (
                    <span className="no-role">Personal</span>
                  )}
                </td>
                <td className="checks-cell">
                  <div className="checks-grid">
                    <span className={`check ${result.checks.syntax ? 'pass' : 'fail'}`}>
                      Syntax {result.checks.syntax ? '✅' : '❌'}
                    </span>
                    <span className={`check ${result.checks.domain ? 'pass' : 'fail'}`}>
                      Domain {result.checks.domain ? '✅' : '❌'}
                    </span>
                    <span className={`check ${!result.checks.disposable ? 'pass' : 'fail'}`}>
                      Disposable {!result.checks.disposable ? '✅' : '❌'}
                    </span>
                  </div>
                </td>
                <td className="reason-cell">
                  {result.reason}
                </td>
                <td className="time-cell">
                  {result.validationTime}ms
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredResults.length === 0 && (
          <div className="no-results">
            <p>No emails match your filters</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .validation-results {
          margin-top: 2rem;
        }

        /* Enhanced Summary */
        .results-summary.enhanced {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          margin-bottom: 1.5rem;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .summary-card {
          text-align: center;
          padding: 1rem;
          border-radius: 8px;
          border: 2px solid #e9ecef;
        }

        .summary-card.total {
          border-color: #6c757d;
          background: #f8f9fa;
        }

        .summary-card.valid {
          border-color: #28a745;
          background: #f8fff9;
        }

        .summary-card.invalid {
          border-color: #dc3545;
          background: #fff8f8;
        }

        .summary-card.role-accounts {
          border-color: #fd7e14;
          background: #fffaf3;
        }

        .summary-value {
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 0.5rem;
        }

        .summary-label {
          font-size: 0.9rem;
          color: #666;
          margin-bottom: 0.5rem;
        }

        .summary-rate {
          font-size: 0.8rem;
          font-weight: bold;
        }

        .role-breakdown {
          margin-top: 0.5rem;
          font-size: 0.7rem;
        }

        .breakdown-item {
          display: block;
          padding: 0.1rem 0.3rem;
          background: #e9ecef;
          border-radius: 4px;
          margin: 0.1rem 0;
        }

        /* Role Insights */
        .role-insights {
          margin-top: 1rem;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
          border-left: 4px solid #fd7e14;
        }

        .insight-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
          margin-top: 0.5rem;
        }

        .insight-card {
          padding: 0.75rem;
          background: white;
          border-radius: 6px;
          font-size: 0.9rem;
        }

        /* Enhanced Controls */
        .results-controls.enhanced {
          margin-bottom: 1.5rem;
        }

        .results-tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }

        .results-tabs button {
          padding: 0.5rem 1rem;
          border: 1px solid #ddd;
          background: white;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .results-tabs button.active {
          background: #007bff;
          color: white;
          border-color: #007bff;
        }

        .results-tabs button:hover:not(.active) {
          background: #f8f9fa;
        }

        .filters-sort-container {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 0.5rem;
          flex-wrap: wrap;
        }

        .search-input {
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          min-width: 200px;
        }

        .sort-controls {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .sort-controls select {
          padding: 0.3rem 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .export-options {
          display: flex;
          gap: 0.5rem;
          margin-left: auto;
        }

        .export-btn {
          padding: 0.5rem 1rem;
          background: #28a745;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.3s ease;
        }

        .export-btn:hover {
          background: #218838;
        }

        .results-count {
          font-size: 0.9rem;
          color: #666;
          text-align: right;
        }

        /* Enhanced Table */
        .table-container.enhanced {
          overflow-x: auto;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .results-table.enhanced {
          width: 100%;
          border-collapse: collapse;
        }

        .results-table.enhanced th {
          background: #f8f9fa;
          padding: 1rem;
          text-align: left;
          font-weight: bold;
          border-bottom: 2px solid #dee2e6;
        }

        .results-table.enhanced td {
          padding: 1rem;
          border-bottom: 1px solid #dee2e6;
        }

        .results-table.enhanced tr.valid {
          background: #f8fff9;
        }

        .results-table.enhanced tr.invalid {
          background: #fff8f8;
        }

        .results-table.enhanced tr:hover {
          background: #e3f2fd;
        }

        /* Table Cells */
        .status-cell {
          text-align: center;
          width: 60px;
        }

        .status-icon {
          font-size: 1.2rem;
        }

        .email-cell {
          max-width: 250px;
        }

        .email-address {
          font-weight: 500;
          word-break: break-all;
        }

        .error-details {
          font-size: 0.8rem;
          color: #dc3545;
          margin-top: 0.3rem;
        }

        .role-cell {
          min-width: 150px;
        }

        .role-account-info {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }

        .role-badge {
          padding: 0.2rem 0.5rem;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: bold;
          color: white;
          text-align: center;
        }

        .role-confidence {
          font-size: 0.7rem;
          color: #666;
        }

        .no-role {
          color: #28a745;
          font-weight: 500;
        }

        .checks-cell {
          min-width: 200px;
        }

        .checks-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.3rem;
        }

        .check {
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          font-size: 0.8rem;
          text-align: center;
        }

        .check.pass {
          background: #d4edda;
          color: #155724;
        }

        .check.fail {
          background: #f8d7da;
          color: #721c24;
        }

        .reason-cell {
          max-width: 200px;
          font-size: 0.9rem;
        }

        .time-cell {
          text-align: center;
          font-family: monospace;
          color: #666;
        }

        /* Loading State */
        .validation-results.loading {
          text-align: center;
          padding: 3rem;
        }

        .loading-spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #007bff;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Empty State */
        .validation-results.empty {
          text-align: center;
          padding: 3rem;
          color: #666;
        }

        .no-results {
          text-align: center;
          padding: 2rem;
          color: #666;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .summary-grid {
            grid-template-columns: 1fr 1fr;
          }
          
          .results-tabs {
            flex-direction: column;
          }
          
          .filters-sort-container {
            flex-direction: column;
            align-items: stretch;
          }
          
          .export-options {
            margin-left: 0;
            justify-content: center;
          }
          
          .results-table.enhanced {
            font-size: 0.8rem;
          }
          
          .results-table.enhanced th,
          .results-table.enhanced td {
            padding: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ResultsTable;