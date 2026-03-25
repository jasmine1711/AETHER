// src/components/AIAssistant.jsx
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './AIAssistant.css';
import api from '../utils/api'; 

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuestionsPanel, setShowQuestionsPanel] = useState(true);
  const messagesEndRef = useRef(null);

  const quickQuestions = [
    'Suggest outfit for hourglass',
    'What to wear to work?',
    'Date night outfit ideas',
    'Colors for warm skin tone',
    'Summer fashion tips',
    'Winter layering guide',
    'How to dress pear shape?',
    'Casual weekend outfits'
  ];

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 1,
          text: "Hi! I'm Aether, your AI fashion stylist. How can I help you today? 😊",
          isUser: false
        }
      ]);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleQuickQuestion = async (question) => {
    setInput(question);
    await handleSendMessage(question);
  };

  const handleSendMessage = async (text = input) => {
    if (!text.trim()) return;

    const userMessage = { id: Date.now(), text, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await api.post('/ai/chat', {
  message: text
});

      const aiMessage = {
        id: Date.now() + 1,
        text: response.data.reply || "I'm here to help with fashion advice!",
        isUser: false
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble connecting. Here are some fashion tips: Consider your body type, choose colors that complement your skin tone, and always prioritize comfort with style.",
        isUser: false
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: Date.now(),
        text: "Hi! I'm Aether, your AI fashion stylist. How can I help you today? 😊",
        isUser: false
      }
    ]);
  };

  return (
    <div className="ai-assistant">
      {!isOpen ? (
        <button className="ai-toggle-button" onClick={() => setIsOpen(true)}>
          <span>🤖</span>
          AI Stylist
        </button>
      ) : (
        <div className="ai-chat-container">
          <div className="ai-header">
            <div className="ai-header-content">
              <h3>Aether AI Stylist</h3>
              <p>Ask me anything about fashion!</p>
            </div>
            <div className="header-actions">
              <button 
                className="clear-chat-btn"
                onClick={clearChat}
                title="Clear chat"
              >
                🔄
              </button>
              <button 
                className="toggle-questions-btn"
                onClick={() => setShowQuestionsPanel(!showQuestionsPanel)}
                title={showQuestionsPanel ? "Hide questions" : "Show questions"}
              >
                {showQuestionsPanel ? '❓' : '➕'}
              </button>
              <button 
                className="close-chat-btn"
                onClick={() => setIsOpen(false)}
                title="Close AI Assistant"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="ai-main-content">
            <div className={`questions-panel ${showQuestionsPanel ? '' : 'collapsed'}`}>
              <h4>Quick Questions:</h4>
              <div className="quick-questions-list">
                {quickQuestions.map((q, index) => (
                  <button
                    key={index}
                    className="quick-question-btn"
                    onClick={() => handleQuickQuestion(q)}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            <div className="conversation-area">
              <div className="ai-messages">
                {messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`ai-message ${msg.isUser ? 'user' : 'assistant'}`}
                  >
                    <div className="ai-avatar">
                      {msg.isUser ? '👤' : '🤖'}
                    </div>
                    <div className="ai-content">
                      {msg.text.split('\n').map((line, i) => (
                        <p key={i}>{line}</p>
                      ))}
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="ai-message assistant">
                    <div className="ai-avatar">🤖</div>
                    <div className="typing">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {!showQuestionsPanel && (
                <div className="ai-quick-questions-bottom">
                  <p>Quick questions:</p>
                  <div className="ai-quick-buttons-bottom">
                    {quickQuestions.slice(0, 4).map((q, index) => (
                      <button
                        key={index}
                        className="ai-quick-btn-bottom"
                        onClick={() => handleQuickQuestion(q)}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="ai-input-area">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about fashion, styling, outfits..."
                  disabled={isTyping}
                />
                <button
                  className="ai-send-button"
                  onClick={() => handleSendMessage()}
                  disabled={isTyping || !input.trim()}
                >
                  {isTyping ? '...' : 'Send'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;