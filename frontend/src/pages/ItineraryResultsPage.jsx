import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api.js';
import LandingLayout from '../components/ui/LandingLayout.jsx';
import Skeleton from '../components/ui/Skeleton.jsx';
import Card from '../components/ui/Card.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import MapView from '../components/MapView.jsx';
import useAuth from '../hooks/useAuth.js';
import { useToast } from '../components/ui/Toast.jsx';
import { MapPin, Calendar, Compass, Share2 } from 'lucide-react';
import Chip from '../components/ui/Chip.jsx';

/**
 * ItineraryResultsPage Component
 * 
 * Displays the complete itinerary inside LandingLayout.
 */
const ItineraryResultsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success: showSuccessToast, error: showErrorToast } = useToast();
  
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState(null);

  const fetchItinerary = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get(`/itineraries/${id}`);
      setItinerary(data);
      if (data.days && data.days.length > 0) {
        setSelectedDay(data.days[0]);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to fetch itinerary.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItinerary();
  }, [id]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const { data } = await api.post(`/itineraries/${id}/save`);
      setItinerary(data.itinerary);
      showSuccessToast('Itinerary saved to your account!');
    } catch (err) {
      console.error(err);
      showErrorToast('Failed to save itinerary.');
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    try {
      setSharing(true);
      const { data } = await api.post(`/itineraries/${id}/share`);
      setShareUrl(data.shareUrl || `${window.location.origin}/shared/${data.shareToken}`);
      showSuccessToast('Share link generated!');
    } catch (err) {
      console.error(err);
      showErrorToast('Failed to generate share link.');
    } finally {
      setSharing(false);
    }
  };

  const copyShareUrl = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      showSuccessToast('Copied share link to clipboard!');
    }
  };

  if (loading) {
    return (
      <LandingLayout>
        <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-12 text-center">
          <span className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin inline-block"></span>
          <p className="mt-4 text-on-surface-variant">Opening itinerary details...</p>
        </div>
      </LandingLayout>
    );
  }

  if (error) {
    return (
      <LandingLayout>
        <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-12">
          <ErrorState title="Access Error" message={error} onRetry={fetchItinerary} />
        </div>
      </LandingLayout>
    );
  }

  if (!itinerary) {
    return (
      <LandingLayout>
        <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-12">
          <EmptyState icon={Compass} title="Itinerary not found" description="The itinerary you are trying to view does not exist." />
        </div>
      </LandingLayout>
    );
  }

  const promptData = itinerary.prompt ? (typeof itinerary.prompt === 'string' ? JSON.parse(itinerary.prompt) : itinerary.prompt) : {};
  const budgetMax = promptData.budgetMax || 200000;
  const destinationLabel = itinerary.destinations?.[0] || itinerary.destination?.label || itinerary.destination || itinerary.title;

  return (
    <LandingLayout>
      <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-12 space-y-8 flex-grow">
        {/* Ticket Header Stub (Image 7 style) */}
        <div className="bg-white rounded-2xl border border-[#E5DED4] p-8 shadow-sm flex flex-col md:flex-row relative group">
          <div className="flex-[3] relative space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="text-[10px] bg-[#e6f4ea] text-[#006d35] border border-[#3bc48a]/20 px-3 py-1 rounded font-bold uppercase tracking-wider font-label-caps">
                  Confirmed
                </span>
                <span className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">
                  {itinerary.durationDays || 3} DAYS IN {destinationLabel?.toUpperCase()}
                </span>
              </div>
              <div className="text-right">
                <span className="font-label-caps text-[9px] text-outline uppercase block mb-0.5">Date Range</span>
                <span className="font-semibold text-xs text-[#0B1226]">{new Date(itinerary.tripStartDate || itinerary.startDate || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>
            <div className="flex items-center gap-6 py-2">
              <div className="flex-1">
                <p className="font-display-lg text-2xl uppercase">{promptData.origin?.label?.split(',')[0] || 'Delhi'}</p>
                <p className="text-[10px] text-on-surface-variant font-label-caps uppercase">Origin</p>
              </div>
              <div className="flex-[2] flex flex-col items-center">
                <span className="material-symbols-outlined text-primary text-xl rotate-90">
                  {itinerary.days?.[0]?.travelSegments?.[0]?.mode === 'flight' ? 'flight' : 
                   itinerary.days?.[0]?.travelSegments?.[0]?.mode === 'train' ? 'train' : 
                   'directions_car'}
                </span>
                <div className="w-full h-px border-b border-dashed border-[#D1C7BD]"></div>
              </div>
              <div className="flex-1 text-right">
                <p className="font-display-lg text-2xl uppercase">{promptData.destination?.label?.split(',')[0] || destinationLabel?.split(',')[0] || 'Jaipur'}</p>
                <p className="text-[10px] text-on-surface-variant font-label-caps uppercase">Destination</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 border-t border-[#FAF6F0] pt-4">
              <div>
                <p className="font-label-caps text-[9px] text-outline uppercase">Total Spend</p>
                <p className="font-semibold text-sm text-[#0B1226]">₹{(itinerary.totalCost || 18000).toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="font-label-caps text-[9px] text-outline uppercase">Meals</p>
                <p className="font-semibold text-sm text-[#0B1226]">Included</p>
              </div>
              <div>
                <p className="font-label-caps text-[9px] text-outline uppercase">Days Planned</p>
                <p className="font-semibold text-sm text-[#0B1226]">{itinerary.days?.length || 3}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pink conflict alert box (Image 7 style) */}
        <div className="p-5 bg-[#fce8e6] border border-[#ba1a1a]/20 text-[#ba1a1a] rounded-2xl space-y-2">
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider font-label-caps">
            <span className="material-symbols-outlined text-sm">warning</span>
            HEADS UP — A FEW CONFLICTS TO REVIEW
          </div>
          <ul className="text-xs list-disc list-inside space-y-1 text-[#ba1a1a]/80 pl-2 leading-relaxed">
            <li>Check-in at {destinationLabel?.split(',')[0]} Hotel is scheduled after your first day tour begins.</li>
            <li>Local festival traffic warnings reported for Day 2 monument circuits.</li>
          </ul>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap gap-3 items-center justify-between border-b border-[#E5DED4] pb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#ffa630] text-[#0B1226] font-bold px-6 py-2.5 rounded-lg hover:brightness-105 active:scale-95 transition-all shadow-sm text-xs uppercase tracking-wider font-label-caps cursor-pointer"
            >
              {saving ? 'Saving...' : 'Save this trip'}
            </button>
            <button
              onClick={handleShare}
              disabled={sharing}
              className="bg-white border border-[#D1C7BD] text-[#0B1226] font-bold px-6 py-2.5 rounded-lg hover:bg-[#FAF6F0] active:scale-95 transition-all shadow-sm text-xs uppercase tracking-wider font-label-caps cursor-pointer"
            >
              {sharing ? 'Sharing...' : 'Share itinerary'}
            </button>
            <button
              onClick={() => navigate(`/packing-list/${itinerary._id}`)}
              className="bg-white border border-[#D1C7BD] text-[#0B1226] font-bold px-6 py-2.5 rounded-lg hover:bg-[#FAF6F0] active:scale-95 transition-all shadow-sm text-xs uppercase tracking-wider font-label-caps cursor-pointer"
            >
              Get Packing List
            </button>
            <button
              onClick={() => navigate(`/group-trip/${itinerary._id}`)}
              className="bg-white border border-[#D1C7BD] text-[#0B1226] font-bold px-6 py-2.5 rounded-lg hover:bg-[#FAF6F0] active:scale-95 transition-all shadow-sm text-xs uppercase tracking-wider font-label-caps cursor-pointer animate-pulse"
            >
              Plan with crew
            </button>
          </div>
          <div>
            <Link 
              to={`/reviews/${itinerary._id}`}
              className="text-xs font-bold text-primary hover:underline uppercase tracking-wider font-label-caps flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">rate_review</span>
              Leave a Review
            </Link>
          </div>
        </div>

        {shareUrl && (
          <div className="p-4 bg-white rounded-xl border border-[#E5DED4] flex items-center justify-between gap-4 max-w-xl">
            <span className="text-xs font-mono text-[#006d35] select-all truncate">{shareUrl}</span>
            <button onClick={copyShareUrl} className="bg-[#0B1226] text-white px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer">
              Copy URL
            </button>
          </div>
        )}

        {/* Content Split Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
          {/* Day by Day List */}
          <div className="lg:col-span-8 space-y-6">
            <h3 className="font-headline-md text-xl text-[#0B1226] border-b border-[#E5DED4] pb-4">Day by day</h3>
            {itinerary.days?.map((day, index) => (
              <div key={day._id || index} id={`day-${day.dayNumber}`} className="relative pl-8">
                {/* Visual timeline dotted line */}
                {index < (itinerary.days?.length || 0) - 1 && (
                  <div className="absolute left-3.5 top-8 bottom-0 w-px border-l-2 border-dashed border-[#D1C7BD] -ml-[1px]" />
                )}

                {/* Day circle bullet */}
                <div className="absolute left-0 top-0 w-7 h-7 rounded-full bg-[#ffa630] border-2 border-white flex items-center justify-center text-[10px] font-bold text-[#0B1226] shadow-sm">
                  {day.dayNumber}
                </div>

                <div className="space-y-4">
                  <h4 className="font-display-lg text-lg text-[#0B1226] pt-0.5">
                    Day {day.dayNumber} — {day.title || 'Sightseeing'}
                  </h4>

                  {/* Hotels */}
                  {day.locations?.filter(loc => loc.type === 'hotel').map((hotel, hIndex) => (
                    <div key={hIndex} className="bg-white rounded-xl p-5 border border-[#E5DED4] shadow-sm flex items-start gap-4 hover:border-primary-container transition-colors">
                      <div className="w-12 h-12 rounded-lg bg-[#FAF6F0] flex items-center justify-center text-[#ffa630] flex-shrink-0">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>hotel</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <h5 className="font-bold text-sm text-[#0B1226]">{hotel.name}</h5>
                          <span className="text-[10px] font-bold bg-[#e6f4ea] text-[#006d35] border border-[#3bc48a]/20 px-2 py-0.5 rounded font-label-caps">9.4/10</span>
                        </div>
                        <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{hotel.notes || 'Luxury local stays.'}</p>
                        <div className="flex gap-2 mt-3 text-[9px] font-bold uppercase tracking-wider font-label-caps text-outline-variant">
                          <span className="bg-[#FAF6F0] border border-[#E5DED4] px-2 py-0.5 rounded">Boutique</span>
                          <span className="bg-[#FAF6F0] border border-[#E5DED4] px-2 py-0.5 rounded">Historic</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Activities */}
                  {day.activities?.map((act, aIndex) => (
                    <div key={aIndex} className="bg-white rounded-xl p-5 border border-[#E5DED4] shadow-sm flex items-start gap-4 hover:border-primary-container transition-colors">
                      <div className="w-12 h-12 rounded-lg bg-[#FAF6F0] flex items-center justify-center text-primary flex-shrink-0">
                        <span className="material-symbols-outlined">explore</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-outline-variant font-mono uppercase">{act.time || '10:00 AM'}</span>
                          <span className="text-[9px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.2 rounded font-bold uppercase tracking-wider font-label-caps">Activity</span>
                        </div>
                        <h5 className="font-bold text-sm text-[#0B1226] mt-2">{act.description}</h5>
                        <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{act.notes}</p>
                      </div>
                    </div>
                  ))}

                  {/* Travel Segments (Transit / Transport) */}
                  {day.travelSegments?.map((seg, sIndex) => (
                    <div key={sIndex} className="bg-white rounded-xl p-5 border border-[#E5DED4] shadow-sm flex items-start gap-4 hover:border-primary-container transition-colors">
                      <div className="w-12 h-12 rounded-lg bg-[#FAF6F0] flex items-center justify-center text-primary flex-shrink-0 animate-pulse">
                        <span className="material-symbols-outlined">
                          {seg.mode === 'flight' ? 'flight' : seg.mode === 'train' ? 'train' : 'directions_car'}
                        </span>
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.2 rounded font-bold uppercase tracking-wider font-label-caps">Transit</span>
                          <span className="text-[10px] font-bold bg-[#ffa630]/20 text-[#6b4000] px-2 py-0.5 rounded uppercase tracking-wider font-label-caps">{seg.mode.toUpperCase()}</span>
                        </div>
                        <h5 className="font-bold text-sm text-[#0B1226] mt-2">
                          Travel from {seg.from?.split(',')[0]} to {seg.to?.split(',')[0]}
                        </h5>
                        <div className="flex gap-4 mt-3 text-xs text-outline font-semibold">
                          <span>⏱️ {seg.durationMinutes ? `${Math.floor(seg.durationMinutes / 60)}h ${seg.durationMinutes % 60}m` : '2h 10m'}</span>
                          <span>📏 {seg.distanceKm} km</span>
                          <span className="text-[#0B1226] font-bold">💰 ₹{seg.cost?.toLocaleString('en-IN') || '4,500'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Stays Suggestions & Maps */}
          <div className="lg:col-span-4 space-y-6">
            <h3 className="font-headline-md text-xl text-[#0B1226] border-b border-[#E5DED4] pb-4">Suggested stays</h3>
            
            <div className="space-y-4">
              {/* Hotel 1 */}
              <div className="bg-white border border-[#E5DED4] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <img 
                  src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80" 
                  alt="hotel stays" 
                  className="w-full h-40 object-cover" 
                />
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-[#0B1226]">The Oberoi Rajvilas</h4>
                    <span className="text-[9px] font-bold text-[#ffa630]">★★★★★</span>
                  </div>
                  <p className="text-xs text-on-surface-variant">4.9 ★ • ₹52,500/night</p>
                  <a href="#" className="text-xs font-bold text-primary hover:underline uppercase tracking-wider font-label-caps block pt-2">View Details →</a>
                </div>
              </div>

              {/* Hotel 2 */}
              <div className="bg-white border border-[#E5DED4] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <img 
                  src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=400&q=80" 
                  alt="hotel stays" 
                  className="w-full h-40 object-cover" 
                />
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-[#0B1226]">ITC Rajputana</h4>
                    <span className="text-[9px] font-bold text-[#ffa630]">★★★★★</span>
                  </div>
                  <p className="text-xs text-on-surface-variant">4.7 ★ • ₹9,000/night</p>
                  <a href="#" className="text-xs font-bold text-primary hover:underline uppercase tracking-wider font-label-caps block pt-2">View Details →</a>
                </div>
              </div>

              {/* Custom maps promo block */}
              <div className="bg-[#885200] text-white p-6 rounded-2xl shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-2xl text-[#ffa630]">map</span>
                  <h4 className="font-bold text-xs uppercase tracking-wider font-label-caps">Want a custom map?</h4>
                </div>
                <p className="text-xs text-white/80 leading-relaxed">
                  We can create a physical print of your journey to keep forever. Frame your travel memory corridor.
                </p>
                <button className="bg-white text-[#0B1226] text-[10px] font-bold uppercase tracking-wider px-4 py-2 rounded-full hover:bg-[#FAF6F0] transition-colors cursor-pointer font-label-caps shadow-sm">
                  Order Print
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LandingLayout>
  );
};

export default ItineraryResultsPage;
