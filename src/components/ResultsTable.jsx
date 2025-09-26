import React, { useState, useMemo } from 'react';

const ResultsTable = ({ results }) => {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filteredResults = useMemo(() => {
    return results.filter(result => {
      const matchesFilter = filter === 'all' || 
        (filter === 'valid' && result.valid) || 
        (filter === 'invalid' && !result.valid);
      
      const matchesSearch = result.email.toLowerCase().includes(search.toLowerCase());
      
      return matchesFilter && matchesSearch;
    });
  }, [results, filter, search]);

  const exportToCSV = () => {
    const headers = ['Email', 'Status', 'Reason', 'Validation Time (ms)'];
    const csvData = filteredResults.map(result => [
      result.email,
      result.valid ? 'Valid' : 'Invalid',
      result.reason,
      result.validationTime
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'email_validation_results.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="results-container">
      <div className="results-controls">
        <div className="filters">
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Emails</option>
            <option value="valid">Valid Only</option>
            <option value="invalid">Invalid Only</option>
          </select>
          
          <input
            type="text"
            placeholder="Search emails..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <button onClick={exportToCSV} className="export-btn">
          Export to CSV
        </button>
      </div>

      <div className="table-container">
        <table className="results-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Status</th>
              <th>Syntax</th>
              <th>Domain</th>
              <th>Disposable</th>
              <th>SMTP</th>
              <th>Role Account</th>
              <th>Reason</th>
              <th>Time (ms)</th>
            </tr>
          </thead>
          <tbody>
            {filteredResults.map((result, index) => (
              <tr key={index} className={result.valid ? 'valid' : 'invalid'}>
                <td className="email-cell">{result.email}</td>
                <td className="status-cell">
                  <span className={`status-badge ${result.valid ? 'valid' : 'invalid'}`}>
                    {getStatusIcon(result.valid)} {getStatusText(result.valid)}
                  </span>
                </td>
                <td className="check-cell">
                  {result.checks.syntax ? '✅' : '❌'}
                </td>
                <td className="check-cell">
                  {result.checks.domain ? '✅' : '❌'}
                </td>
                <td className="check-cell">
                  {result.checks.disposable ? '❌' : '✅'}
                </td>
                <td className="check-cell">
                  {result.checks.smtp ? '✅' : result.checks.smtp === undefined ? '⚪' : '❌'}
                </td>
                <td className="check-cell">
                  {result.checks.roleAccount ? '👥' : '👤'}
                </td>
                <td>{result.reason}</td>
                <td>{result.validationTime}ms</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredResults.length === 0 && (
          <p className="no-results">No emails match your filters</p>
        )}
      </div>
    </div>
  );
};

export default ResultsTable;