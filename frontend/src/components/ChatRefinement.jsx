import React, { useState, useRef, useEffect } from 'react';
import Card from './ui/Card.jsx';
import Button from './ui/Button.jsx';
import { X, Send, Sparkles } from 'lucide-react';

const ChatRefinement = ({ isOpen, onClose, itineraryId }) => {
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hello! I can help you refine your itinerary. What would you like to change?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = { role: 'ai', content: 'I understand you want to refine your itinerary. Let me analyze your request and suggest some changes...' };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-bg-primary/80 backdrop-blur-sm" onClick={onClose} />
      <Card className="relative w-full max-w-2xl max-h-[80vh] flex flex-col border border-border">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-bg-elevated">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent-gold" />
            <h3 className="font-bold text-text-primary">AI Itinerary Refinement</h3>
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary p-1 rounded hover:bg-bg-elevated-high transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded ${
                  msg.role === 'user'
                    ? 'bg-accent-gold text-text-inverse'
                    : 'bg-bg-elevated text-text-primary'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-bg-elevated p-3 rounded">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border bg-bg-elevated">
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your desired changes..."
              className="flex-1 bg-bg-elevated-high border border-border rounded px-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-gold"
            />
            <Button type="submit" size="sm">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default ChatRefinement;
