import React, { useState, useEffect } from 'react';
import LandingLayout from '../components/ui/LandingLayout.jsx';
import api from '../utils/api.js';
import { useToast } from '../components/ui/Toast.jsx';
import useAuth from '../hooks/useAuth.js';
import Skeleton from '../components/ui/Skeleton.jsx';

const HelpCenterPage = () => {
  const { showToast } = useToast();
  const { isAuthenticated } = useAuth();
  
  // State
  const [faqs, setFaqs] = useState([
    {
      q: 'How does the AI Trip Planner generate itineraries?',
      a: 'Our smart AI assistant analyzes your budget, target destinations, date ranges, and personal style. It then queries local routes, calculates distances, checks reviews, and styles day-by-day bookings for an optimized journey.'
    },
    {
      q: 'Can I cancel or modify my confirmed bookings?',
      a: 'Yes, most bookings can be cancelled or modified via the "My Trips" dashboard. Please check the specific cancellation deadline for your lodging or activity under the Booking Details page.'
    },
    {
      q: 'What is two-factor authentication (2FA)?',
      a: 'Two-factor authentication adds an extra layer of security to your travel vault by requiring a secondary verification code generated on your authenticator app (like Google Authenticator) during logins.'
    },
    {
      q: 'How do I apply coupon codes to my bookings?',
      a: 'During the checkout phase of any itinerary route, look for the "Apply Coupon" input field. Enter active promo codes like WELCOME10 to receive instant discounts on eligible bookings.'
    }
  ]);
  const [openFaq, setOpenFaq] = useState(null);

  // Tickets state
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [activeTicket, setActiveTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  // Form state
  const [newTicket, setNewTicket] = useState({
    subject: '',
    category: 'general',
    priority: 'medium',
    message: ''
  });
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Load tickets if logged in
  const fetchTickets = async () => {
    if (!isAuthenticated) return;
    setLoadingTickets(true);
    try {
      const res = await api.get('/support/tickets');
      if (res.data?.success) {
        setTickets(res.data.tickets || []);
      }
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [isAuthenticated]);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast('Please log in to submit support tickets.', 'warning');
      return;
    }
    setSubmittingTicket(true);
    try {
      const res = await api.post('/support/tickets', newTicket);
      if (res.data?.success) {
        showToast('Support ticket created successfully!', 'success');
        setTickets(prev => [res.data.ticket, ...prev]);
        setNewTicket({ subject: '', category: 'general', priority: 'medium', message: '' });
        setShowCreateForm(false);
      }
    } catch (err) {
      console.error('Failed to create ticket:', err);
      showToast('Failed to submit ticket. Please check fields.', 'error');
    } finally {
      setSubmittingTicket(false);
    }
  };

  const handleSelectTicket = async (ticketId) => {
    try {
      const res = await api.get(`/support/tickets/${ticketId}`);
      if (res.data?.success) {
        setActiveTicket(res.data.ticket);
      }
    } catch (err) {
      console.error('Failed to load ticket details:', err);
      showToast('Error loading ticket conversation.', 'error');
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim() || !activeTicket) return;

    setSendingReply(true);
    try {
      const res = await api.post(`/support/tickets/${activeTicket._id}/reply`, {
        content: replyMessage
      });
      if (res.data?.success) {
        setActiveTicket(res.data.ticket);
        setReplyMessage('');
        // Refresh ticket list to show latest activity
        fetchTickets();
      }
    } catch (err) {
      console.error('Reply failed:', err);
      showToast('Failed to send reply.', 'error');
    } finally {
      setSendingReply(false);
    }
  };

  const handleCloseTicket = async (ticketId) => {
    try {
      const res = await api.put(`/support/tickets/${ticketId}/close`, { satisfaction: 5 });
      if (res.data?.success) {
        showToast('Ticket closed successfully.', 'success');
        if (activeTicket?._id === ticketId) {
          setActiveTicket(res.data.ticket);
        }
        fetchTickets();
      }
    } catch (err) {
      console.error('Close failed:', err);
    }
  };

  return (
    <LandingLayout>
      {/* Help Hero */}
      <section className="bg-[#0B1226] text-white py-16">
        <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop text-center space-y-4">
          <span className="material-symbols-outlined text-4xl text-[#ffa630]">support_agent</span>
          <h1 className="font-display-lg text-3xl md:text-4xl text-background">Journeys Help Center</h1>
          <p className="text-sm text-white/70 max-w-md mx-auto">
            Find immediate answers or lodge a support ticket with our travel assistance team.
          </p>
        </div>
      </section>

      {/* Main Grid Panels */}
      <section className="py-12 max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: FAQs & Create Ticket */}
        <div className="lg:col-span-6 space-y-8">
          <div className="bg-white rounded-2xl p-6 border border-[#E5DED4] shadow-sm space-y-6">
            <h2 className="font-display-lg text-xl text-[#0B1226]">Frequently Asked Questions</h2>
            
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="border border-[#FAF6F0] rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex justify-between items-center p-4 bg-[#FAF6F0] text-left text-xs font-bold text-[#0B1226] cursor-pointer hover:bg-primary-container/10 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <span className="material-symbols-outlined text-sm text-outline">
                      {openFaq === i ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                    </span>
                  </button>
                  {openFaq === i && (
                    <div className="p-4 bg-white border-t border-[#FAF6F0] text-xs text-on-surface-variant leading-relaxed animate-fade-in">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Ticket Create Form */}
          {isAuthenticated ? (
            <div className="bg-white rounded-2xl p-6 border border-[#E5DED4] shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="font-display-lg text-lg text-[#0B1226]">Need more assistance?</h2>
                <button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="text-xs font-bold text-primary hover:underline cursor-pointer"
                >
                  {showCreateForm ? 'Cancel ticket' : 'Lodge ticket →'}
                </button>
              </div>

              {showCreateForm && (
                <form onSubmit={handleCreateTicket} className="space-y-4 animate-fade-in">
                  <div>
                    <label className="text-[10px] text-outline font-bold uppercase tracking-wider block mb-1">Subject</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Refund request for Delhi Hotel"
                      value={newTicket.subject}
                      onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                      className="w-full h-11 px-4 bg-[#FAF6F0] border border-[#D1C7BD] rounded-lg text-xs outline-none focus:border-primary text-[#0B1226]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] text-outline font-bold uppercase tracking-wider block mb-1">Category</label>
                      <select
                        value={newTicket.category}
                        onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                        className="w-full h-11 px-3 bg-[#FAF6F0] border border-[#D1C7BD] rounded-lg text-xs"
                      >
                        <option value="booking">Booking Issue</option>
                        <option value="payment">Payments / Refunds</option>
                        <option value="technical">Technical Support</option>
                        <option value="general">General Inquiry</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-outline font-bold uppercase tracking-wider block mb-1">Priority</label>
                      <select
                        value={newTicket.priority}
                        onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                        className="w-full h-11 px-3 bg-[#FAF6F0] border border-[#D1C7BD] rounded-lg text-xs"
                      >
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                        <option value="urgent">Urgent Priority</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-outline font-bold uppercase tracking-wider block mb-1">Message Details</label>
                    <textarea
                      rows="4"
                      required
                      placeholder="Lodge details about your inquiry..."
                      value={newTicket.message}
                      onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                      className="w-full p-4 bg-[#FAF6F0] border border-[#D1C7BD] rounded-lg text-xs outline-none focus:border-primary resize-none text-[#0B1226]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingTicket}
                    className="w-full py-3 bg-[#ffa630] text-[#0B1226] font-bold uppercase tracking-wider text-xs rounded-full hover:brightness-105 active:scale-95 transition-all cursor-pointer"
                  >
                    {submittingTicket ? 'Submitting...' : 'Submit Ticket'}
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div className="bg-[#FAF6F0] border border-[#E5DED4] rounded-2xl p-6 text-center space-y-2">
              <span className="material-symbols-outlined text-3xl text-outline-variant">lock</span>
              <p className="text-xs text-outline font-bold">Please log in to submit and track support tickets.</p>
            </div>
          )}
        </div>

        {/* Right Column: Track Support Tickets & Chat details */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Ticket Queue List */}
          {isAuthenticated && (
            <div className="bg-white rounded-2xl p-6 border border-[#E5DED4] shadow-sm space-y-4">
              <h2 className="font-display-lg text-lg text-[#0B1226] border-b border-[#FAF6F0] pb-2">
                Your Support Tickets
              </h2>
              
              {loadingTickets ? (
                <div className="space-y-3">
                  <Skeleton variant="text" />
                  <Skeleton variant="text" />
                </div>
              ) : tickets.length === 0 ? (
                <div className="text-center py-10 text-outline-variant text-xs">
                  No support tickets logged.
                </div>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {tickets.map((t) => (
                    <div
                      key={t._id}
                      onClick={() => handleSelectTicket(t._id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${
                        activeTicket?._id === t._id 
                          ? 'bg-[#ffa630]/10 border-[#ffa630]' 
                          : 'bg-[#FAF6F0] border-[#E5DED4] hover:border-outline'
                      }`}
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] text-outline font-bold uppercase tracking-wider">{t.ticketNumber}</span>
                        <h4 className="font-bold text-xs text-[#0B1226] line-clamp-1">{t.subject}</h4>
                        <span className="inline-block text-[9px] bg-[#0B1226]/5 px-2 py-0.5 rounded text-outline uppercase">
                          {t.category}
                        </span>
                      </div>
                      <div className="text-right space-y-1">
                        <span className={`inline-block text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                          t.status === 'open' ? 'bg-success/20 text-success' : 
                          t.status === 'in_progress' ? 'bg-info/20 text-info' : 
                          'bg-outline/20 text-outline'
                        }`}>
                          {t.status.replace('_', ' ')}
                        </span>
                        {t.status !== 'closed' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCloseTicket(t._id);
                            }}
                            className="block text-[10px] text-[#ba1a1a] hover:underline w-full text-right"
                          >
                            Close
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Ticket Detail Conversation Thread */}
          {activeTicket ? (
            <div className="bg-white rounded-2xl p-6 border border-[#E5DED4] shadow-sm flex flex-col h-[400px]">
              <div className="border-b border-[#FAF6F0] pb-3 mb-3 flex justify-between items-center">
                <div>
                  <span className="text-[9px] text-outline font-bold uppercase block">{activeTicket.ticketNumber}</span>
                  <h3 className="font-bold text-xs text-[#0B1226] line-clamp-1">{activeTicket.subject}</h3>
                </div>
                <span className="text-[10px] text-outline-variant font-semibold capitalize">
                  Priority: {activeTicket.priority}
                </span>
              </div>

              {/* Message scroll thread */}
              <div className="flex-grow overflow-y-auto space-y-3 pr-1 text-xs scrollbar-none">
                {activeTicket.messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${
                      msg.sender === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <span className="text-[9px] text-outline font-semibold mb-0.5">
                      {msg.senderName} ({new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                    </span>
                    <div
                      className={`max-w-[85%] rounded-xl px-4 py-2.5 leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-[#ffa630] text-[#0B1226] font-bold rounded-tr-none'
                          : msg.sender === 'ai'
                          ? 'bg-[#0B1226] text-white rounded-tl-none'
                          : 'bg-[#FAF6F0] text-[#0B1226] border border-[#E5DED4] rounded-tl-none'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply form */}
              {activeTicket.status !== 'closed' && (
                <form onSubmit={handleSendReply} className="mt-3 pt-3 border-t border-[#FAF6F0] flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Type your reply here..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    className="flex-grow px-4 py-2 bg-[#FAF6F0] border border-[#D1C7BD] rounded-lg text-xs outline-none focus:border-primary text-[#0B1226]"
                  />
                  <button
                    type="submit"
                    disabled={sendingReply}
                    className="bg-[#0B1226] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#0B1226]/90 transition-all cursor-pointer"
                  >
                    Reply
                  </button>
                </form>
              )}
            </div>
          ) : (
            isAuthenticated && (
              <div className="bg-[#FAF6F0] border border-[#E5DED4] rounded-2xl p-16 text-center text-outline text-xs">
                Select a ticket from the queue list to view its reply logs.
              </div>
            )
          )}

        </div>

      </section>
    </LandingLayout>
  );
};

export default HelpCenterPage;
