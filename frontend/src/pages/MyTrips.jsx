import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api.js';
import LandingLayout from '../components/ui/LandingLayout.jsx';
import { useToast } from '../components/ui/Toast.jsx';

const MyTrips = () => {
  const navigate = useNavigate();
  const { error: showErrorToast } = useToast();
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/itineraries/users/me/trips');
      setItineraries(data || []);
    } catch (err) {
      console.error('Failed to fetch trips:', err);
      showErrorToast('Failed to load your boarding passes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  if (loading) {
    return (
      <LandingLayout>
        <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-12 text-center">
          <span className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin inline-block"></span>
          <p className="mt-4 text-on-surface-variant">Opening your ticket vault...</p>
        </div>
      </LandingLayout>
    );
  }

  return (
    <LandingLayout>
      <div className="max-w-[800px] mx-auto px-margin-mobile md:px-margin-desktop py-12 space-y-12 flex-grow">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <p className="font-label-caps text-[10px] text-outline uppercase tracking-wider mb-2">02 · TRIPS</p>
            <h1 className="font-display-lg text-3xl md:text-4xl text-[#0B1226] mb-1">
              Your boarding pass wallet
            </h1>
            <p className="text-sm text-on-surface-variant">
              Manage your confirmed and shared travel corridors.
            </p>
          </div>
          <button 
            onClick={() => navigate('/planner')} 
            className="bg-[#ffa630] text-[#0B1226] font-bold px-6 py-3 rounded-full hover:brightness-105 active:scale-95 transition-all shadow-sm font-label-caps text-xs uppercase tracking-wider cursor-pointer"
          >
            Plan a new trip
          </button>
        </div>

        {/* Tickets Stack (Image 8 style) */}
        {itineraries.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E5DED4] p-12 text-center space-y-4">
            <span className="material-symbols-outlined text-4xl text-outline-variant">confirmation_number</span>
            <h3 className="font-headline-md text-lg text-[#0B1226]">Your wallet is empty</h3>
            <p className="text-sm text-on-surface-variant">You don't have any generated boarding passes yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {itineraries.map((itinerary, idx) => {
              // Generate mock reference booking ID based on title
              const key = itinerary.title?.slice(0,4).toUpperCase() || 'TRIP';
              const mockBookingId = `#${key}-2026`;
              const mockStatus = itinerary.status === 'saved' ? 'SHARED' : itinerary.status === 'booked' ? 'CONFIRMED' : 'GENERATING';

              const destParts = itinerary.title?.split('to') || [];
              const fromVal = destParts[0]?.trim() || 'Origin';
              const toVal = destParts[1]?.trim() || itinerary.title || 'Jaipur';

              return (
                <div 
                  key={itinerary._id} 
                  className="bg-white rounded-2xl shadow-md border border-[#E5DED4] overflow-hidden flex flex-col md:flex-row relative group hover:shadow-lg transition-shadow"
                >
                  {/* Left notch details (75%) */}
                  <div className="flex-[3] p-8 relative">
                    <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-16 bg-[#FAF6F0] rounded-full border-r border-[#E5DED4] hidden md:block"></div>
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="font-headline-md text-xl text-[#0B1226] font-bold">
                          {fromVal} → {toVal}
                        </h3>
                        <p className="text-xs text-on-surface-variant mt-1">
                          Dates: Jan 15 - Jan 17 • Total cost: ₹{(itinerary.totalCost || 18000).toLocaleString('en-IN')}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-label-caps text-[9px] text-outline uppercase block mb-1">Booking ID</span>
                        <span className="font-mono font-bold text-xs text-[#0B1226]">{mockBookingId}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="h-px flex-grow border-b border-dashed border-[#D1C7BD] relative flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-xl rotate-90 bg-white px-2">flight</span>
                      </div>
                    </div>
                  </div>

                  {/* Right notch ticket stub (25%) */}
                  <div className="flex-1 bg-[#FAF6F0] p-6 flex flex-row md:flex-col items-center justify-between md:justify-center border-t md:border-t-0 md:border-l border-dashed border-[#D1C7BD] text-center gap-4">
                    <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-16 bg-white rounded-full border-l border-[#E5DED4] hidden md:block"></div>
                    
                    <div className={`stamp-badge border-2 font-label-caps text-[10px] font-bold px-4 py-1 uppercase tracking-widest rounded bg-white/60 ${
                      mockStatus === 'CONFIRMED' 
                        ? 'border-[#006d35] text-[#006d35]' 
                        : mockStatus === 'SHARED'
                        ? 'border-[#885200] text-[#885200]'
                        : 'border-[#ffa630] text-[#ffa630] animate-pulse'
                    }`}>
                      {mockStatus}
                    </div>

                    <button 
                      onClick={() => navigate(`/itinerary/${itinerary._id}`)} 
                      className="bg-[#0B1226] text-white px-6 py-2 rounded-full font-label-caps text-[10px] uppercase hover:bg-[#ffa630] hover:text-[#0B1226] transition-all cursor-pointer font-bold shadow-sm active:scale-95"
                    >
                      View
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Stacking pass motif decoration at the bottom */}
        {itineraries.length > 0 && (
          <div className="flex justify-center pt-8 opacity-25">
            <span className="material-symbols-outlined text-6xl text-outline-variant">style</span>
          </div>
        )}
      </div>
    </LandingLayout>
  );
};

export default MyTrips;
