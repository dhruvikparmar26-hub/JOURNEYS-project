import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LandingLayout from '../components/ui/LandingLayout.jsx';
import api from '../utils/api.js';
import { useToast } from '../components/ui/Toast.jsx';

const AnalyticsPage = () => {
  const navigate = useNavigate();
  const { error: showErrorToast } = useToast();
  const [stats, setStats] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const resStats = await api.get('/analytics/me');
      setStats(resStats.data);

      const resTrips = await api.get('/itineraries/users/me/trips');
      setTrips(resTrips.data || []);
    } catch (err) {
      console.error(err);
      showErrorToast('Failed to load personal travel insights.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <LandingLayout>
        <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-12 text-center">
          <span className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin inline-block"></span>
          <p className="mt-4 text-on-surface-variant">Calculating your travel statistics...</p>
        </div>
      </LandingLayout>
    );
  }

  if (!stats) {
    return (
      <LandingLayout>
        <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-12 text-center">
          <h2 className="font-display-lg text-2xl mb-4">No Insights Found</h2>
        </div>
      </LandingLayout>
    );
  }

  const maxTrips = stats.topDestinations?.length > 0 
    ? Math.max(...stats.topDestinations.map(d => d.trips)) 
    : 1;

  return (
    <LandingLayout>
      <div className="max-w-[800px] mx-auto px-margin-mobile md:px-margin-desktop py-12 space-y-12">
        {/* Header */}
        <div>
          <p className="font-label-caps text-[10px] text-outline uppercase tracking-wider mb-2">08 · INSIGHTS</p>
          <h1 className="font-display-lg text-3xl md:text-4xl text-[#0B1226] mb-1">Your travel stats</h1>
          <p className="text-sm text-on-surface-variant">An overview of your digital passport stamps, booking spend, and reviews.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-6 border border-[#E5DED4] shadow-sm text-center">
            <p className="text-xs text-outline-variant font-bold uppercase tracking-wider font-label-caps mb-2">Trips Generated</p>
            <h3 className="font-display-lg text-3xl text-primary">{stats.tripsGenerated || 0}</h3>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-[#E5DED4] shadow-sm text-center">
            <p className="text-xs text-outline-variant font-bold uppercase tracking-wider font-label-caps mb-2">Total Spend</p>
            <h3 className="font-display-lg text-3xl text-primary">₹{stats.totalSpend?.toLocaleString('en-IN') || 0}</h3>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-[#E5DED4] shadow-sm text-center">
            <p className="text-xs text-outline-variant font-bold uppercase tracking-wider font-label-caps mb-2">Cities Visited</p>
            <h3 className="font-display-lg text-3xl text-primary">{(stats.tripsGenerated || 0) * 2}</h3>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-[#E5DED4] shadow-sm text-center">
            <p className="text-xs text-outline-variant font-bold uppercase tracking-wider font-label-caps mb-2">Reviews Given</p>
            <h3 className="font-display-lg text-3xl text-primary">{stats.reviewsGiven || 0}</h3>
          </div>
        </div>

        {/* Top Destinations progress bars */}
        <div className="bg-white rounded-2xl p-8 border border-[#E5DED4] shadow-sm space-y-6">
          <h3 className="font-headline-md text-lg text-[#0B1226]">Where you've traveled most</h3>
          
          {stats.topDestinations && stats.topDestinations.length > 0 ? (
            <div className="space-y-6">
              {stats.topDestinations.map((d, index) => {
                const percent = (d.trips / maxTrips) * 100;
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center text-sm font-semibold">
                      <span className="text-[#0B1226]">
                        {index + 1}. {d.destination || 'India'}
                      </span>
                      <span className="text-outline-variant font-mono">
                        {d.trips} trip{d.trips !== 1 ? 's' : ''} ({Math.round(percent)}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-[#FAF6F0] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#ffa630] rounded-full transition-all duration-500" 
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-on-surface-variant text-center py-6">Start planning to view your top destinations breakdown.</p>
          )}
        </div>

        {/* Rank Banner */}
        <div className="bg-white border border-[#E5DED4] rounded-2xl p-6 shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#FAF6F0] border border-[#E5DED4] flex items-center justify-center text-primary font-bold">
              <span className="material-symbols-outlined">military_tech</span>
            </div>
            <div>
              <span className="font-label-caps text-[9px] text-outline uppercase tracking-wider block mb-0.5">Frequent Flyer Status</span>
              <h4 className="font-bold text-sm text-[#0B1226]">Silver Nomad Explorer</h4>
            </div>
          </div>
          <div className="text-right">
            <span className="font-label-caps text-[9px] text-outline uppercase tracking-wider block mb-0.5">Reward Points</span>
            <span className="font-mono font-bold text-sm text-[#006d35]">12,480 PTS</span>
          </div>
        </div>

        {/* Your Booked Trips & Digital Tickets */}
        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between border-b border-[#E5DED4] pb-4">
            <h3 className="font-headline-md text-xl text-[#0B1226] font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">confirmation_number</span>
              Your Trip Tickets & Boarding Passes
            </h3>
            <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded font-bold uppercase tracking-wider font-label-caps">
              {trips.length} Active Passes
            </span>
          </div>

          {trips.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E5DED4] p-8 text-center space-y-3">
              <span className="material-symbols-outlined text-4xl text-outline-variant">airplane_ticket</span>
              <p className="text-sm text-on-surface-variant">No tickets in your wallet yet. Generate a trip and complete booking to see your boarding pass!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {trips.map((trip) => {
                const isConfirmed = trip.status === 'booked';
                const destLabel = trip.destinations?.[0] || trip.destination?.label || trip.destination || trip.title;
                const promptData = trip.prompt ? (typeof trip.prompt === 'string' ? JSON.parse(trip.prompt) : trip.prompt) : {};
                const originLabel = promptData.origin?.label || 'Delhi, India';
                
                return (
                  <div key={trip._id} className="bg-white rounded-2xl border border-[#E5DED4] shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col md:flex-row relative">
                    {/* Left notched main section */}
                    <div className="flex-[3] p-6 space-y-4">
                      {/* Ticket Header */}
                      <div className="flex justify-between items-center pb-2 border-b border-[#FAF6F0]">
                        <span className="text-[9px] bg-primary/10 text-primary px-2.5 py-0.5 rounded font-bold uppercase tracking-wider font-label-caps">
                          JOURNEYS PASSENGER PASS
                        </span>
                        <span className="font-mono text-xs font-bold text-[#0B1226]">
                          ID: #{trip._id.slice(-6).toUpperCase()}
                        </span>
                      </div>

                      {/* Flight Path Display */}
                      <div className="flex justify-between items-center gap-4 py-2">
                        <div className="flex-1 col-span-1">
                          <span className="font-label-caps text-[9px] text-outline uppercase block mb-1">From (Origin)</span>
                          <span className="font-display-lg text-lg font-bold text-[#0B1226] block truncate">
                            {originLabel.split(',')[0]}
                          </span>
                        </div>
                        
                        <div className="flex-grow flex flex-col items-center">
                          <span className="material-symbols-outlined text-primary rotate-90 text-lg">
                            {trip.days?.[0]?.travelSegments?.[0]?.mode === 'bike' ? 'directions_bike' :
                             trip.days?.[0]?.travelSegments?.[0]?.mode === 'car' ? 'directions_car' :
                             trip.days?.[0]?.travelSegments?.[0]?.mode === 'bus' ? 'directions_bus' :
                             'flight'}
                          </span>
                          <div className="w-full h-px border-b border-dashed border-[#D1C7BD] mt-1"></div>
                        </div>

                        <div className="flex-1 text-right">
                          <span className="font-label-caps text-[9px] text-outline uppercase block mb-1">To (Destination)</span>
                          <span className="font-display-lg text-lg font-bold text-[#0B1226] block truncate">
                            {destLabel.split(',')[0]}
                          </span>
                        </div>
                      </div>

                      {/* Ticket Footer / Metadata Grid */}
                      <div className="grid grid-cols-3 gap-4 pt-2 border-t border-[#FAF6F0] text-left">
                        <div>
                          <span className="font-label-caps text-[9px] text-outline uppercase block mb-0.5">Travel Date</span>
                          <span className="font-semibold text-xs text-[#0B1226]">
                            {new Date(trip.tripStartDate || trip.startDate || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <div>
                          <span className="font-label-caps text-[9px] text-outline uppercase block mb-0.5">Total Cost</span>
                          <span className="font-bold text-xs text-[#0B1226]">
                            ₹{(trip.totalCost || 18000).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div>
                          <span className="font-label-caps text-[9px] text-outline uppercase block mb-0.5">Gate / Status</span>
                          <span className={`font-bold text-xs ${isConfirmed ? 'text-success' : 'text-[#885200]'}`}>
                            {isConfirmed ? 'GATE 2A (CONFIRMED)' : 'PENDING'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Notch Ticket Stub (Stamp) */}
                    <div className="flex-grow flex-1 bg-[#FAF6F0] p-6 border-t md:border-t-0 md:border-l border-dashed border-[#D1C7BD] flex flex-col justify-center items-center gap-4 text-center">
                      <div className={`border-2 font-label-caps text-[10px] font-bold px-3 py-1 uppercase tracking-widest rounded bg-white/80 ${
                        isConfirmed ? 'border-success text-success' : 'border-[#885200] text-[#885200]'
                      }`}>
                        {isConfirmed ? 'BOARDED' : 'SAVED'}
                      </div>
                      
                      <button 
                        onClick={() => navigate(`/itinerary/${trip._id}`)}
                        className="bg-[#0B1226] text-white font-bold px-4 py-2 rounded-xl text-[10px] uppercase hover:bg-primary hover:text-[#0B1226] transition-all cursor-pointer shadow-sm active:scale-95 whitespace-nowrap"
                      >
                        View Ticket
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </LandingLayout>
  );
};

export default AnalyticsPage;
