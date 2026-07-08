import React, { useState, useEffect } from 'react';
import LandingLayout from '../components/ui/LandingLayout.jsx';
import api from '../utils/api.js';
import { useToast } from '../components/ui/Toast.jsx';

const AnalyticsPage = () => {
  const { error: showErrorToast } = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/analytics/me');
      setStats(data);
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
      </div>
    </LandingLayout>
  );
};

export default AnalyticsPage;
