import React, { useState, useEffect, useRef } from 'react';
import LandingLayout from '../components/ui/LandingLayout.jsx';
import api from '../utils/api.js';
import { useToast } from '../components/ui/Toast.jsx';
import useAuth from '../hooks/useAuth.js';
import Skeleton, { SkeletonChat } from '../components/ui/Skeleton.jsx';

const AIChatPage = () => {
  const { showToast } = useToast();
  const { isAuthenticated } = useAuth();
  
  // States
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messageEndRef = useRef(null);

  // Suggested prompts
  const suggestions = [
    'Suggest safe places in India for a family trip',
    'What is the average daily cost for mid-range travel?',
    'Recommend heritage & historical destinations',
    'What should I pack for rainy monsoon seasons?'
  ];

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load active sessions
  const fetchSessions = async () => {
    setLoadingSessions(true);
    try {
      const res = await api.get('/chat/sessions');
      if (res.data?.success) {
        setSessions(res.data.sessions || []);
        // Auto-select first session if exists
        if (res.data.sessions?.length > 0 && !activeSession) {
          handleSelectSession(res.data.sessions[0]._id);
        }
      }
    } catch (err) {
      console.error('Failed to load chat sessions:', err);
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleSelectSession = async (sessionId) => {
    setLoadingHistory(true);
    try {
      const res = await api.get(`/chat/sessions/${sessionId}`);
      if (res.data?.success) {
        setActiveSession(res.data.session);
        setMessages(res.data.session.messages || []);
      }
    } catch (err) {
      console.error('Failed to fetch session history:', err);
      showToast('Error loading chat session history.', 'error');
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleNewSession = () => {
    setActiveSession(null);
    setMessages([
      {
        role: 'assistant',
        content: 'Greetings! I am your Journeys AI travel assistant. Ask me questions about local itineraries, hotel suggestions, weather updates, safety conditions, or packing tips!'
      }
    ]);
  };

  const handleSendMessage = async (msgText) => {
    const textToSend = msgText || inputMessage;
    if (!textToSend.trim()) return;

    setInputMessage('');
    setMessages(prev => [...prev, { role: 'user', content: textToSend, timestamp: new Date() }]);
    setSending(true);

    try {
      const res = await api.post('/chat', {
        message: textToSend,
        sessionId: activeSession?._id || null
      });

      if (res.data?.success) {
        setMessages(res.data.messages || []);
        // Update session state
        if (!activeSession) {
          // A new session got created on backend, refresh session listing
          fetchSessions();
        } else {
          // Just update activeSession metadata
          setActiveSession(prev => ({
            ...prev,
            _id: res.data.sessionId,
            title: res.data.sessionTitle || prev.title
          }));
        }
      }
    } catch (err) {
      console.error('Send message failed:', err);
      showToast('Failed to retrieve response from travel agent.', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteSession = async (sessionId, e) => {
    e.stopPropagation();
    try {
      const res = await api.delete(`/chat/sessions/${sessionId}`);
      if (res.data?.success) {
        showToast('Chat archived successfully.', 'success');
        setSessions(prev => prev.filter(s => s._id !== sessionId));
        if (activeSession?._id === sessionId) {
          handleNewSession();
        }
      }
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  };

  return (
    <LandingLayout>
      <section className="flex-grow max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-8 w-full">
        <div className="bg-white rounded-2xl border border-[#E5DED4] shadow-sm flex overflow-hidden min-h-[calc(100vh-180px)] h-[650px]">
          
          {/* Sidebar Chat Sessions list */}
          <div className="w-1/3 md:w-64 border-r border-[#FAF6F0] flex flex-col justify-between bg-[#FAF6F0]/30">
            <div className="p-4 border-b border-[#FAF6F0] space-y-3">
              <button
                onClick={handleNewSession}
                className="w-full py-2.5 bg-[#0B1226] text-white rounded-xl text-xs font-bold font-label-caps uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#0B1226]/90 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm font-bold">add</span> New Chat
              </button>
            </div>

            {/* List scroll */}
            <div className="flex-grow overflow-y-auto p-2 space-y-1.5 scrollbar-none">
              {loadingSessions ? (
                <div className="p-4 space-y-2">
                  <Skeleton variant="text" />
                  <Skeleton variant="text" />
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-10 text-[10px] text-outline uppercase tracking-wider font-semibold">
                  No chat histories
                </div>
              ) : (
                sessions.map((s) => (
                  <div
                    key={s._id}
                    onClick={() => handleSelectSession(s._id)}
                    className={`p-3 rounded-xl cursor-pointer flex justify-between items-center transition-all ${
                      activeSession?._id === s._id
                        ? 'bg-[#ffa630]/10 border border-[#ffa630]/30'
                        : 'hover:bg-[#FAF6F0] border border-transparent'
                    }`}
                  >
                    <div className="space-y-0.5 truncate flex-grow">
                      <h4 className="font-bold text-xs text-[#0B1226] truncate">{s.title || 'New Chat'}</h4>
                      <span className="text-[9px] text-outline font-semibold">
                        {new Date(s.lastMessageAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <button
                      onClick={(e) => handleDeleteSession(s._id, e)}
                      className="text-outline hover:text-error p-1 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">archive</span>
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Loyalty tier footer */}
            {isAuthenticated && (
              <div className="p-3 border-t border-[#FAF6F0] bg-white/60 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">auto_awesome</span>
                <span className="text-[10px] text-outline font-bold uppercase tracking-wider">AI Travel Guide v1.0</span>
              </div>
            )}
          </div>

          {/* Active Chat Conversation Log */}
          <div className="flex-grow flex flex-col justify-between bg-white h-full">
            
            {/* Header info */}
            <div className="px-6 py-4 border-b border-[#FAF6F0] flex justify-between items-center">
              <div>
                <h3 className="font-display-lg text-lg text-[#0B1226] line-clamp-1">
                  {activeSession?.title || 'Travel Planning Assistant'}
                </h3>
                <span className="text-[10px] text-outline-variant font-bold uppercase tracking-wider">
                  ⚡ Online Guide Powered by Journeys AI
                </span>
              </div>
              <span className="material-symbols-outlined text-outline text-xl">smart_toy</span>
            </div>

            {/* Message thread body */}
            <div className="flex-grow p-6 overflow-y-auto space-y-4 text-xs scrollbar-none">
              {loadingHistory ? (
                <SkeletonChat />
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-3 leading-relaxed whitespace-pre-line ${
                        msg.role === 'user'
                          ? 'bg-[#ffa630] text-[#0B1226] font-bold rounded-tr-none shadow-sm'
                          : 'bg-[#FAF6F0] text-[#0B1226] border border-[#E5DED4] rounded-tl-none'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
              {sending && (
                <div className="flex justify-start animate-pulse">
                  <div className="bg-[#FAF6F0] border border-[#E5DED4] rounded-2xl rounded-tl-none px-4 py-3 flex gap-1.5 items-center">
                    <span className="w-1.5 h-1.5 bg-outline rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-outline rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-outline rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
              <div ref={messageEndRef} />
            </div>

            {/* Suggestions Chips & Input form footer */}
            <div className="p-4 border-t border-[#FAF6F0] bg-[#FAF6F0]/20 space-y-4">
              
              {/* Suggestion Chips */}
              {messages.length <= 1 && (
                <div className="space-y-1.5">
                  <span className="text-[9px] text-outline font-bold uppercase tracking-wider block">Suggested Questions</span>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(s)}
                        className="bg-white border border-[#E5DED4] hover:border-primary hover:bg-[#ffa630]/5 text-[#0B1226] text-[10px] font-bold px-3 py-1.5 rounded-full transition-all cursor-pointer shadow-sm"
                      >
                        💡 {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Input form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  placeholder="Ask me where to go, weather patterns, safety indexes..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="flex-grow px-4 py-3 bg-white border border-[#D1C7BD] rounded-xl text-xs outline-none focus:border-primary text-[#0B1226]"
                />
                <button
                  type="submit"
                  disabled={sending}
                  className="bg-[#ffa630] text-[#0B1226] w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 hover:brightness-105 active:scale-95 transition-all cursor-pointer shadow-md"
                >
                  <span className="material-symbols-outlined font-bold">arrow_upward</span>
                </button>
              </form>

            </div>

          </div>

        </div>
      </section>
    </LandingLayout>
  );
};

export default AIChatPage;
