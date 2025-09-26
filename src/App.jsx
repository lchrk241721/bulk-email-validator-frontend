import React, { useState } from 'react';
import EmailValidator from './components/EmailValidator';
import ResultsTable from './components/ResultsTable';
import Summary from './components/Summary';
import logo from './logo/logo512.png'; // Import your logo
import UserInfoBar from './components/UserInfoBar'; // Import the new component
import ChatBot from './components/ChatBot'; // Import the chatbot
import './App.css';

function App() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(null);

  const handleValidationComplete = (validationResults) => {
    setResults(validationResults);
    setLoading(false);
    setProgress(null);
  };

  const handleValidationStart = () => {
    setLoading(true);
    setProgress({ processed: 0, total: 0 });
  };

  const handleProgressUpdate = (progressData) => {
    setProgress(progressData);
  };

  return (
    <div className="app">
      <UserInfoBar />
      <ChatBot />
      <header className="app-header">
        <div className="logo-title-container">
          <img src={logo} alt="Bulk Email Validator Logo" className="app-logo" />
          <div className="title-container">
              <h1>📧 Bulk Email Validator</h1>
              <p>Validate thousands of email addresses quickly and accurately</p>
          </div>
        </div>
      </header>

      <main className="app-main">
        <EmailValidator
          onValidationComplete={handleValidationComplete}
          onValidationStart={handleValidationStart}
          onProgressUpdate={handleProgressUpdate}
          loading={loading}
        />

        {loading && progress && (
          <div className="progress-container">
            <h3>Validating Emails...</h3>
            <progress 
              value={progress.processed} 
              max={progress.total}
            />
            <p>{progress.processed} / {progress.total} processed</p>
            <p>Current: {progress.currentEmail}</p>
          </div>
        )}

        {results && (
          <>
            <Summary summary={results.summary} />
            <ResultsTable results={results.results} />
          </>
        )}
      </main>
      <footer className="app-footer">
        <p>
          <small>
            🔒 Your IP address is only used for location detection and is not stored. 
            We respect your privacy.
          </small>
        </p>
      </footer>
    </div>
  );
}

export default App;