import React, { useState, useRef, useEffect } from 'react';
import './ChatBot.css';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Predefined questions and answers
  const knowledgeBase = {
    'hello|hi|hey': 'Hello! I\'m here to help you understand how to use the Bulk Email Validator tool. What would you like to know?',
    'how to use|how does it work|usage': 'You can use the tool in two ways:\n\n1. **Paste Emails**: Copy and paste email addresses (one per line) in the text area\n2. **Upload CSV**: Upload a CSV file with email addresses in the first column\n\nThen click "Validate Emails" to start the validation process.',
    'what does it validate|validation checks|checks': 'The tool performs three main checks:\n\n✅ **Syntax Validation** - Checks if email format is correct\n✅ **Domain Validation** - Verifies if the domain exists and has MX records\n✅ **Disposable Email Check** - Identifies temporary email addresses',
    'csv format|upload csv|csv template': 'The CSV file should have emails in the first column. You can download our template by clicking the "Download Template" button. The format is simple:\n\n```\nemail\njohn@example.com\njane@example.com\n```',
    'results|output|report': 'After validation, you\'ll see:\n\n📊 **Summary Card** - Total, valid, and invalid counts with percentages\n📋 **Detailed Results** - Table showing each email\'s validation status and reasons\n📈 **Visual Charts** - Pie chart showing valid vs invalid distribution',
    'limits|restrictions|maximum': 'Current limits:\n\n• **Max emails per validation**: 10,000\n• **File size**: 5MB maximum\n• **Supported format**: CSV files only',
    'privacy|security|data': 'Your data is secure and private:\n\n🔒 **No storage** - Emails are processed and immediately discarded\n🔒 **SSL encryption** - All data transfers are encrypted\n🔒 **No sharing** - We never share your data with third parties',
    'thanks|thank you|bye|goodbye': 'You\'re welcome! Happy email validating! 🚀 Feel free to ask if you have more questions.',
    'default': 'I can help you with:\n\n• How to use the tool\n• Validation checks performed\n• CSV format requirements\n• Understanding results\n• Usage limits\n• Privacy concerns\n\nWhat would you like to know?'
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Add welcome message when chatbot opens
      addBotMessage("Hello! I'm your AI assistant. I can explain how to use the Bulk Email Validator tool. Ask me anything! 😊");
    }
  }, [isOpen]);

  const addBotMessage = (text) => {
    const newMessage = {
      id: Date.now(),
      text: text,
      isUser: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const addUserMessage = (text) => {
    const newMessage = {
      id: Date.now(),
      text: text,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const findAnswer = (question) => {
    const lowerQuestion = question.toLowerCase();
    
    for (const [pattern, answer] of Object.entries(knowledgeBase)) {
      if (pattern === 'default') continue;
      
      const patterns = pattern.split('|');
      if (patterns.some(p => lowerQuestion.includes(p))) {
        return answer;
      }
    }
    
    return knowledgeBase.default;
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Add user message
    addUserMessage(inputMessage);
    setIsTyping(true);

    // Simulate AI typing delay
    setTimeout(() => {
      const answer = findAnswer(inputMessage);
      addBotMessage(answer);
      setIsTyping(false);
    }, 1000);

    setInputMessage('');
  };

  const handleQuickQuestion = (question) => {
    addUserMessage(question);
    setIsTyping(true);

    setTimeout(() => {
      const answer = findAnswer(question);
      addBotMessage(answer);
      setIsTyping(false);
    }, 800);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const quickQuestions = [
    "How to use this tool?",
    "What validation checks are done?",
    "CSV format requirements?",
    "Is my data secure?"
  ];

  return (
    <>
      {/* Chatbot Toggle Button */}
      <button className={`chatbot-toggle ${isOpen ? 'open' : ''}`} onClick={toggleChat}>
        <span className="chatbot-icon">🤖</span>
        <span className="chatbot-label">AI Helper</span>
      </button>

      {/* Chatbot Window */}
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-title">
              <span className="chatbot-avatar">🤖</span>
              <div>
                <h4>Email Validator Assistant</h4>
                <span className="status">Online</span>
              </div>
            </div>
            <button className="close-chat" onClick={toggleChat}>×</button>
          </div>

          <div className="chatbot-messages">
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.isUser ? 'user-message' : 'bot-message'}`}>
                <div className="message-content">
                  {message.text.split('\n').map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
                <span className="message-time">{message.timestamp}</span>
              </div>
            ))}
            
            {isTyping && (
              <div className="message bot-message">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          <div className="quick-questions">
            <p>Quick questions:</p>
            <div className="quick-buttons">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  className="quick-btn"
                  onClick={() => handleQuickQuestion(question)}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <form className="chatbot-input" onSubmit={handleSendMessage}>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask me about the email validator..."
              autoFocus
            />
            <button type="submit" disabled={!inputMessage.trim()}>
              <span className="send-icon">↑</span>
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatBot;