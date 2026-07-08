import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LandingLayout from '../components/ui/LandingLayout.jsx';
import Skeleton, { SkeletonDestinationDetail } from '../components/ui/Skeleton.jsx';
import api from '../utils/api.js';
import { useToast } from '../components/ui/Toast.jsx';
import useAuth from '../hooks/useAuth.js';

const DestinationDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { isAuthenticated } = useAuth();
  
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [sendingChat, setSendingChat] = useState(false);

  // For Review Form
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    title: '',
    comment: '',
    ratingOverall: 5,
    ratingHotel: 5,
    ratingActivities: 5,
    ratingValue: 5,
    travelType: 'solo',
    pros: '',
    cons: ''
  });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchDestinationData = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/destinations/${slug}`);
        if (res.data?.success) {
          setDestination(res.data.destination);
          // Initial greeting in AI widget
          setChatHistory([
            {
              role: 'assistant',
              content: `Hi there! Ready to explore **${res.data.destination.name}**? Ask me anything about the local sights, hidden gems, weather, packing suggestions, or safety tips for your upcoming trip!`
            }
          ]);
        } else {
          showToast('Destination not found', 'error');
          navigate('/explore');
        }
      } catch (err) {
        console.error('Failed to load destination:', err);
        showToast('Error loading destination details.', 'error');
        navigate('/explore');
      } finally {
        setLoading(false);
      }
    };
    fetchDestinationData();
  }, [slug]);

  // Load reviews when review tab is selected
  useEffect(() => {
    if (activeTab === 'reviews' && destination) {
      const fetchReviews = async () => {
        setLoadingReviews(true);
        try {
          const res = await api.get(`/destinations/${slug}/reviews`);
          if (res.data?.success) {
            setReviews(res.data.reviews || []);
          }
        } catch (err) {
          console.error('Failed to load reviews:', err);
        } finally {
          setLoadingReviews(false);
        }
      };
      fetchReviews();
    }
  }, [activeTab, destination, slug]);

  const handlePlanTrip = () => {
    if (destination) {
      const userOrigin = window.prompt("Where would you like to start your trip from? (Starting Point/Origin)", "Mumbai, India");
      navigate('/planner', {
        state: {
          prefillTo: `${destination.name}, ${destination.country}`,
          prefillFrom: userOrigin !== null ? userOrigin : ''
        }
      });
    }
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userMsg = chatMessage;
    setChatMessage('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    setSendingChat(true);

    try {
      const res = await api.post('/chat', {
        message: `Regarding ${destination.name}: ${userMsg}`,
        destinationContext: destination.name
      });
      if (res.data?.success) {
        setChatHistory(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setChatHistory(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an issue retrieving that. Please try again.' }]);
    } finally {
      setSendingChat(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast('Please sign in to submit a review.', 'warning');
      return;
    }
    setSubmittingReview(true);
    try {
      const prosArray = newReview.pros.split(',').map(p => p.trim()).filter(Boolean);
      const consArray = newReview.cons.split(',').map(c => c.trim()).filter(Boolean);

      const res = await api.post(`/reviews`, {
        itineraryId: destination._id, // Using destination ID to mock itinerary review or direct post
        destination: destination.name,
        destinationId: destination._id,
        title: newReview.title,
        comment: newReview.comment,
        ratings: {
          overall: newReview.ratingOverall,
          hotel: newReview.ratingHotel,
          activities: newReview.ratingActivities,
          value: newReview.ratingValue
        },
        travelType: newReview.travelType,
        pros: prosArray,
        cons: consArray
      });

      if (res.data?.success) {
        showToast('Review submitted successfully!', 'success');
        setReviews(prev => [res.data.review, ...prev]);
        setShowReviewForm(false);
        setNewReview({
          title: '',
          comment: '',
          ratingOverall: 5,
          ratingHotel: 5,
          ratingActivities: 5,
          ratingValue: 5,
          travelType: 'solo',
          pros: '',
          cons: ''
        });
      }
    } catch (err) {
      console.error('Failed to submit review:', err);
      showToast(err.response?.data?.error || 'Failed to submit review.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <LandingLayout>
        <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-12">
          <SkeletonDestinationDetail />
        </div>
      </LandingLayout>
    );
  }

  if (!destination) return null;

  return (
    <LandingLayout>
      {/* Hero Header */}
      <section className="relative h-[55vh] overflow-hidden">
        <img 
          src={destination.images?.hero || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=600&fit=crop'} 
          alt={destination.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1226]/80 via-[#0B1226]/30 to-transparent flex items-end">
          <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop w-full pb-10 text-white flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2 font-label-caps text-xs">
                <span className="bg-[#ffa630] text-[#0B1226] px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                  {destination.continent}
                </span>
                <span className="text-white/80">{destination.region}, {destination.country}</span>
              </div>
              <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg leading-tight mb-2">
                {destination.name}
              </h1>
              <p className="text-white/90 text-sm max-w-2xl font-body-lg">
                {destination.shortDescription || destination.description.substring(0, 180) + '...'}
              </p>
            </div>
            <button 
              onClick={handlePlanTrip}
              className="bg-[#ffa630] text-[#0B1226] px-8 py-4 rounded-full font-label-caps text-xs font-bold uppercase tracking-wider hover:bg-[#ffa630]/90 transition-all active:scale-95 shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">flight_takeoff</span> Plan Trip Here
            </button>
          </div>
        </div>
      </section>

      {/* Info Stats Bar */}
      <section className="bg-white border-y border-[#E5DED4] py-6 shadow-sm">
        <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
          
          <div className="border-r border-[#FAF6F0] last:border-none">
            <span className="text-[10px] text-outline uppercase font-bold block mb-1">Travel Rating</span>
            <div className="flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-[#ffa630] fill-current text-xl">star</span>
              <span className="font-display-lg text-lg text-[#0B1226]">{destination.averageRating || '4.5'}</span>
              <span className="text-xs text-outline">({destination.reviewCount || 0})</span>
            </div>
          </div>

          <div className="border-r border-[#FAF6F0] last:border-none">
            <span className="text-[10px] text-outline uppercase font-bold block mb-1">Avg Budget / Day</span>
            <span className="font-display-lg text-lg text-[#0B1226]">
              ₹{(destination.avgBudgetPerDay?.midRange || 4500).toLocaleString('en-IN')}
            </span>
          </div>

          <div className="border-r border-[#FAF6F0] last:border-none">
            <span className="text-[10px] text-outline uppercase font-bold block mb-1">Best Time</span>
            <span className="font-display-lg text-lg text-[#0B1226]">
              {destination.bestTimeToVisit?.from} - {destination.bestTimeToVisit?.to}
            </span>
          </div>

          <div className="border-r border-[#FAF6F0] last:border-none">
            <span className="text-[10px] text-outline uppercase font-bold block mb-1">Safety Index</span>
            <span className="font-display-lg text-lg text-success">
              {destination.safetyScore || '8.5'}/10
            </span>
          </div>

          <div className="last:border-none col-span-2 md:col-span-1">
            <span className="text-[10px] text-outline uppercase font-bold block mb-1">Ideal Stay</span>
            <span className="font-display-lg text-lg text-[#0B1226]">
              {destination.idealDuration || '3-4 Days'}
            </span>
          </div>

        </div>
      </section>

      {/* Main Grid Content */}
      <section className="py-12 max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column (Tabs & Details) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Tab Navigation */}
          <div className="flex border-b border-[#E5DED4] overflow-x-auto gap-6 font-label-caps text-xs font-bold scrollbar-none pb-0.5">
            {['overview', 'things-to-do', 'where-to-stay', 'reviews', 'tips'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 uppercase tracking-wider relative transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab ? 'text-primary' : 'text-outline hover:text-[#0B1226]'
                }`}
              >
                {tab.replace('-', ' ')}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 w-full h-[3px] bg-primary rounded-full animate-fade-in" />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content Panels */}
          <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#E5DED4] shadow-sm min-h-[400px]">
            
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-display-lg text-xl text-[#0B1226]">About {destination.name}</h3>
                  <p className="text-on-surface-variant leading-relaxed text-sm whitespace-pre-line">
                    {destination.description}
                  </p>
                </div>

                {/* Highlights */}
                {destination.highlights?.length > 0 && (
                  <div className="pt-4 border-t border-[#FAF6F0]">
                    <h4 className="font-label-caps text-xs text-outline uppercase tracking-wider mb-3">Key Highlights</h4>
                    <div className="flex flex-wrap gap-2">
                      {destination.highlights.map((h, i) => (
                        <div key={i} className="flex items-center gap-1.5 bg-[#FAF6F0] border border-[#E5DED4] px-4 py-2 rounded-lg text-xs font-semibold text-[#0B1226]">
                          <span className="material-symbols-outlined text-primary text-sm">verified_user</span>
                          {h}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Weather summary */}
                <div className="pt-6 border-t border-[#FAF6F0] grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-[#FAF6F0] rounded-xl p-4 border border-[#E5DED4]">
                    <span className="text-xs text-outline font-semibold block mb-1">☀️ Summer</span>
                    <span className="font-display-lg text-lg text-[#0B1226] block">
                      {destination.weather?.summer?.avgTemp || 35}°C
                    </span>
                    <span className="text-[11px] text-outline-variant">{destination.weather?.summer?.conditions || 'Hot'}</span>
                  </div>
                  <div className="bg-[#FAF6F0] rounded-xl p-4 border border-[#E5DED4]">
                    <span className="text-xs text-outline font-semibold block mb-1">❄️ Winter</span>
                    <span className="font-display-lg text-lg text-[#0B1226] block">
                      {destination.weather?.winter?.avgTemp || 16}°C
                    </span>
                    <span className="text-[11px] text-outline-variant">{destination.weather?.winter?.conditions || 'Cool'}</span>
                  </div>
                  <div className="bg-[#FAF6F0] rounded-xl p-4 border border-[#E5DED4]">
                    <span className="text-xs text-outline font-semibold block mb-1">🌧️ Monsoon</span>
                    <span className="font-display-lg text-lg text-[#0B1226] block">
                      {destination.weather?.monsoon?.avgTemp || 26}°C
                    </span>
                    <span className="text-[11px] text-outline-variant">{destination.weather?.monsoon?.conditions || 'Rainy'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Things To Do Tab */}
            {activeTab === 'things-to-do' && (
              <div className="space-y-6">
                <h3 className="font-display-lg text-xl text-[#0B1226] mb-4">Top Sights & Activities</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(destination.thingsToDo?.length > 0 ? destination.thingsToDo : [
                    { name: 'City Heritage Tour', description: 'Explore local historical architectural landmarks with a certified local guide.', category: 'sightseeing', duration: '3-4 hours' },
                    { name: 'Local Cuisine Crawl', description: 'Sample the traditional mouth-watering native dishes at iconic bazaars.', category: 'food', duration: '2 hours' }
                  ]).map((act, i) => (
                    <div key={i} className="bg-[#FAF6F0] border border-[#E5DED4] rounded-xl p-5 flex gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                        <span className="material-symbols-outlined">
                          {act.category === 'food' ? 'restaurant' : 'explore'}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm text-[#0B1226]">{act.name}</h4>
                        <p className="text-xs text-on-surface-variant">{act.description}</p>
                        <div className="flex gap-4 text-[10px] text-outline font-semibold uppercase pt-2">
                          <span>⏱️ {act.duration}</span>
                          {act.estimatedCost > 0 && <span>💰 ~₹{act.estimatedCost}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Where to Stay Tab */}
            {activeTab === 'where-to-stay' && (
              <div className="space-y-6">
                <h3 className="font-display-lg text-xl text-[#0B1226] mb-4">Recommended Accommodations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(destination.whereToStay?.length > 0 ? destination.whereToStay : [
                    { name: 'Grand Palace Heritage Hotel', type: 'luxury', rating: 5, priceRange: { min: 12000, max: 24000 } },
                    { name: 'The Backpacker Hostel Club', type: 'hostel', rating: 4, priceRange: { min: 800, max: 2000 } }
                  ]).map((stay, i) => (
                    <div key={i} className="bg-[#FAF6F0] border border-[#E5DED4] rounded-xl p-5 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-sm text-[#0B1226]">{stay.name}</h4>
                          <span className="text-[10px] text-outline font-semibold uppercase tracking-wider">
                            🏨 {stay.type} stay
                          </span>
                        </div>
                        <div className="flex items-center text-[#ffa630]">
                          {Array.from({ length: stay.rating }).map((_, r) => (
                            <span key={r} className="material-symbols-outlined text-xs fill-current">star</span>
                          ))}
                        </div>
                      </div>
                      <div className="border-t border-[#E5DED4] pt-2 flex justify-between items-center text-xs">
                        <span className="text-outline">Est. Nightly cost:</span>
                        <span className="font-bold text-[#0B1226]">
                          ₹{stay.priceRange?.min.toLocaleString('en-IN')} - ₹{stay.priceRange?.max.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-display-lg text-xl text-[#0B1226]">Traveler Reviews</h3>
                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        showToast('Please log in to write reviews.', 'warning');
                      } else {
                        setShowReviewForm(!showReviewForm);
                      }
                    }}
                    className="bg-[#0B1226] text-white px-5 py-2.5 rounded-full text-xs font-semibold hover:bg-[#0B1226]/90 transition-all cursor-pointer"
                  >
                    {showReviewForm ? 'Cancel Review' : 'Write Review'}
                  </button>
                </div>

                {/* Review Form */}
                {showReviewForm && (
                  <form onSubmit={handleReviewSubmit} className="bg-[#FAF6F0] border border-[#E5DED4] rounded-xl p-5 space-y-4 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-[#0B1226] uppercase block mb-1">Review Title</label>
                        <input
                          type="text"
                          required
                          placeholder="E.g. Wonderful royal trip!"
                          value={newReview.title}
                          onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                          className="w-full h-11 px-4 bg-white border border-[#D1C7BD] rounded-lg text-sm outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-[#0B1226] uppercase block mb-1">Traveler Type</label>
                        <select
                          value={newReview.travelType}
                          onChange={(e) => setNewReview({ ...newReview, travelType: e.target.value })}
                          className="w-full h-11 px-4 bg-white border border-[#D1C7BD] rounded-lg text-sm outline-none focus:border-primary"
                        >
                          <option value="solo">Solo Backpacking</option>
                          <option value="couple">Couple Escape</option>
                          <option value="family">Family Trip</option>
                          <option value="friends">Friends Gathering</option>
                          <option value="business">Business Trip</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-outline block mb-1">Overall (1-5)</label>
                        <input type="number" min="1" max="5" value={newReview.ratingOverall} onChange={e => setNewReview({ ...newReview, ratingOverall: Number(e.target.value) })} className="w-full h-10 px-3 bg-white border border-[#D1C7BD] rounded-lg text-sm" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-outline block mb-1">Hotel (1-5)</label>
                        <input type="number" min="1" max="5" value={newReview.ratingHotel} onChange={e => setNewReview({ ...newReview, ratingHotel: Number(e.target.value) })} className="w-full h-10 px-3 bg-white border border-[#D1C7BD] rounded-lg text-sm" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-outline block mb-1">Activities (1-5)</label>
                        <input type="number" min="1" max="5" value={newReview.ratingActivities} onChange={e => setNewReview({ ...newReview, ratingActivities: Number(e.target.value) })} className="w-full h-10 px-3 bg-white border border-[#D1C7BD] rounded-lg text-sm" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-outline block mb-1">Value (1-5)</label>
                        <input type="number" min="1" max="5" value={newReview.ratingValue} onChange={e => setNewReview({ ...newReview, ratingValue: Number(e.target.value) })} className="w-full h-10 px-3 bg-white border border-[#D1C7BD] rounded-lg text-sm" />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#0B1226] uppercase block mb-1">Detailed Comment</label>
                      <textarea
                        required
                        rows="3"
                        placeholder="Tell us about your experience..."
                        value={newReview.comment}
                        onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                        className="w-full p-4 bg-white border border-[#D1C7BD] rounded-lg text-sm outline-none focus:border-primary resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-[#0B1226] uppercase block mb-1">Pros (Comma separated)</label>
                        <input type="text" placeholder="e.g. Great guides, safe, clean" value={newReview.pros} onChange={e => setNewReview({ ...newReview, pros: e.target.value })} className="w-full h-11 px-4 bg-white border border-[#D1C7BD] rounded-lg text-sm" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-[#0B1226] uppercase block mb-1">Cons (Comma separated)</label>
                        <input type="text" placeholder="e.g. Hot summer, crowded sites" value={newReview.cons} onChange={e => setNewReview({ ...newReview, cons: e.target.value })} className="w-full h-11 px-4 bg-white border border-[#D1C7BD] rounded-lg text-sm" />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="w-full py-3 bg-[#ffa630] text-[#0B1226] rounded-full text-xs font-bold uppercase tracking-wider hover:brightness-105 active:scale-95 transition-all cursor-pointer flex justify-center"
                    >
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                )}

                {loadingReviews ? (
                  <div className="space-y-4">
                    <Skeleton variant="text" />
                    <Skeleton variant="text" />
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-10 text-outline">
                    <span className="material-symbols-outlined text-4xl block mb-2">rate_review</span>
                    No reviews yet. Be the first to share your experience!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((rev, i) => (
                      <div key={i} className="border-b border-[#FAF6F0] pb-6 last:border-none space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#FAF6F0] flex items-center justify-center font-bold text-xs uppercase overflow-hidden border border-[#E5DED4]">
                              {rev.user?.avatar ? (
                                <img src={rev.user.avatar} alt={rev.user.name} className="w-full h-full object-cover" />
                              ) : (
                                rev.user?.name?.substring(0, 2) || 'TR'
                              )}
                            </div>
                            <div>
                              <span className="font-bold text-sm text-[#0B1226] block">{rev.user?.name}</span>
                              <span className="text-[10px] text-outline font-semibold uppercase">{rev.travelType || 'Traveler'}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center text-[#ffa630] justify-end">
                              {Array.from({ length: rev.ratings?.overall || 5 }).map((_, r) => (
                                <span key={r} className="material-symbols-outlined text-sm fill-current">star</span>
                              ))}
                            </div>
                            <span className="text-[10px] text-outline">
                              {new Date(rev.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <h4 className="font-bold text-sm text-[#0B1226]">{rev.title}</h4>
                          <p className="text-xs text-on-surface-variant leading-relaxed">{rev.comment}</p>
                        </div>

                        {/* Pros / Cons chips */}
                        {((rev.pros && rev.pros.length > 0) || (rev.cons && rev.cons.length > 0)) && (
                          <div className="flex flex-wrap gap-4 pt-2 text-[11px]">
                            {rev.pros?.length > 0 && (
                              <div className="flex items-center gap-1.5 text-success">
                                <span className="font-bold">Pros:</span> {rev.pros.join(', ')}
                              </div>
                            )}
                            {rev.cons?.length > 0 && (
                              <div className="flex items-center gap-1.5 text-error">
                                <span className="font-bold">Cons:</span> {rev.cons.join(', ')}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tips Tab */}
            {activeTab === 'tips' && (
              <div className="space-y-6">
                <h3 className="font-display-lg text-xl text-[#0B1226]">Local Tips & Insights</h3>
                <ul className="space-y-4">
                  {(destination.travelTips?.length > 0 ? destination.travelTips : [
                    'Respect local traditions and dress appropriately when entering monuments.',
                    'Keep small cash denominations for street vendor transactions.',
                    'Stay hydrated, especially during the dry summer seasons.'
                  ]).map((tip, i) => (
                    <li key={i} className="flex gap-3 items-start bg-[#FAF6F0] p-4 rounded-xl border border-[#E5DED4]">
                      <span className="material-symbols-outlined text-primary text-xl flex-shrink-0">lightbulb</span>
                      <p className="text-xs text-on-surface-variant leading-relaxed">{tip}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </div>

        </div>

        {/* Right column (AI Chat Widget & Emergency Card) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* AI Travel Assistant Chat Widget */}
          <div className="bg-[#0B1226] text-white rounded-2xl border border-white/5 shadow-xl overflow-hidden flex flex-col h-[450px]">
            <div className="bg-white/5 px-5 py-4 border-b border-white/5 flex items-center gap-3">
              <span className="w-2.5 h-2.5 bg-success rounded-full animate-pulse" />
              <div>
                <span className="font-label-caps text-[10px] text-primary-container font-bold block uppercase tracking-widest">Local Guide</span>
                <h4 className="font-bold text-sm text-white">Ask Journeys AI</h4>
              </div>
            </div>

            {/* Chat message logs */}
            <div className="flex-grow p-4 overflow-y-auto space-y-3 scrollbar-none text-xs">
              {chatHistory.map((chat, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[85%] rounded-2xl px-4 py-3 leading-relaxed ${
                      chat.role === 'user' 
                        ? 'bg-[#ffa630] text-[#0B1226] font-bold rounded-tr-none' 
                        : 'bg-white/10 text-white/95 rounded-tl-none border border-white/5'
                    }`}
                  >
                    {chat.content}
                  </div>
                </div>
              ))}
              {sendingChat && (
                <div className="flex justify-start">
                  <div className="bg-white/10 rounded-2xl rounded-tl-none px-4 py-3 flex gap-1.5 items-center">
                    <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Input field form */}
            <form onSubmit={handleSendChat} className="p-3 bg-white/5 border-t border-white/5 flex gap-2">
              <input
                type="text"
                placeholder="Ask about weather, safety, tips..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                className="bg-white/10 border-none rounded-xl px-4 py-3 text-xs text-white placeholder:text-white/40 flex-grow outline-none focus:bg-white/15 transition-all"
              />
              <button 
                type="submit"
                disabled={sendingChat}
                className="bg-[#ffa630] text-[#0B1226] w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 hover:brightness-105 active:scale-95 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg font-bold">arrow_forward</span>
              </button>
            </form>
          </div>

          {/* Emergency Info Card */}
          <div className="bg-white rounded-2xl p-6 border border-[#E5DED4] shadow-sm space-y-4">
            <h4 className="font-label-caps text-xs text-outline uppercase tracking-wider font-bold">
              🚨 Local Emergencies
            </h4>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-2 border-b border-[#FAF6F0]">
                <span className="text-outline-variant font-semibold">Police Services</span>
                <span className="font-bold text-[#ba1a1a]">
                  📞 {destination.localEmergency?.police || '100'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[#FAF6F0]">
                <span className="text-outline-variant font-semibold">Medical / Ambulance</span>
                <span className="font-bold text-[#ba1a1a]">
                  📞 {destination.localEmergency?.ambulance || '108'}
                </span>
              </div>
              {destination.localEmergency?.embassy && (
                <div className="flex flex-col gap-1 py-2">
                  <span className="text-outline-variant font-semibold">Embassy / Consulate Info</span>
                  <span className="text-[#0B1226] font-bold">
                    🏛️ {destination.localEmergency.embassy}
                  </span>
                </div>
              )}
            </div>
          </div>

        </div>

      </section>

    </LandingLayout>
  );
};

export default DestinationDetailPage;
