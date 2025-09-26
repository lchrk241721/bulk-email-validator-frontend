import React, { useState } from 'react';
import './MakeIntegration.css';

const MakeIntegration = () => {
  const [activeTab, setActiveTab] = useState('documentation');
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  const testIntegration = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    try {
      const response = await fetch('http://localhost:5000/api/email/make/status');
      const data = await response.json();
      
      setTestResult({
        success: true,
        message: 'API is working correctly!',
        data: data
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: 'API connection failed',
        error: error.message
      });
    } finally {
      setIsTesting(false);
    }
  };

  const testWebhook = async () => {
    const webhookUrl = prompt('Enter your webhook URL for testing:');
    if (!webhookUrl) return;

    setIsTesting(true);
    try {
      const response = await fetch('http://localhost:5000/api/email/make/webhook-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          webhook_url: webhookUrl,
          api_key: 'make_default_key_123'
        })
      });
      
      const data = await response.json();
      setTestResult({
        success: data.success,
        message: data.message || data.error,
        data: data
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Webhook test failed',
        error: error.message
      });
    } finally {
      setIsTesting(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="make-integration">
      <div className="container">
        <header className="integration-header">
          <h1>🔗 Make.com Integration</h1>
          <p>Connect your Bulk Email Validator with Make.com workflows</p>
          
          <div className="header-actions">
            <button 
              className={`test-btn ${isTesting ? 'loading' : ''}`}
              onClick={testIntegration}
              disabled={isTesting}
            >
              {isTesting ? 'Testing...' : 'Test API Connection'}
            </button>
            <button 
              className="test-btn secondary"
              onClick={testWebhook}
              disabled={isTesting}
            >
              Test Webhook
            </button>
          </div>
        </header>

        {testResult && (
          <div className={`test-result ${testResult.success ? 'success' : 'error'}`}>
            <h4>{testResult.success ? '✅ Success' : '❌ Error'}</h4>
            <p>{testResult.message}</p>
            {testResult.data && (
              <pre>{JSON.stringify(testResult.data, null, 2)}</pre>
            )}
          </div>
        )}

        <div className="tabs">
          <button 
            className={activeTab === 'documentation' ? 'active' : ''}
            onClick={() => setActiveTab('documentation')}
          >
            📚 Documentation
          </button>
          <button 
            className={activeTab === 'examples' ? 'active' : ''}
            onClick={() => setActiveTab('examples')}
          >
            💡 Examples
          </button>
          <button 
            className={activeTab === 'testing' ? 'active' : ''}
            onClick={() => setActiveTab('testing')}
          >
            🧪 Testing
          </button>
        </div>

        {activeTab === 'documentation' && (
          <div className="tab-content">
            <section className="section">
              <h2>🚀 API Endpoint</h2>
              <div className="card">
                <div className="endpoint-info">
                  <span className="method">POST</span>
                  <code>http://localhost:5000/api/email/make/integration</code>
                  <button 
                    className="copy-btn small"
                    onClick={() => copyToClipboard('http://localhost:5000/api/email/make/integration')}
                  >
                    Copy
                  </button>
                </div>
              </div>
            </section>

            <section className="section">
              <h2>📋 Request Format</h2>
              <div className="card">
                <div className="code-block">
                  <pre>{`{
  "api_key": "make_default_key_123",
  "emails": [
    "test1@example.com",
    "test2@example.com",
    "invalid-email"
  ],
  "webhook_url": "https://your-webhook-url.com", // Optional
  "format": "json" // Optional: "json" or "csv"
}`}</pre>
                  <button 
                    className="copy-btn"
                    onClick={() => copyToClipboard(JSON.stringify({
                      api_key: "make_default_key_123",
                      emails: ["test1@example.com", "test2@example.com", "invalid-email"],
                      webhook_url: "https://your-webhook-url.com",
                      format: "json"
                    }, null, 2))}
                  >
                    Copy
                  </button>
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
                    onClick={() => copyToClipboard('make_default_key_123')}
                  >
                    Copy
                  </button>
                </div>
                <small>Add this to your Make.com scenario configuration</small>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'examples' && (
          <div className="tab-content">
            <section className="section">
              <h2>🛠️ Make.com Scenario Examples</h2>
              
              <div className="example">
                <h3>📧 Email List Validation Workflow</h3>
                <div className="scenario-flow">
                  <div className="step">Google Sheets →</div>
                  <div className="step">HTTP Request (Our API) →</div>
                  <div className="step">Router (Valid/Invalid) →</div>
                  <div className="step">Update Sheets/CRM</div>
                </div>
              </div>

              <div className="example">
                <h3>👥 Lead Qualification</h3>
                <div className="scenario-flow">
                  <div className="step">Web Form →</div>
                  <div className="step">HTTP Request (Our API) →</div>
                  <div className="step">If Valid → Add to CRM</div>
                  <div className="step">If Invalid → Send Notification</div>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'testing' && (
          <div className="tab-content">
            <section className="section">
              <h2>🧪 Test Your Integration</h2>
              
              <div className="test-cards">
                <div className="test-card">
                  <h3>API Status Check</h3>
                  <p>Verify the API is running and accessible</p>
                  <button 
                    className="test-btn"
                    onClick={testIntegration}
                    disabled={isTesting}
                  >
                    {isTesting ? 'Testing...' : 'Test Status'}
                  </button>
                </div>

                <div className="test-card">
                  <h3>Webhook Test</h3>
                  <p>Test webhook delivery to your Make.com scenario</p>
                  <button 
                    className="test-btn secondary"
                    onClick={testWebhook}
                    disabled={isTesting}
                  >
                    Test Webhook
                  </button>
                </div>

                <div className="test-card">
                  <h3>Sample Request</h3>
                  <p>Copy a ready-to-use test payload</p>
                  <button 
                    className="test-btn"
                    onClick={() => {
                      const sampleData = {
                        api_key: "make_default_key_123",
                        emails: ["test@example.com", "invalid-email", "admin@company.com"],
                        format: "json"
                      };
                      copyToClipboard(JSON.stringify(sampleData, null, 2));
                    }}
                  >
                    Copy Test Data
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default MakeIntegration;