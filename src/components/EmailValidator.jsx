import React, { useState } from 'react';

const API_BASE = 'https://bulk-email-validator-backend.onrender.com/api/email';

const EmailValidator = ({ onValidationComplete, onValidationStart, onProgressUpdate, loading }) => {
  const [emails, setEmails] = useState('');
  const [file, setFile] = useState(null);

  // Retry function with exponential backoff
  const fetchWithRetry = async (url, options, retries = 3, backoff = 300) => {
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response;
    } catch (error) {
      if (retries === 0) throw error;
      
      console.log(`Retrying request... ${retries} attempts left`);
      await new Promise(resolve => setTimeout(resolve, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
  };

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
      const response = await fetchWithRetry(`${API_BASE}/upload-csv`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      await validateEmailsWithProgress(data.emails);
    } catch (error) {
      alert('Error processing file: ' + error.message);
    }
  };

  const validateEmailsWithProgress = async (emailList) => {
    onValidationStart();
    
    try {
      // Use cache-busting parameter
      const timestamp = Date.now();
      const response = await fetchWithRetry(`${API_BASE}/validate-bulk-progress?t=${timestamp}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          emails: emailList
        }),
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
          if (buffer.trim()) {
            processBuffer(buffer);
          }
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

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
                return;
              } else if (data.type === 'error') {
                throw new Error(data.data.error);
              }
            } catch (e) {
              console.warn('Error parsing SSE data:', e.message);
            }
          }
        }
      }
    } catch (error) {
      console.error('Validation error:', error);
      
      if (error.message.includes('QUIC') || error.message.includes('protocol')) {
        alert('Network connection issue. Please try again in a moment or check your internet connection.');
      } else {
        alert('Validation error: ' + error.message);
      }
      
      onValidationComplete({
        results: [],
        summary: {
          total: 0,
          valid: 0,
          invalid: 0,
          validityRate: 0,
          roleAccounts: 0
        }
      });
    }
  };

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
      {/* Validation Info */}
      <div className="validation-info">
        <div className="info-icon">⚡</div>
        <div className="info-content">
          <strong>Fast Email Validation</strong>
          <small>Checks: Syntax ✓ | Domain MX Records ✓ | Disposable Emails ✓ | Role Accounts ✓</small>
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