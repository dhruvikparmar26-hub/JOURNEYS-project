import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LandingLayout from '../components/ui/LandingLayout.jsx';
import Skeleton, { SkeletonGrid } from '../components/ui/Skeleton.jsx';
import api from '../utils/api.js';

const Explore = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // URL Params prefill
  const categoryParam = searchParams.get('category') || 'all';
  const searchParam = searchParams.get('search') || '';

  // Local state
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParam);
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedBudget, setSelectedBudget] = useState('all');

  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistSubmitting, setWaitlistSubmitting] = useState(false);
  const [waitlistMessage, setWaitlistMessage] = useState('');

  // Fetch from DB
  useEffect(() => {
    const fetchDestinations = async () => {
      setLoading(true);
      try {
        let url = `/destinations?limit=12`;
        if (selectedCategory && selectedCategory !== 'all') {
          url += `&category=${selectedCategory}`;
        }
        if (searchQuery) {
          url += `&search=${encodeURIComponent(searchQuery)}`;
        }
        if (selectedBudget && selectedBudget !== 'all') {
          const budgetMap = {
            low: '3000',
            medium: '7000',
            high: '15000'
          };
          url += `&maxBudget=${budgetMap[selectedBudget]}`;
        }

        const res = await api.get(url);
        if (res.data?.success) {
          setDestinations(res.data.destinations || []);
        }
      } catch (err) {
        console.error('Failed to load destinations:', err);
      } finally {
        setLoading(false);
      }
    };
    
    // Throttle queries as user types
    const timer = setTimeout(fetchDestinations, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, selectedBudget]);

  // Sync category param change
  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  const handleWaitlistSubmit = async (e) => {
    e.preventDefault();
    if (!waitlistEmail) return;

    setWaitlistSubmitting(true);
    setWaitlistMessage('');
    try {
      const res = await api.post('/waitlist', { email: waitlistEmail });
      if (res.data) {
        setWaitlistMessage('Success! You\'ve joined the Journeys waitlist.');
        setWaitlistEmail('');
      }
    } catch (err) {
      console.error('Waitlist submit error:', err);
      setWaitlistMessage(err.response?.data?.error || 'Failed to join. Please try again.');
    } finally {
      setWaitlistSubmitting(false);
    }
  };

  const handleDestinationClick = (dest) => {
    navigate(`/destination/${dest.slug}`);
  };

  return (
    <LandingLayout>
      {/* Editorial Parallax Banner */}
      <section className="relative h-[42vh] md:h-[48vh] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1600&h=800&fit=crop"
          alt="Royal Palace India"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1226]/80 via-[#0B1226]/30 to-transparent flex items-end" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 text-white">
          <div className="max-w-[1280px] mx-auto w-full">
            <span className="font-label-caps text-[10px] text-primary-container font-bold uppercase tracking-widest block mb-2 stamp-badge border border-primary-container/20 px-2 py-0.5 rounded w-fit">
              Explore Collections
            </span>
            <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg leading-tight mb-2">
              Rediscover the Spirit of Adventure
            </h1>
            <p className="text-sm text-white/80 max-w-2xl font-body-lg">
              Curated escapes through ancient spiritual temples, pristine coastal beaches, and majestic mountain peaks.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Search & Filters Sidebar layout */}
      <section className="py-12 max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Filter Toolbar Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-[#E5DED4] shadow-sm space-y-5">
              <h3 className="font-display-lg text-lg text-[#0B1226] border-b border-[#FAF6F0] pb-2">
                Filters
              </h3>
              
              {/* Search Bar */}
              <div className="space-y-2">
                <label className="text-[10px] text-outline font-bold uppercase tracking-wider block">Search Destination</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant text-lg">search</span>
                  <input
                    type="text"
                    placeholder="Search by name, state..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setSearchParams({ search: e.target.value, category: selectedCategory });
                    }}
                    className="w-full pl-9 pr-4 py-2.5 bg-[#FAF6F0] border border-[#D1C7BD] rounded-lg text-xs outline-none focus:border-primary text-[#0B1226]"
                  />
                </div>
              </div>

              {/* Category selector */}
              <div className="space-y-2">
                <label className="text-[10px] text-outline font-bold uppercase tracking-wider block">Travel Theme</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setSearchParams({ category: e.target.value, search: searchQuery });
                  }}
                  className="w-full h-11 px-3 bg-[#FAF6F0] border border-[#D1C7BD] rounded-lg text-xs outline-none focus:border-primary text-[#0B1226] font-bold"
                >
                  <option value="all">All Categories</option>
                  <option value="heritage">Heritage & History</option>
                  <option value="beach">Beach Escapes</option>
                  <option value="mountain">Mountain Climbs</option>
                  <option value="lake">Lake & Waterways</option>
                  <option value="backpacking">Backpacker spots</option>
                </select>
              </div>

              {/* Budget Limit Slider mock */}
              <div className="space-y-2">
                <label className="text-[10px] text-outline font-bold uppercase tracking-wider block">Daily Budget Tier</label>
                <select
                  value={selectedBudget}
                  onChange={(e) => setSelectedBudget(e.target.value)}
                  className="w-full h-11 px-3 bg-[#FAF6F0] border border-[#D1C7BD] rounded-lg text-xs outline-none focus:border-primary text-[#0B1226]"
                >
                  <option value="all">Any Budget</option>
                  <option value="low">Budget (Under ₹3,000/day)</option>
                  <option value="medium">Mid-Range (Under ₹7,000/day)</option>
                  <option value="high">Luxury (Under ₹15,000/day)</option>
                </select>
              </div>

            </div>
          </div>

          {/* Destinations Grid display */}
          <div className="lg:col-span-3 space-y-6">
            
            <div className="flex justify-between items-center">
              <span className="text-xs text-outline font-bold">
                Showing {destinations.length} destinations
              </span>
              <span className="text-xs text-outline font-bold uppercase tracking-wider">
                Sort: Popularity 🔥
              </span>
            </div>

            {loading ? (
              <SkeletonGrid count={6} cols={3} />
            ) : destinations.length === 0 ? (
              <div className="bg-white rounded-2xl p-16 border border-[#E5DED4] text-center space-y-4">
                <span className="material-symbols-outlined text-4xl text-outline-variant">travel_explore</span>
                <p className="text-sm text-outline">No destinations match your filters. Try adjusting search criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {destinations.map((dest) => (
                  <div
                    key={dest._id}
                    onClick={() => handleDestinationClick(dest)}
                    className="bg-white rounded-2xl border border-[#E5DED4] overflow-hidden hover:shadow-xl transition-all duration-300 card-hover-lift cursor-pointer flex flex-col h-full group"
                  >
                    <div className="h-48 overflow-hidden relative">
                      <img
                        src={dest.images?.thumbnail || dest.images?.hero || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop'}
                        alt={dest.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <span className="absolute top-3 right-3 bg-[#0B1226]/80 text-[#FFF7EC] text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full backdrop-blur-sm border border-white/10">
                        {dest.region}
                      </span>
                    </div>

                    <div className="p-5 flex flex-col justify-between flex-grow space-y-3">
                      <div className="space-y-1">
                        <span className="text-[9px] text-[#ffa630] font-bold uppercase tracking-wider">
                          ★ {dest.averageRating || '4.5'} Rating
                        </span>
                        <h4 className="font-display-lg text-lg text-[#0B1226] group-hover:text-primary transition-colors">
                          {dest.name}
                        </h4>
                        <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                          {dest.shortDescription || dest.description}
                        </p>
                      </div>

                      <div className="border-t border-[#FAF6F0] pt-3 flex justify-between items-center text-[10px] text-outline font-semibold uppercase">
                        <span>💰 Mid: ₹{dest.avgBudgetPerDay?.midRange || 4500}/day</span>
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>
      </section>

      {/* Waitlist Call-to-action Section */}
      <section className="bg-inverse-surface py-16 text-background border-t border-outline-variant/10">
        <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop text-center space-y-6">
          <span className="material-symbols-outlined text-4xl text-[#ffa630] animate-bounce">auto_awesome</span>
          <h2 className="font-display-lg text-3xl md:text-4xl text-background leading-tight">
            Let AI craft your custom journey.
          </h2>
          <p className="text-sm text-background/80 max-w-lg mx-auto">
            Be the first to test our next-generation travel agents, custom route optimization systems, and smart coupon offers.
          </p>
          
          <form onSubmit={handleWaitlistSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-4">
            <input
              type="email"
              placeholder="Your email address"
              value={waitlistEmail}
              onChange={(e) => setWaitlistEmail(e.target.value)}
              required
              className="bg-background/10 border border-background/20 rounded-xl px-4 py-3 text-xs text-white placeholder:text-white/40 flex-grow outline-none focus:border-primary-container"
            />
            <button
              type="submit"
              disabled={waitlistSubmitting}
              className="bg-primary-container text-on-primary-container px-6 py-3 rounded-xl font-bold font-label-caps text-xs uppercase tracking-wider hover:brightness-105 active:scale-95 transition-all cursor-pointer"
            >
              {waitlistSubmitting ? 'Joining...' : 'Notify Me'}
            </button>
          </form>

          {waitlistMessage && (
            <p className="text-xs text-[#3BC48A] font-bold">{waitlistMessage}</p>
          )}
        </div>
      </section>
    </LandingLayout>
  );
};

export default Explore;
