import React, { useState } from 'react';
import axios from 'axios';

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

    await validateEmails(emailList);
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      // First parse the CSV
      const parseResponse = await axios.post(`${API_BASE}/upload-csv`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Then validate the emails
      await validateEmails(parseResponse.data.emails);
    } catch (error) {
      alert('Error processing file: ' + error.response?.data?.error || error.message);
    }
  };

  const validateEmails = async (emailList) => {
    onValidationStart();
    
    try {
      // For real-time progress, we'd use WebSockets, but for simplicity:
      const response = await axios.post(`${API_BASE}/validate-bulk`, {
        emails: emailList
      });
      
      onValidationComplete(response.data);
    } catch (error) {
      alert('Validation error: ' + error.response?.data?.error || error.message);
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
              Validate Emails
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
              Upload & Validate
            </button>
            <button type="button" onClick={downloadTemplate} className="secondary">
              Download Template
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmailValidator;