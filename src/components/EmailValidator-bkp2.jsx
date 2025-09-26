import React, { useState } from 'react';

const API_BASE = 'https://bulk-email-validator-backend.onrender.com/api/email';

const EmailValidator = ({ onValidationComplete, onValidationStart, onProgressUpdate, loading }) => {
  const [emails, setEmails] = useState('');
  const [file, setFile] = useState(null);

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
        body: JSON.stringify({ emails: emailList }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ') && line.length > 6) {
            try {
              const data = JSON.parse(line.slice(6)); // Remove 'data: ' prefix
              
              if (data.type === 'progress') {
                onProgressUpdate(data.data);
              } else if (data.type === 'complete') {
                onValidationComplete(data.data);
                return;
              } else if (data.type === 'error') {
                throw new Error(data.data.error);
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
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
          validityRate: 0
        }
      });
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