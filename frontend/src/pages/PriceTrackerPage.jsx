import React, { useState, useEffect } from 'react';
import LandingLayout from '../components/ui/LandingLayout.jsx';
import api from '../utils/api.js';
import { useToast } from '../components/ui/Toast.jsx';

const PriceTrackerPage = () => {
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [mode, setMode] = useState('flight');
  const [thresholdAmount, setThresholdAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/price-alerts');
      setAlerts(data.alerts || []);
    } catch (err) {
      console.error(err);
      showErrorToast('Failed to fetch price alerts.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAlert = async (e) => {
    e.preventDefault();
    if (!origin || !destination || !thresholdAmount) return;

    const payload = {
      origin: { label: origin },
      destination: { label: destination },
      mode,
      thresholdAmount: Number(thresholdAmount),
      currency: 'INR'
    };

    try {
      setSubmitting(true);
      const { data } = await api.post('/price-alerts', payload);
      setAlerts(prev => [data.alert, ...prev]);
      setOrigin('');
      setDestination('');
      setThresholdAmount('');
      showSuccessToast(`Alert set for ${origin} → ${destination}!`);
    } catch (err) {
      console.error(err);
      showErrorToast(err.response?.data?.error || 'Failed to create price alert.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/price-alerts/${id}`);
      setAlerts(prev => prev.filter(a => a._id !== id));
      showSuccessToast('Price alert deleted.');
    } catch (err) {
      console.error(err);
      showErrorToast('Failed to delete alert.');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'paused' : 'active';
    try {
      const { data } = await api.patch(`/price-alerts/${id}`, { status: nextStatus });
      setAlerts(prev => prev.map(a => a._id === id ? data.alert : a));
      showSuccessToast(`Alert ${nextStatus === 'active' ? 'activated' : 'paused'}.`);
    } catch (err) {
      console.error(err);
      showErrorToast('Failed to update alert.');
    }
  };

  const getModeIcon = (alertMode) => {
    switch (alertMode) {
      case 'flight': return 'flight';
      case 'train': return 'train';
      case 'bus': return 'directions_bus';
      case 'cab': return 'local_taxi';
      default: return 'directions_run';
    }
  };

  return (
    <LandingLayout>
      <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-12 space-y-12">
        {/* Header */}
        <div>
          <p className="font-label-caps text-[10px] text-outline uppercase tracking-wider mb-2">04 · TRACK</p>
          <h1 className="font-display-lg text-3xl md:text-4xl text-[#0B1226] mb-2">Watch a route's price</h1>
          <p className="text-sm text-on-surface-variant">Keep an eye on fluctuating fares and get notified the moment they hit your target.</p>
        </div>

        {/* Form Card */}
        <form onSubmit={handleCreateAlert} className="bg-white rounded-2xl p-8 border border-[#E5DED4] shadow-sm space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
            <div className="lg:col-span-4 flex flex-col gap-1.5">
              <label className="font-label-caps text-[10px] text-outline uppercase tracking-wider">Origin</label>
              <input
                type="text"
                placeholder="e.g. Mumbai, India"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="h-12 px-4 rounded-xl border border-[#D1C7BD] bg-white focus:border-primary transition-all outline-none text-sm font-semibold text-[#0B1226]"
                required
              />
            </div>
            <div className="lg:col-span-4 flex flex-col gap-1.5">
              <label className="font-label-caps text-[10px] text-outline uppercase tracking-wider">Destination</label>
              <input
                type="text"
                placeholder="e.g. London, UK"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="h-12 px-4 rounded-xl border border-[#D1C7BD] bg-white focus:border-primary transition-all outline-none text-sm font-semibold text-[#0B1226]"
                required
              />
            </div>
            <div className="lg:col-span-2 flex flex-col gap-1.5">
              <label className="font-label-caps text-[10px] text-outline uppercase tracking-wider">Mode</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="h-12 px-4 rounded-xl border border-[#D1C7BD] bg-white focus:border-primary transition-all outline-none text-sm font-semibold text-[#0B1226]"
              >
                <option value="flight">Flight</option>
                <option value="train">Train</option>
                <option value="bus">Bus</option>
                <option value="cab">Cab</option>
                <option value="all">Any</option>
              </select>
            </div>
            <div className="lg:col-span-2 flex flex-col gap-1.5">
              <label className="font-label-caps text-[10px] text-outline uppercase tracking-wider">Target Price (₹)</label>
              <input
                type="number"
                placeholder="₹15,000"
                value={thresholdAmount}
                onChange={(e) => setThresholdAmount(e.target.value)}
                className="h-12 px-4 rounded-xl border border-[#D1C7BD] bg-white focus:border-primary transition-all outline-none text-sm font-semibold text-[#0B1226]"
                required
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#ffa630] text-[#0B1226] font-bold px-8 py-3 rounded-full hover:brightness-105 active:scale-95 transition-all shadow-sm cursor-pointer disabled:opacity-50 font-label-caps text-xs tracking-wider uppercase"
            >
              {submitting ? 'Setting Alert...' : 'Set alert'}
            </button>
          </div>
        </form>

        {/* Alerts List */}
        <div>
          <h3 className="font-headline-md text-xl text-[#0B1226] mb-6">Your Tracked Routes</h3>
          
          {loading ? (
            <div className="text-center py-12">
              <span className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin inline-block"></span>
            </div>
          ) : alerts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E5DED4] p-12 text-center space-y-3">
              <span className="material-symbols-outlined text-4xl text-outline-variant">notifications_paused</span>
              <h3 className="font-headline-md text-lg text-[#0B1226]">No active price alerts</h3>
              <p className="text-sm text-on-surface-variant">Set an alert above to monitor fare fluctuations.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div key={alert._id} className="bg-white rounded-2xl border border-[#E5DED4] p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-md transition-shadow">
                  {/* Left info: Route with transportation icon */}
                  <div className="flex items-center gap-6 w-full md:w-auto">
                    <div className="w-12 h-12 rounded-full bg-[#FAF6F0] flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">{getModeIcon(alert.mode)}</span>
                    </div>
                    <div className="flex-1 md:flex-none flex items-center gap-4">
                      <div>
                        <h4 className="font-display-lg text-lg text-[#0B1226] uppercase tracking-wide">
                          {alert.origin?.label?.split(',')[0]}
                        </h4>
                        <p className="text-[10px] text-outline-variant font-label-caps uppercase mt-0.5">Target: ₹{alert.thresholdAmount?.toLocaleString('en-IN')}</p>
                      </div>
                      
                      <div className="flex flex-col items-center px-4">
                        <span className="material-symbols-outlined text-outline-variant text-sm rotate-90">flight</span>
                        <div className="w-16 h-px border-b border-dashed border-[#D1C7BD]"></div>
                      </div>

                      <div>
                        <h4 className="font-display-lg text-lg text-[#0B1226] uppercase tracking-wide">
                          {alert.destination?.label?.split(',')[0]}
                        </h4>
                        <p className="text-[10px] text-outline-variant font-label-caps uppercase mt-0.5 capitalize">{alert.mode} fare</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Status Badge */}
                  <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-[#E5DED4]">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider font-label-caps border ${
                        alert.status === 'active' 
                          ? 'bg-[#e6f4ea] text-[#006d35] border-[#3bc48a]/20' 
                          : 'bg-[#fce8e6] text-[#ba1a1a] border-[#ba1a1a]/20'
                      }`}>
                        {alert.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleStatus(alert._id, alert.status)}
                        className="bg-white border border-[#D1C7BD] px-4 py-2 rounded-lg text-xs font-bold text-outline-variant hover:bg-[#FAF6F0] transition-colors cursor-pointer"
                      >
                        {alert.status === 'active' ? 'Pause' : 'Resume'}
                      </button>
                      <button
                        onClick={() => handleDelete(alert._id)}
                        className="text-xs font-bold text-[#ba1a1a] hover:underline uppercase tracking-wider font-label-caps pl-2 cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </LandingLayout>
  );
};

export default PriceTrackerPage;
