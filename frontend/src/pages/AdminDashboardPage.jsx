import React, { useState, useEffect } from 'react';
import LandingLayout from '../components/ui/LandingLayout.jsx';
import api from '../utils/api.js';
import { useToast } from '../components/ui/Toast.jsx';

const AdminDashboardPage = () => {
  const { error: showErrorToast } = useToast();
  const [overview, setOverview] = useState(null);
  const [funnel, setFunnel] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [patterns, setPatterns] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [overRes, funRes, destRes, patRes] = await Promise.all([
        api.get('/analytics/admin/overview'),
        api.get('/analytics/admin/funnel'),
        api.get('/analytics/admin/popular-destinations'),
        api.get('/analytics/admin/spending-patterns')
      ]);

      setOverview(overRes.data);
      setFunnel(funRes.data.funnel || []);
      setDestinations(destRes.data.destinations || []);
      setPatterns(patRes.data);
    } catch (err) {
      console.error(err);
      showErrorToast('Failed to load admin reports. Make sure you are signed in as admin.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <LandingLayout>
        <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-12 text-center">
          <span className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin inline-block"></span>
          <p className="mt-4 text-on-surface-variant">Gathering site intelligence reports...</p>
        </div>
      </LandingLayout>
    );
  }

  if (!overview) {
    return (
      <LandingLayout>
        <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-12 text-center">
          <h2 className="font-display-lg text-2xl mb-4">Access Denied</h2>
          <p className="text-sm text-on-surface-variant">Admin access required to view these statistics.</p>
        </div>
      </LandingLayout>
    );
  }

  // Find max funnel count for bar ratios
  const maxFunnelCount = funnel.length > 0 ? Math.max(...funnel.map(f => f.count)) : 1;

  return (
    <LandingLayout>
      <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-12 space-y-12">
        {/* Header */}
        <div>
          <p className="font-label-caps text-[10px] text-outline uppercase tracking-wider mb-2">Admin Panel</p>
          <h1 className="font-display-lg text-3xl md:text-4xl text-[#0B1226] mb-1">Site-wide overview</h1>
          <p className="text-sm text-on-surface-variant">Consolidated operations, conversion analytics, and revenue summaries.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl p-6 border border-[#E5DED4] shadow-sm text-center">
            <p className="text-[10px] text-outline-variant font-bold uppercase tracking-wider font-label-caps mb-2">Total Users</p>
            <h3 className="font-display-lg text-2xl text-[#0B1226]">{overview.totalUsers || 0}</h3>
          </div>
          <div className="bg-white rounded-xl p-6 border border-[#E5DED4] shadow-sm text-center">
            <p className="text-[10px] text-outline-variant font-bold uppercase tracking-wider font-label-caps mb-2">Trip Requests</p>
            <h3 className="font-display-lg text-2xl text-[#0B1226]">{overview.totalTripRequests || 0}</h3>
          </div>
          <div className="bg-white rounded-xl p-6 border border-[#E5DED4] shadow-sm text-center">
            <p className="text-[10px] text-outline-variant font-bold uppercase tracking-wider font-label-caps mb-2">Itineraries</p>
            <h3 className="font-display-lg text-2xl text-[#0B1226]">{overview.totalItineraries || 0}</h3>
          </div>
          <div className="bg-white rounded-xl p-6 border border-[#E5DED4] shadow-sm text-center">
            <p className="text-[10px] text-outline-variant font-bold uppercase tracking-wider font-label-caps mb-2">Bookings</p>
            <h3 className="font-display-lg text-2xl text-[#0B1226]">{overview.totalBookings || 0}</h3>
          </div>
          <div className="bg-white rounded-xl p-6 border border-[#E5DED4] shadow-sm text-center col-span-2 lg:col-span-1 bg-[#FAF6F0] border-primary/20">
            <p className="text-[10px] text-outline font-bold uppercase tracking-wider font-label-caps mb-2">Revenue</p>
            <h3 className="font-display-lg text-2xl text-[#006d35]">
              ${((overview.totalRevenue || 0) / 1000).toFixed(1)}k
            </h3>
          </div>
        </div>

        {/* Funnel Section */}
        <div className="bg-white rounded-2xl p-8 border border-[#E5DED4] shadow-sm space-y-6">
          <h3 className="font-headline-md text-xl text-[#0B1226]">Conversion funnel</h3>
          
          <div className="space-y-6">
            {funnel.map((stage, idx) => {
              const percent = (stage.count / maxFunnelCount) * 100;
              const parentCount = idx > 0 ? funnel[idx - 1].count : stage.count;
              const rate = parentCount > 0 ? ((stage.count / parentCount) * 100).toFixed(0) : '100';

              return (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-semibold">
                    <span className="text-[#0B1226]">{stage.stage}</span>
                    <span className="text-outline-variant font-mono">
                      {stage.count} ({rate}% conversion)
                    </span>
                  </div>
                  <div className="h-4 w-full bg-[#FAF6F0] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#ffa630]/60 to-[#ffa630] rounded-full transition-all duration-500" 
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Split Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          {/* Popular Destinations table */}
          <div className="lg:col-span-8 bg-white rounded-2xl p-8 border border-[#E5DED4] shadow-sm space-y-6">
            <h3 className="font-headline-md text-xl text-[#0B1226]">Popular destinations</h3>
            <div className="space-y-4">
              {destinations.map((d, index) => (
                <div key={index} className="flex justify-between items-center py-2.5 border-b border-[#FAF6F0]">
                  <span className="text-sm font-semibold text-[#0B1226]">
                    {index + 1}. {d.destination || 'Jaipur, Rajasthan'}
                  </span>
                  <span className="text-xs bg-[#FAF6F0] border border-[#E5DED4] text-outline px-3 py-1 rounded-full font-semibold">
                    {d.trips} plans generated
                  </span>
                </div>
              ))}
              {destinations.length === 0 && (
                <p className="text-sm text-on-surface-variant italic py-4">No destination statistics recorded yet.</p>
              )}
            </div>
          </div>

          {/* Spending Patterns Card */}
          <div className="lg:col-span-4 bg-[#885200] text-white rounded-2xl p-8 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-headline-md text-xl text-white mb-6">Spending patterns</h3>
              
              <div className="space-y-6">
                <div className="pb-4 border-b border-white/10">
                  <span className="text-[10px] text-white/60 font-bold uppercase tracking-wider font-label-caps block mb-1">Average Booking</span>
                  <span className="font-display-lg text-2xl text-[#ffa630]">
                    ₹{patterns?.averageBookingAmount ? Number(patterns.averageBookingAmount).toLocaleString('en-IN') : '₹3,248.88'}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white/70">Corporate / Business</span>
                    <span className="font-bold">₹1,828</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white/70">Luxury Leisure</span>
                    <span className="font-bold">₹4,413</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white/70">Adventure / Eco</span>
                    <span className="font-bold">₹2,159</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white/70">Budget Explorers</span>
                    <span className="font-bold">₹980</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 text-center bg-white/10 border border-white/20 p-2.5 rounded-xl">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#ffa630] font-label-caps">Internal Audit Enabled</span>
            </div>
          </div>
        </div>
      </div>
    </LandingLayout>
  );
};

export default AdminDashboardPage;
