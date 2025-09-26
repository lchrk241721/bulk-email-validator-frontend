import React, { useState } from 'react';

const API_BASE = 'https://bulk-email-validator-backend.onrender.com/api/email';

const EmailValidator = ({ onValidationComplete, onValidationStart, onProgressUpdate, loading }) => {
  const [emails, setEmails] = useState('');
  const [file, setFile] = useState(null);
  const [enableSMTP, setEnableSMTP] = useState('');

  const handleTextSubmit = async (e) => {
    e.preventDefault();
    if (!emails.trim()) return;

    const emailList = emails.split('\n')
      .map(email => email.trim())
      .filter(email => email.length > 0);

    await validateEmailsWithProgress(emailList);
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      // First parse the CSV
      const response = await fetch(`${API_BASE}/upload-csv`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload file');
      }

      const data = await response.json();
      
      // Then validate the emails with progress
      await validateEmailsWithProgress(data.emails);
    } catch (error) {
      alert('Error processing file: ' + error.message);
    }
  };

  const validateEmailsWithProgress = async (emailList) => {
    onValidationStart();
    
    try {
      const response = await fetch(`${API_BASE}/validate-bulk-progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emails: emailList,enableSMTP: enableSMTP  }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          // Process any remaining data in buffer
          if (buffer.trim()) {
            processBuffer(buffer);
          }
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        // Keep the last incomplete line in buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ') && line.length > 6) {
            try {
              const jsonData = line.slice(6); // Remove 'data: ' prefix
              
              // Skip empty lines or heartbeat messages
              if (jsonData.trim() === '') continue;
              
              const data = JSON.parse(jsonData);
              
              if (data.type === 'progress') {
                onProgressUpdate(data.data);
              } else if (data.type === 'complete') {
                onValidationComplete(data.data);
                return;
              } else if (data.type === 'error') {
                throw new Error(data.data.error);
              }
            } catch (e) {
              console.warn('Error parsing SSE data, skipping line:', e.message, 'Line:', line);
              // Continue processing other lines instead of stopping
            }
          }
        }
      }
    } catch (error) {
      console.error('Validation error:', error);
      alert('Validation error: ' + error.message);
      onValidationComplete({
        results: [],
        summary: {
          total: 0,
          valid: 0,
          invalid: 0,
          validityRate: 0,
          roleAccounts: 0,
          smtpVerified: 0
        }
      });
    }
  };

  // Helper function to process buffer
  const processBuffer = (buffer) => {
    const lines = buffer.split('\n');
    for (const line of lines) {
      if (line.startsWith('data: ') && line.length > 6) {
        try {
          const jsonData = line.slice(6);
          if (jsonData.trim() === '') continue;
          
          const data = JSON.parse(jsonData);
          
          if (data.type === 'progress') {
            onProgressUpdate(data.data);
          } else if (data.type === 'complete') {
            onValidationComplete(data.data);
          }
        } catch (e) {
          console.warn('Error processing buffer line:', e.message);
        }
      }
    }
  };

  const downloadTemplate = () => {
    const template = 'email\njohn@example.com\njane@example.com';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'email_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="validator-container">
      <div className="smtp-toggle-section">
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={enableSMTP}
            onChange={(e) => setEnableSMTP(e.target.checked)}
            disabled={loading}
          />
          <span className="toggle-slider"></span>
        </label>
        <div className="toggle-label">
          <strong>Enable SMTP Verification</strong>
          <small>Checks if mailbox actually exists (slower but more accurate)</small>
        </div>
      </div>
      <div className="input-methods">
        {/* Text Area Method */}
        <div className="input-section">
          <h3>Paste Emails</h3>
          <form onSubmit={handleTextSubmit}>
            <textarea
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              placeholder="Enter emails, one per line:&#10;john@example.com&#10;jane@example.com"
              rows={10}
              disabled={loading}
            />
            <button type="submit" disabled={loading || !emails.trim()}>
              {loading ? 'Validating...' : 'Validate Emails'}
            </button>
          </form>
        </div>

        {/* File Upload Method */}
        <div className="input-section">
          <h3>Upload CSV File</h3>
          <form onSubmit={handleFileUpload}>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files[0])}
              disabled={loading}
            />
            <button type="submit" disabled={loading || !file}>
              {loading ? 'Validating...' : 'Upload & Validate'}
            </button>
            <button type="button" onClick={downloadTemplate} className="secondary" disabled={loading}>
              Download Template
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmailValidator;