import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title
} from 'chart.js';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, Title);

const Summary = ({ summary }) => {
  if (!summary) return null;

  // Safe property access with fallbacks
  const total = summary.total || 0;
  const valid = summary.valid || 0;
  const invalid = summary.invalid || 0;
  //const smtpVerified = summary.smtpVerified || 0;
  const roleAccounts = summary.roleAccounts || 0;

  // Prepare data for the chart
  const chartData = {
    labels: ['Valid Emails', 'Invalid Emails'],
    datasets: [
      {
        data: [summary.valid, summary.invalid],
        backgroundColor: [
          '#10B981', // Green for valid
          '#EF4444', // Red for invalid
        ],
        borderColor: [
          '#059669',
          '#DC2626',
        ],
        borderWidth: 2,
        hoverBackgroundColor: [
          '#34D399',
          '#F87171',
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            size: 12,
            weight: '500',
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      },
      title: {
        display: true,
        text: 'Email Validation Distribution',
        font: {
          size: 16,
          weight: 'bold',
        },
        padding: 20,
      },
    },
    cutout: '60%', // Makes it a doughnut chart
  };

  // Calculate percentages
  const validPercentage = ((summary.valid / summary.total) * 100).toFixed(1);
  const invalidPercentage = ((summary.invalid / summary.total) * 100).toFixed(1);
  //const smtpPercentage = ((summary.smtpVerified / summary.total) * 100).toFixed(1);
  const rolePercentage = ((summary.roleAccounts / summary.total) * 100).toFixed(1);

  return (
    <div className="summary">
      <h2>📊 Validation Summary</h2>
      
      <div className="summary-content">
        {/* Chart Section */}
        <div className="chart-section">
          <div className="chart-container">
            <Doughnut data={chartData} options={chartOptions} />
          </div>
          
          {/* Center stats for doughnut chart */}
          <div className="chart-center-stats">
            <div className="total-count">{summary.total}</div>
            <div className="total-label">Total Emails</div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-section">
          <div className="stat-cards">
            <div className="stat-card total">
              <div className="stat-icon">📨</div>
              <div className="stat-content">
                <h3>{summary.total.toLocaleString()}</h3>
                <p>Total Emails</p>
              </div>
            </div>
            
            <div className="stat-card valid">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <h3>{summary.valid.toLocaleString()}</h3>
                <p>Valid Emails</p>
                <span className="percentage">{validPercentage}%</span>
              </div>
            </div>
            
            <div className="stat-card invalid">
              <div className="stat-icon">❌</div>
              <div className="stat-content">
                <h3>{summary.invalid.toLocaleString()}</h3>
                <p>Invalid Emails</p>
                <span className="percentage">{invalidPercentage}%</span>
              </div>
            </div>
          </div>
            <div className="advanced-stats">             
              <div className="stat-card role">
                <div className="stat-icon">👥</div>
                <div className="stat-content">
                  <h3>{roleAccounts.toLocaleString()}</h3>
                  <p>Role Accounts</p>
                  <span className="percentage">{rolePercentage}%</span>
                </div>
              </div>
            </div>
          {/* Invalid Reasons Breakdown */}
          {summary.invalid > 0 && Object.keys(summary.reasons).length > 0 && (
            <div className="reasons-breakdown">
              <h4>📋 Invalid Email Reasons</h4>
              <div className="reasons-list">
                {Object.entries(summary.reasons).map(([reason, count]) => {
                  const percentage = ((count / summary.total) * 100).toFixed(1);
                  return (
                    <div key={reason} className="reason-item">
                      <div className="reason-header">
                        <span className="reason-text">{reason}</span>
                        <span className="reason-count">{count}</span>
                      </div>
                      <div className="reason-bar">
                        <div 
                          className="reason-bar-fill" 
                          style={{ width: `${(count / summary.invalid) * 100}%` }}
                        />
                      </div>
                      <div className="reason-percentage">{percentage}% of total</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Summary;