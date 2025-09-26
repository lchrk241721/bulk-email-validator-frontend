import React from 'react';
import './MakeIntegration.css';

const MakeIntegration = () => {
  return (
    <div className="make-integration">
      <div className="container">
        <header className="integration-header">
          <h1>🔗 Make.com Integration</h1>
          <p>Connect your Bulk Email Validator with Make.com workflows</p>
        </header>

        <div className="integration-content">
          <section className="section">
            <h2>🚀 Quick Start</h2>
            <div className="card">
              <h3>API Endpoint</h3>
              <div className="code-block">
                <strong>POST</strong> https://bulk-email-validator-backend.onrender.com/api/email/make/integration
              </div>
            </div>
          </section>

          <section className="section">
            <h2>📋 Request Format</h2>
            <div className="card">
              <div className="code-block">
                <pre>{`{
  "api_key": "your_api_key_here",
  "emails": [
    "test1@example.com",
    "test2@example.com",
    "invalid-email"
  ],
  "webhook_url": "https://your-webhook-url.com", // Optional
  "format": "json" // Optional: "json" or "csv"
}`}</pre>
              </div>
            </div>
          </section>

          <section className="section">
            <h2>📤 Response Format (JSON)</h2>
            <div className="card">
              <div className="code-block">
                <pre>{`{
  "success": true,
  "summary": {
    "total": 3,
    "valid": 2,
    "invalid": 1,
    "validity_rate": "66.67",
    "role_accounts": 0
  },
  "results": [
    {
      "email": "test1@example.com",
      "valid": true,
      "checks": {
        "syntax": true,
        "domain": true,
        "disposable": false,
        "roleAccount": false
      },
      "reason": "Valid email address",
      "validation_time": 45
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z"
}`}</pre>
              </div>
            </div>
          </section>

          <section className="section">
            <h2>🛠️ Make.com Setup</h2>
            <div className="steps">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Add HTTP Module</h4>
                  <p>Add an <strong>HTTP → Make a Request</strong> module to your scenario</p>
                </div>
              </div>
              
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>Configure Request</h4>
                  <p>Set the URL to your API endpoint and method to POST</p>
                </div>
              </div>

              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>Set Headers</h4>
                  <p>Add header: <code>Content-Type: application/json</code></p>
                </div>
              </div>

              <div className="step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h4>Request Body</h4>
                  <div className="code-block small">
                    <pre>{`{
  "api_key": "{{1.api_key}}",
  "emails": "{{2.emails}}",
  "format": "json"
}`}</pre>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="section">
            <h2>🎯 Example Use Cases</h2>
            <div className="use-cases">
              <div className="use-case">
                <h4>📊 CRM Contact Validation</h4>
                <p>Validate new CRM contacts automatically and update their status</p>
                <div className="scenario-flow">
                  CRM → Email Validator → Update Contact Status
                </div>
              </div>

              <div className="use-case">
                <h4>📧 Email List Cleaning</h4>
                <p>Schedule weekly validation of your mailing lists</p>
                <div className="scenario-flow">
                  Schedule → Email Validator → Segment Lists
                </div>
              </div>

              <div className="use-case">
                <h4>👥 Lead Qualification</h4>
                <p>Validate leads from forms and route to appropriate sales funnel</p>
                <div className="scenario-flow">
                  Webhook → Email Validator → CRM Routing
                </div>
              </div>
            </div>
          </section>

          <section className="section">
            <h2>🔑 API Key</h2>
            <div className="card">
              <p>Your API key for Make.com integration:</p>
              <div className="api-key-display">
                <code>make_default_key_123</code>
                <button 
                  className="copy-btn"
                  onClick={() => navigator.clipboard.writeText('make_default_key_123')}
                >
                  Copy
                </button>
              </div>
              <small>Add this to your Make.com scenario configuration</small>
            </div>
          </section>

          <section className="section">
            <h2>🧪 Test Your Integration</h2>
            <div className="card">
              <p>Test the API endpoint directly:</p>
              <div className="test-buttons">
                <button 
                  className="test-btn"
                  onClick={() => window.open('https://bulk-email-validator-backend.onrender.com/api/email/make-webhook-test', '_blank')}
                >
                  Test Connection
                </button>
                <button 
                  className="test-btn secondary"
                  onClick={() => {
                    const testData = {
                      api_key: "make_default_key_123",
                      emails: ["test@example.com", "invalid-email"],
                      format: "json"
                    };
                    navigator.clipboard.writeText(JSON.stringify(testData, null, 2));
                    alert('Test data copied to clipboard!');
                  }}
                >
                  Copy Test Data
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default MakeIntegration;