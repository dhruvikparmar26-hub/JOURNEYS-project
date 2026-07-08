import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useSearchParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { Terminal } from 'lucide-react';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider, useToast } from './components/ui/Toast.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import useAuth from './hooks/useAuth.js';
import api from './utils/api.js';

// Layout shell
import LandingLayout from './components/ui/LandingLayout.jsx';

// Direct Link Auth Pages (kept for email verify / resets)
import VerifyEmailPage from './pages/auth/VerifyEmailPage.jsx';
import ResetPasswordPage from './pages/auth/ResetPasswordPage.jsx';
import TwoFactorSetupPage from './pages/auth/TwoFactorSetupPage.jsx';

// Page Views
import ItineraryResultsPage from './pages/ItineraryResultsPage.jsx';
import MyTripsPage from './pages/MyTrips.jsx';
import SettingsPage from './pages/Settings.jsx';
import ExplorePage from './pages/Explore.jsx';
import SharedItineraryPage from './pages/SharedItinerary.jsx';

// New Phase 2-5 Pages
import PackingListPage from './pages/PackingListPage.jsx';
import GroupTripsPage from './pages/GroupTripsPage.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';
import WishlistPage from './pages/WishlistPage.jsx';
import PriceTrackerPage from './pages/PriceTrackerPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import ReviewsPage from './pages/ReviewsPage.jsx';
import AdminDashboardPage from './pages/AdminDashboardPage.jsx';

// New Premium Pages
import DestinationDetailPage from './pages/DestinationDetailPage.jsx';
import HelpCenterPage from './pages/HelpCenterPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import BookingDetailPage from './pages/BookingDetailPage.jsx';
import AIChatPage from './pages/AIChatPage.jsx';

// Auth Modal
import AuthModal from './components/AuthModal.jsx';

// Premium Utilities
import CustomCursor from './components/ui/CustomCursor.jsx';
import PageTransition, { ScrollProgress } from './components/ui/PageTransition.jsx';

// ─── Component 1: Landing Page (The Boarding Pass homepage design) ───
const LandingPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [show2FAPrompt, setShow2FAPrompt] = useState(false);

  // Check if user has TOTP enabled after login
  useEffect(() => {
    if (isAuthenticated && user && !user.totpEnabled) {
      const hasPrompted = sessionStorage.getItem('hasPrompted2FA');
      if (!hasPrompted) {
        setShow2FAPrompt(true);
      }
    }
  }, [isAuthenticated, user]);

  const handlePlanTrip = (e) => {
    e.preventDefault();
    navigate('/planner', { state: { prefillFrom: from, prefillTo: to } });
  };

  return (
    <LandingLayout>
      {/* 2FA Modal Prompt (Image 4 style) */}
      {show2FAPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full border border-[#E5DED4] shadow-2xl text-center space-y-6 mx-4">
            <div className="w-12 h-12 rounded-full bg-[#FAF6F0] flex items-center justify-center text-primary mx-auto">
              <span className="material-symbols-outlined text-2xl text-[#ffa630]">lock</span>
            </div>
            <div className="space-y-2">
              <h3 className="font-display-lg text-xl text-[#0B1226]">Secure your account?</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Enable two-factor authentication to keep your travel plans and personal data safe.
              </p>
            </div>
            <div className="space-y-3 pt-2">
              <button
                onClick={() => {
                  sessionStorage.setItem('hasPrompted2FA', 'true');
                  setShow2FAPrompt(false);
                  navigate('/settings/2fa');
                }}
                className="w-full bg-[#ffa630] text-[#0B1226] py-3 rounded-full font-bold hover:brightness-105 active:scale-95 transition-all shadow-md cursor-pointer font-label-caps text-xs uppercase tracking-wider"
              >
                Set up 2FA now
              </button>
              <button
                onClick={() => {
                  sessionStorage.setItem('hasPrompted2FA', 'true');
                  setShow2FAPrompt(false);
                }}
                className="w-full text-outline-variant py-2 rounded-full font-bold hover:bg-[#FAF6F0] transition-all cursor-pointer font-label-caps text-[10px] uppercase tracking-widest"
              >
                Skip for now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-inverse-surface text-background flex items-center justify-center min-h-[calc(100vh-280px)] py-16 md:py-24">
        <div className="absolute top-0 left-0 w-1/2 h-full glow-lagoon opacity-40"></div>
        <div className="absolute bottom-0 right-0 w-1/2 h-full glow-lagoon opacity-40"></div>
        <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop relative z-10 w-full py-20">
          <div className="md:w-2/3">
            <p className="font-label-caps text-label-caps text-primary-container mb-4 tracking-widest uppercase">Boarding now</p>
            <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-background mb-6 leading-tight">
              Every trip starts as a ticket you haven't written yet.
            </h1>
            <p className="font-body-lg text-body-lg text-background/80 max-w-xl mb-12">
              Your adventure is waiting for its first stamp. Plan, track, and share your world with Journeys.
            </p>
          </div>
          {/* Overlay Route Planner Card */}
          <form onSubmit={handlePlanTrip} className="bg-surface-container-lowest rounded-xl p-8 shadow-2xl relative mt-8">
            <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-16 bg-inverse-surface rounded-full"></div>
            <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-16 bg-inverse-surface rounded-full"></div>
            <div className="flex flex-col md:flex-row items-center gap-gutter">
              {/* From Input */}
              <div className="w-full md:w-1/3">
                <label className="font-label-caps text-[10px] text-outline uppercase block mb-1">From</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-tertiary text-sm">flight_takeoff</span>
                  <input
                    className="w-full pl-10 pr-4 py-3 bg-background border-none rounded-lg font-body-md focus:ring-2 focus:ring-primary-container transition-all outline-none"
                    type="text"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    placeholder="E.g. Mumbai, India"
                  />
                </div>
              </div>
              {/* Route Motif */}
              <div className="flex items-center justify-center gap-4 px-4 min-w-[120px]">
                <div className="h-[2px] flex-grow border-b-2 border-dotted border-outline relative flex items-center justify-center">
                  <div className="bg-surface-container-lowest px-2 -mt-1">
                    <span className="material-symbols-outlined text-primary-container text-xl rotate-90">flight</span>
                  </div>
                </div>
              </div>
              {/* To Input */}
              <div className="w-full md:w-1/3">
                <label className="font-label-caps text-[10px] text-outline uppercase block mb-1">To</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-tertiary text-sm">flight_land</span>
                  <input
                    className="w-full pl-10 pr-4 py-3 bg-background border-none rounded-lg font-body-md focus:ring-2 focus:ring-primary-container transition-all outline-none"
                    type="text"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    placeholder="E.g. Kyoto, Japan"
                  />
                </div>
              </div>
              {/* Action */}
              <div className="w-full md:w-auto">
                <button type="submit" className="w-full bg-primary-container text-on-primary-container px-8 py-4 rounded-full font-label-caps text-label-caps font-bold hover:brightness-110 shadow-md active:scale-95 transition-all cursor-pointer">
                  Plan this trip
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-section-gap bg-background">
        <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="flex flex-col items-center mb-16 text-center">
            <p className="font-label-caps text-label-caps text-primary-container mb-2">Features</p>
            <h2 className="font-display-lg text-headline-md md:text-display-lg text-on-surface">Everything, in one gate</h2>
            <p className="font-body-md text-on-surface-variant max-w-lg mt-4">Your entire travel universe organized within a cohesive, boarding-pass inspired interface.</p>
          </div>
          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
            {/* Feature Card 1: Trip Planner */}
            <div onClick={() => navigate('/planner')} className="bg-white p-6 rounded-xl border border-outline-variant/30 hover:border-primary-container transition-all group cursor-pointer hover:shadow-lg">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-lg bg-primary-container/20 flex items-center justify-center text-primary-container transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>flight</span>
                </div>
                <span className="font-label-caps text-[10px] text-outline-variant stamp-badge border border-outline-variant px-2 py-1 rounded">01 · PLAN</span>
              </div>
              <h3 className="font-headline-md text-lg mb-2 text-[#0B1226]">Trip Planner</h3>
              <p className="text-sm text-on-surface-variant mb-6">Design your itinerary with granular detail and custom maps.</p>
              <Link className="font-label-caps text-xs text-primary group-hover:translate-x-1 inline-block transition-transform font-bold" to="/planner" onClick={(e) => e.stopPropagation()}>Open →</Link>
            </div>
            {/* Feature Card 2: My Trips */}
            <div onClick={() => navigate('/my-trips')} className="bg-white p-6 rounded-xl border border-outline-variant/30 hover:border-primary-container transition-all group cursor-pointer hover:shadow-lg">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-lg bg-primary-container/20 flex items-center justify-center text-primary-container transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>confirmation_number</span>
                </div>
                <span className="font-label-caps text-[10px] text-outline-variant stamp-badge border border-outline-variant px-2 py-1 rounded">02 · TRACK</span>
              </div>
              <h3 className="font-headline-md text-lg mb-2 text-[#0B1226]">My Trips</h3>
              <p className="text-sm text-on-surface-variant mb-6">Keep all your digital tickets and bookings in one secure vault.</p>
              <Link className="font-label-caps text-xs text-primary group-hover:translate-x-1 inline-block transition-transform font-bold" to="/my-trips" onClick={(e) => e.stopPropagation()}>Open →</Link>
            </div>
            {/* Feature Card 3: Wishlist */}
            <div onClick={() => navigate('/wishlist')} className="bg-white p-6 rounded-xl border border-outline-variant/30 hover:border-primary-container transition-all group cursor-pointer hover:shadow-lg">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-lg bg-primary-container/20 flex items-center justify-center text-primary-container transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                </div>
                <span className="font-label-caps text-[10px] text-outline-variant stamp-badge border border-outline-variant px-2 py-1 rounded">03 · DREAM</span>
              </div>
              <h3 className="font-headline-md text-lg mb-2 text-[#0B1226]">Wishlist</h3>
              <p className="text-sm text-on-surface-variant mb-6">Save destinations and experiences for future explorations.</p>
              <Link className="font-label-caps text-xs text-primary group-hover:translate-x-1 inline-block transition-transform font-bold" to="/wishlist" onClick={(e) => e.stopPropagation()}>Open →</Link>
            </div>
            {/* Feature Card 4: Price Alerts */}
            <div onClick={() => navigate('/price-tracker')} className="bg-white p-6 rounded-xl border border-outline-variant/30 hover:border-primary-container transition-all group cursor-pointer hover:shadow-lg">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-lg bg-primary-container/20 flex items-center justify-center text-primary-container transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                </div>
                <span className="font-label-caps text-[10px] text-outline-variant stamp-badge border border-outline-variant px-2 py-1 rounded">04 · SAVE</span>
              </div>
              <h3 className="font-headline-md text-lg mb-2 text-[#0B1226]">Price Alerts</h3>
              <p className="text-sm text-on-surface-variant mb-6">Get notified instantly when your dream flight hits your budget.</p>
              <Link className="font-label-caps text-xs text-primary group-hover:translate-x-1 inline-block transition-transform font-bold" to="/price-tracker" onClick={(e) => e.stopPropagation()}>Open →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Signature Boarding Pass Section */}
      <section className="pb-section-gap px-margin-mobile md:px-margin-desktop bg-background">
        <div className="max-w-[800px] mx-auto bg-surface-container-lowest rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row relative group">
          <div className="flex-[3] p-10 relative bg-white">
            <div className="flex justify-between items-center mb-8">
              <div>
                <p className="font-label-caps text-[10px] text-outline uppercase">Next Expedition</p>
                <h3 className="font-headline-md text-2xl text-[#0B1226]">The Golden Triangle</h3>
              </div>
              <div className="text-right">
                <p className="font-label-caps text-[10px] text-outline uppercase">Gate</p>
                <p className="font-label-caps text-lg text-primary-container">A24</p>
              </div>
            </div>
            <div className="flex items-center gap-6 mb-10">
              <div className="flex-1">
                <p className="font-display-lg text-3xl">DEL</p>
                <p className="text-xs text-on-surface-variant font-label-caps">New Delhi</p>
              </div>
              <div className="flex-[2] flex flex-col items-center">
                <span className="material-symbols-outlined text-primary-container mb-1 transition-transform duration-300 group-hover:translate-x-1">flight</span>
                <div className="w-full h-px border-b-2 border-dotted border-outline"></div>
              </div>
              <div className="flex-1 text-right">
                <p className="font-display-lg text-3xl">JAI</p>
                <p className="text-xs text-on-surface-variant font-label-caps">Jaipur</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="font-label-caps text-[10px] text-outline uppercase mb-1">Passenger</p>
                <p className="font-body-md font-semibold">Aditya Sharma</p>
              </div>
              <div>
                <p className="font-label-caps text-[10px] text-outline uppercase mb-1">Date</p>
                <p className="font-body-md font-semibold">14 OCT 24</p>
              </div>
            </div>
          </div>
          <div className="w-[2px] h-full realistic-perforation hidden md:block">
            <div className="absolute inset-y-0 left-0 border-l-2 border-dashed border-outline-variant/40"></div>
          </div>
          <div className="flex-1 bg-[#FAF6F0] p-8 flex flex-col items-center justify-center text-center">
            <div className="bg-white p-2 rounded-lg mb-4 shadow-sm transition-transform duration-300 group-hover:scale-105">
              <span className="material-symbols-outlined text-primary-container text-4xl">qr_code_2</span>
            </div>
            <div className="stamp-badge border-2 border-secondary text-secondary px-4 py-1 font-label-caps text-xs mb-6 font-bold uppercase tracking-widest bg-white/50">Confirmed</div>
            <button onClick={() => navigate('/planner')} className="bg-on-surface text-background px-6 py-2 rounded-full font-label-caps text-[10px] uppercase hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-md cursor-pointer">Details</button>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
};

// ─── Component 2: Trip Planner Form Page (Image 5 & 6) ───
const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { error: showErrorToast, success: showSuccessToast } = useToast();

  // Form parameters
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budgetMin, setBudgetMin] = useState('50000');
  const [budgetMax, setBudgetMax] = useState('200000');

  // Generation status
  const [isGenerating, setIsGenerating] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState([]);
  const [logIndex, setLogIndex] = useState(0);

  // Apply state parameters prefilled from landing page or explore destination card
  useEffect(() => {
    if (location.state) {
      if (location.state.prefillFrom) setOrigin(location.state.prefillFrom);
      if (location.state.prefillTo) setDestination(location.state.prefillTo);
      if (location.state.prefillDestination) setDestination(location.state.prefillDestination);
    }
  }, [location.state]);

  const simulatedLogs = [
    'Weather check: 18°C and clear in destination...',
    'Activity agent prioritizing local reviews and walking paths...',
    'Hotel agent matching suites with high rating scores...',
    'Cross-referencing logistics maps and train schedules...',
    'Resolving time windows and routes corridors...',
    'Optimizing transport connections & booking indexes...',
    'Generating itinerary days... almost complete.'
  ];

  // Simulating logging progress in agent console
  useEffect(() => {
    if (!isGenerating) return;
    if (logIndex >= simulatedLogs.length) return;

    const timer = setTimeout(() => {
      setConsoleLogs(prev => [...prev, simulatedLogs[logIndex]]);
      setLogIndex(prev => prev + 1);
    }, 8000 / simulatedLogs.length); // complete in 8 seconds

    return () => clearTimeout(timer);
  }, [isGenerating, logIndex]);

  const handleGenerateItinerary = async (e) => {
    e.preventDefault();
    if (!origin || !destination || !startDate || !endDate) return;

    try {
      setIsGenerating(true);
      setConsoleLogs(['System listening. Ready to build itinerary corridors.', 'Initialized connection.']);
      setLogIndex(0);

      // Trigger backend call
      const payload = {
        origin: { label: origin, lat: 28.6139, lng: 77.2090 }, // Delhi center fallbacks
        destination: { label: destination, lat: 26.9124, lng: 75.7873 }, // Jaipur center fallbacks
        startDate,
        endDate,
        budgetMin: Number(budgetMin),
        budgetMax: Number(budgetMax)
      };

      const { data } = await api.post('/itineraries', payload);

      // Once simulation finishes, redirect
      setTimeout(() => {
        setIsGenerating(false);
        showSuccessToast('Itinerary generated successfully!');
        navigate(`/itinerary/${data.itineraryId}`);
      }, 8500);

    } catch (err) {
      console.error(err);
      setIsGenerating(false);
      showErrorToast(err.response?.data?.error || 'Failed to generate itinerary. Make sure you are logged in.');
    }
  };

  const handlePrefillAmalfi = () => {
    setDestination('Amalfi Coast, Italy');
    setStartDate('2026-06-15');
    setEndDate('2026-06-22');
    setBudgetMin('150000');
    setBudgetMax('450000');
    showSuccessToast('Prefilled details for Amalfi Coast!');
  };

  // ─── RENDERING 1: Agent Console Loading View (Image 6) ───────────
  if (isGenerating) {
    return (
      <LandingLayout>
        <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-12 space-y-8 flex-grow">
          <div>
            <p className="font-label-caps text-[10px] text-[#ffa630] uppercase tracking-wider mb-2">01 · PLAN</p>
            <h1 className="font-display-lg text-3xl text-[#0B1226]">Where are we headed?</h1>
            <p className="text-sm text-on-surface-variant max-w-xl">
              Our specialized routing, hotel, and activity agents are currently collaborating to build your bespoke itinerary in real-time.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
            {/* The Agent Console screen */}
            <div className="lg:col-span-8 bg-[#0B1226] rounded-2xl border border-white/10 shadow-2xl overflow-hidden font-mono text-xs text-white/80">
              <div className="bg-white/5 px-6 py-4 border-b border-white/10 flex items-center justify-between">
                <span className="flex items-center gap-2 text-[#ffa630] text-[10px] font-bold tracking-widest font-label-caps">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ffa630] animate-pulse"></span>
                  AGENT CONSOLE
                </span>
                <span className="text-[10px] text-white/40 tracking-wider">#4bc2x</span>
              </div>
              <div className="p-8 space-y-4 min-h-[320px] max-h-[400px] overflow-y-auto">
                <h2 className="text-[#ffa630] text-lg font-bold uppercase tracking-wide border-b border-white/5 pb-3">
                  ROUTING AGENT OPTIMIZING PATHS...
                </h2>
                <div className="space-y-2.5 text-white/70">
                  {consoleLogs.map((log, idx) => (
                    <div key={idx} className="flex gap-4">
                      <span className="text-white/40 select-none">[{idx + 1}]</span>
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white/5 px-6 py-3 border-t border-white/5 flex justify-between items-center text-[10px] text-white/40">
                <span>PROGRESS: {Math.min(Math.round((logIndex / simulatedLogs.length) * 100), 100)}%</span>
                <span className="font-mono">LAT: 28.6139 N | LON: 77.2090 E</span>
              </div>
            </div>

            {/* Travel Summary preview card */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-2xl border border-[#E5DED4] p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#FAF6F0]">
                  <h3 className="font-headline-md text-lg text-[#0B1226]">{origin || 'Start'} → {destination || 'Destination'}</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-on-surface-variant font-medium">Duration</span>
                    <span className="font-bold text-[#0B1226]">Dynamic Days</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-on-surface-variant font-medium">Status</span>
                    <span className="font-bold text-[#006d35] uppercase tracking-wider bg-[#e6f4ea] px-2 py-0.5 rounded text-[10px] font-label-caps border border-[#3bc48a]/20">Generating</span>
                  </div>
                </div>
                <div className="border-t border-[#FAF6F0] pt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-on-surface-variant">FLIGHT AGENT</span>
                    <span className="font-semibold text-primary">SEARCHING...</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-on-surface-variant">HOTEL AGENT</span>
                    <span className="font-semibold text-primary">OPTIMIZING...</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-on-surface-variant">CORRIDOR STATUS</span>
                    <span className="font-semibold text-[#885200]">PROCESSING</span>
                  </div>
                </div>
              </div>

              {/* Gold Pro Tip */}
              <div className="bg-[#885200] text-white p-6 rounded-2xl shadow-sm space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider font-label-caps text-[#ffa630]">Pro-Tip</h4>
                <p className="text-xs text-white/80 leading-relaxed">
                  With our search, you can add "Culinary experiences" to your preferences to help our Activity Agent narrow down top-tier sushi counters.
                </p>
              </div>
            </div>
          </div>
        </div>
      </LandingLayout>
    );
  }

  // ─── RENDERING 2: Plan Form View (Image 5) ───────────────────────
  return (
    <LandingLayout>
      <div className="max-w-[800px] mx-auto px-margin-mobile md:px-margin-desktop py-12 space-y-12 flex-grow">
        {/* Title */}
        <div>
          <p className="font-label-caps text-[10px] text-primary uppercase tracking-wider mb-2">01 · PLAN</p>
          <h1 className="font-display-lg text-3xl md:text-4xl text-[#0B1226] mb-2">Where are we headed?</h1>
          <p className="text-sm text-on-surface-variant">
            Our routing, hotel, and activity agents are building your trip live. Just tell us the basics, and we'll handle the logistics.
          </p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleGenerateItinerary} className="bg-white rounded-2xl p-8 border border-[#E5DED4] shadow-sm space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Origin */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-caps text-[10px] text-outline uppercase tracking-wider">Origin</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant text-sm">flight_takeoff</span>
                <input
                  type="text"
                  placeholder="e.g. Mumbai, India"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full h-12 pl-10 pr-4 rounded-xl border border-[#D1C7BD] bg-white focus:border-primary transition-all outline-none text-sm font-semibold text-[#0B1226]"
                  required
                />
              </div>
            </div>
            {/* Destination */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-caps text-[10px] text-outline uppercase tracking-wider">Destination</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant text-sm">flight_land</span>
                <input
                  type="text"
                  placeholder="e.g. Kyoto, Japan"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full h-12 pl-10 pr-4 rounded-xl border border-[#D1C7BD] bg-white focus:border-primary transition-all outline-none text-sm font-semibold text-[#0B1226]"
                  required
                />
              </div>
            </div>
            {/* Start Date */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-caps text-[10px] text-outline uppercase tracking-wider">Start Date</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant text-sm">calendar_today</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full h-12 pl-10 pr-4 rounded-xl border border-[#D1C7BD] bg-white focus:border-primary transition-all outline-none text-sm font-semibold text-[#0B1226]"
                  required
                />
              </div>
            </div>
            {/* End Date */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-caps text-[10px] text-outline uppercase tracking-wider">End Date</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant text-sm">calendar_today</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full h-12 pl-10 pr-4 rounded-xl border border-[#D1C7BD] bg-white focus:border-primary transition-all outline-none text-sm font-semibold text-[#0B1226]"
                  required
                />
              </div>
            </div>
            {/* Budget Min */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-caps text-[10px] text-outline uppercase tracking-wider">Budget Min (₹)</label>
              <input
                type="number"
                placeholder="50,000"
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-[#D1C7BD] bg-white focus:border-primary transition-all outline-none text-sm font-semibold text-[#0B1226]"
                required
              />
            </div>
            {/* Budget Max */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-caps text-[10px] text-outline uppercase tracking-wider">Budget Max (₹)</label>
              <input
                type="number"
                placeholder="2,000,000"
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-[#D1C7BD] bg-white focus:border-primary transition-all outline-none text-sm font-semibold text-[#0B1226]"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full h-14 bg-[#ffa630] text-[#0B1226] font-bold rounded-xl hover:brightness-105 active:scale-95 transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 text-sm uppercase tracking-wider font-label-caps"
          >
            <span className="material-symbols-outlined text-lg">sparkles</span>
            Generate my itinerary
          </button>
        </form>

        {/* Amalfi Coast Trending Card */}
        <div 
          onClick={handlePrefillAmalfi}
          className="bg-white rounded-2xl border border-[#E5DED4] overflow-hidden shadow-sm flex flex-col md:flex-row hover:shadow-md transition-shadow cursor-pointer group"
        >
          <div className="flex-[3] p-8 md:p-10 space-y-6">
            <div>
              <span className="text-[10px] bg-[#ffa630]/20 text-[#885200] border border-[#ffa630]/30 px-3 py-1 rounded font-bold uppercase tracking-wider font-label-caps">
                Trending Destination
              </span>
              <h3 className="font-headline-md text-2xl text-[#0B1226] mt-4 leading-tight group-hover:text-primary transition-colors">
                The Amalfi Coast
              </h3>
              <p className="text-sm text-on-surface-variant leading-relaxed mt-3">
                Explore the rugged shoreline dotted with small beaches and pastel-colored fishing villages. Our AI can map out the perfect 7-day coastal retreat.
              </p>
            </div>
            <div className="flex items-center gap-4 border-t border-[#FAF6F0] pt-6">
              <div className="flex -space-x-2.5 overflow-hidden">
                <img className="inline-block h-7 w-7 rounded-full ring-2 ring-white" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=80&h=80&q=80" alt="avatar" />
                <img className="inline-block h-7 w-7 rounded-full ring-2 ring-white" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=80&h=80&q=80" alt="avatar" />
                <img className="inline-block h-7 w-7 rounded-full ring-2 ring-white" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=80&h=80&q=80" alt="avatar" />
              </div>
              <span className="text-xs font-semibold text-outline-variant font-label-caps uppercase tracking-wide">
                +120 others planned this today
              </span>
            </div>
          </div>
          <div className="flex-1 min-h-[200px] md:min-h-0 relative">
            <img 
              src="https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=400&q=80" 
              alt="Amalfi Coast" 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>
        </div>
      </div>
    </LandingLayout>
  );
};

// ─── Component 3: Sign Up Page (Our beautifully boxed form) ───
const SignupPage = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState('');
  const [signupError, setSignupError] = useState('');

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setSignupError('');
    setSignupSuccess('');

    // Pre-validate password requirements
    const isLengthOk = signupPassword.length >= 12;
    const hasUpper = /[A-Z]/.test(signupPassword);
    const hasLower = /[a-z]/.test(signupPassword);
    const hasDigit = /[0-9]/.test(signupPassword);
    const hasSpecial = /[^a-zA-Z0-9]/.test(signupPassword);

    if (!isLengthOk || !hasUpper || !hasLower || !hasDigit || !hasSpecial) {
      setSignupError('Password does not meet all the security requirements.');
      return;
    }

    setSignupLoading(true);
    try {
      const res = await signup({ name: signupName, email: signupEmail.toLowerCase(), password: signupPassword });
      setSignupSuccess(res.message || 'Account created successfully! Please check your email to verify.');
      setSignupName('');
      setSignupEmail('');
      setSignupPassword('');
    } catch (err) {
      setSignupError(err.response?.data?.error || err.message || 'Registration failed.');
    } finally {
      setSignupLoading(false);
    }
  };

  return (
    <LandingLayout>
      <section className="min-h-[calc(100vh-280px)] flex items-center justify-center px-margin-mobile md:px-margin-desktop py-16">
        <div className="w-full max-w-[460px] bg-white border border-[#E5DED4] rounded-2xl p-8 md:p-10 shadow-xl flex flex-col items-center text-center">
          <span className="font-label-caps text-label-caps text-on-background uppercase tracking-widest mb-4 opacity-80">
            Get Started
          </span>
          <h1 className="font-headline-md text-headline-md text-on-background mb-8">
            Create your account
          </h1>
          {signupSuccess ? (
            <div className="w-full bg-[#e6f4ea]/10 border border-[#3bc48a]/30 rounded-xl p-8 text-center flex flex-col items-center shadow-sm">
              <span className="material-symbols-outlined text-primary text-5xl mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <h3 className="font-headline-md text-xl mb-2 text-on-surface">Registration Success</h3>
              <p className="text-sm text-on-surface-variant mb-6">{signupSuccess}</p>
              <button
                onClick={() => navigate('/login')}
                className="bg-primary-container text-on-primary-container px-6 py-2 rounded-lg font-label-caps text-label-caps hover:brightness-110 transition-all cursor-pointer font-bold"
              >
                Go to Log In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSignupSubmit} className="w-full space-y-6 text-left">
              {signupError && (
                <div className="p-4 bg-error/10 border border-error/20 text-[#ba1a1a] rounded-xl text-sm flex gap-2 items-center">
                  <span className="material-symbols-outlined text-lg flex-shrink-0">error</span>
                  <span>{signupError}</span>
                </div>
              )}

              {/* Full Name */}
              <div className="flex flex-col gap-2">
                <label className="font-label-caps text-label-caps text-on-surface-variant ml-1" htmlFor="full-name">
                  Full name
                </label>
                <input
                  className="w-full h-12 px-4 rounded-xl border border-[#D1C7BD] bg-white focus:border-primary transition-all outline-none"
                  id="full-name"
                  placeholder="E.g. Amelia Earhart"
                  required
                  type="text"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-2">
                <label className="font-label-caps text-label-caps text-on-surface-variant ml-1" htmlFor="email">
                  Email
                </label>
                <input
                  className="w-full h-12 px-4 rounded-xl border border-[#D1C7BD] bg-white focus:border-primary transition-all outline-none"
                  id="email"
                  placeholder="amelia@journeys.com"
                  required
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-2">
                <label className="font-label-caps text-label-caps text-on-surface-variant ml-1" htmlFor="password">
                  Password
                </label>
                <input
                  className="w-full h-12 px-4 rounded-xl border border-[#D1C7BD] bg-white focus:border-primary transition-all outline-none"
                  id="password"
                  placeholder="••••••••"
                  required
                  type="password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                />
                
                {/* Password requirements visual indicator */}
                <div className="mt-2 space-y-1.5 text-xs text-on-surface-variant/80 ml-1">
                  <p className="font-bold font-label-caps text-[10px] text-outline uppercase tracking-wider mb-1">Requirements</p>
                  <div className="flex items-center gap-2">
                    <span className={`material-symbols-outlined text-[16px] ${signupPassword.length >= 12 ? 'text-[#006d35]' : 'text-outline/40'}`}>
                      {signupPassword.length >= 12 ? 'check_circle' : 'circle'}
                    </span>
                    <span>At least 12 characters</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`material-symbols-outlined text-[16px] ${/[A-Z]/.test(signupPassword) ? 'text-[#006d35]' : 'text-outline/40'}`}>
                      {/[A-Z]/.test(signupPassword) ? 'check_circle' : 'circle'}
                    </span>
                    <span>At least one uppercase letter</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`material-symbols-outlined text-[16px] ${/[a-z]/.test(signupPassword) ? 'text-[#006d35]' : 'text-outline/40'}`}>
                      {/[a-z]/.test(signupPassword) ? 'check_circle' : 'circle'}
                    </span>
                    <span>At least one lowercase letter</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`material-symbols-outlined text-[16px] ${/[0-9]/.test(signupPassword) ? 'text-[#006d35]' : 'text-outline/40'}`}>
                      {/[0-9]/.test(signupPassword) ? 'check_circle' : 'circle'}
                    </span>
                    <span>At least one number</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`material-symbols-outlined text-[16px] ${/[^a-zA-Z0-9]/.test(signupPassword) ? 'text-[#006d35]' : 'text-outline/40'}`}>
                      {/[^a-zA-Z0-9]/.test(signupPassword) ? 'check_circle' : 'circle'}
                    </span>
                    <span>At least one special character</span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                className="w-full h-14 bg-[#ffa630] text-[#0B1226] font-bold rounded-full cursor-pointer active:scale-95 transition-all hover:brightness-110 shadow-sm mt-4 flex items-center justify-center gap-2"
                type="submit"
                disabled={signupLoading}
              >
                {signupLoading ? (
                  <span className="w-5 h-5 border-2 border-on-primary-container border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>
          )}

          {!signupSuccess && (
            <div className="mt-8 font-body-md text-on-surface-variant">
              Already have an account? 
              <button onClick={() => navigate('/login')} className="text-primary font-semibold hover:underline cursor-pointer ml-1">Log In</button>
            </div>
          )}

          {/* Ink Stamp Motif */}
          <div className="mt-10 border-2 border-primary/20 text-primary/20 px-4 py-1 font-label-caps text-label-caps rounded-full select-none rotate-[-3deg] inline-block">
            EST. 2026
          </div>
        </div>
      </section>
    </LandingLayout>
  );
};

// ─── Component 4: Log In Page (Our beautifully boxed form) ───
const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginSuccess('');
    setLoginLoading(true);

    try {
      const res = await login({ email: loginEmail.toLowerCase(), password: loginPassword });
      if (res.requiresTOTP) {
        throw new Error('Two-factor authentication is required. Direct login from this client is temporarily restricted.');
      }
      setLoginSuccess('Logged in successfully!');
      setLoginEmail('');
      setLoginPassword('');
      setTimeout(() => {
        setLoginSuccess('');
        navigate('/');
      }, 1500);
    } catch (err) {
      setLoginError(err.response?.data?.error || err.message || 'Login failed.');
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <LandingLayout>
      <section className="min-h-[calc(100vh-280px)] flex items-center justify-center px-margin-mobile md:px-margin-desktop py-16">
        <div className="w-full max-w-[460px] bg-white border border-[#E5DED4] rounded-2xl p-8 md:p-10 shadow-xl flex flex-col items-center text-center">
          <span className="font-label-caps text-label-caps text-on-background uppercase tracking-widest mb-4 opacity-80">
            Welcome back
          </span>
          <h1 className="font-headline-md text-headline-md text-on-background mb-8">
            Log in to Journeys
          </h1>
          {loginSuccess ? (
            <div className="w-full bg-[#e6f4ea]/10 border border-[#3bc48a]/30 rounded-xl p-8 text-center flex flex-col items-center shadow-sm">
              <span className="material-symbols-outlined text-primary text-5xl mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <h3 className="font-headline-md text-xl mb-2 text-on-surface">Login Successful</h3>
              <p className="text-sm text-on-surface-variant mb-6">{loginSuccess}</p>
            </div>
          ) : (
            <form onSubmit={handleLoginSubmit} className="w-full space-y-6 text-left">
              {loginError && (
                <div className="p-4 bg-error/10 border border-error/20 text-[#ba1a1a] rounded-xl text-sm flex gap-2 items-center">
                  <span className="material-symbols-outlined text-lg flex-shrink-0">error</span>
                  <span>{loginError}</span>
                </div>
              )}

              {/* Email */}
              <div className="flex flex-col gap-2">
                <label className="font-label-caps text-label-caps text-on-surface-variant ml-1" htmlFor="login-email">
                  Email
                </label>
                <input
                  className="w-full h-12 px-4 rounded-xl border border-[#D1C7BD] bg-white focus:border-primary transition-all outline-none"
                  id="login-email"
                  placeholder="amelia@journeys.com"
                  required
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="font-label-caps text-label-caps text-on-surface-variant" htmlFor="login-password">
                    Password
                  </label>
                  <Link to="/reset-password" className="text-xs text-primary font-semibold hover:underline">Forgot password?</Link>
                </div>
                <input
                  className="w-full h-12 px-4 rounded-xl border border-[#D1C7BD] bg-white focus:border-primary transition-all outline-none"
                  id="login-password"
                  placeholder="••••••••"
                  required
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
              </div>

              {/* Submit Button */}
              <button
                className="w-full h-14 bg-[#ffa630] text-[#0B1226] font-bold rounded-full cursor-pointer active:scale-95 transition-all hover:brightness-110 shadow-sm mt-4 flex items-center justify-center gap-2"
                type="submit"
                disabled={loginLoading}
              >
                {loginLoading ? (
                  <span className="w-5 h-5 border-2 border-on-primary-container border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  'Log In'
                )}
              </button>
            </form>
          )}

          {!loginSuccess && (
            <div className="mt-8 font-body-md text-on-surface-variant">
              New to Journeys? 
              <button onClick={() => navigate('/signup')} className="text-primary font-semibold hover:underline cursor-pointer ml-1">Create an account</button>
            </div>
          )}

          {/* Ink Stamp Motif */}
          <div className="mt-10 border-2 border-primary/20 text-primary/20 px-4 py-1 font-label-caps text-label-caps rounded-full select-none rotate-[-3deg] inline-block">
            EST. 2026
          </div>
        </div>
      </section>
    </LandingLayout>
  );
};

// ─── Component 5: Router Content Wrapper ───
const RouterContent = () => {
  const { isAuthModalOpen, authModalMessage, closeAuthModal } = useAuth();
  
  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/planner" element={<Dashboard />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/itinerary/:id" element={<ItineraryResultsPage />} />
        <Route path="/shared/:shareToken" element={<SharedItineraryPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* New Phase 2-5 routes */}
        <Route path="/packing-list/:itineraryId" element={<PackingListPage />} />
        <Route path="/group-trip/:itineraryId" element={<GroupTripsPage />} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/price-tracker" element={<ProtectedRoute><PriceTrackerPage /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
        <Route path="/reviews/:itineraryId" element={<ProtectedRoute><ReviewsPage /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminDashboardPage /></ProtectedRoute>} />
        
        {/* Premium Core Route Pages */}
        <Route path="/destination/:slug" element={<DestinationDetailPage />} />
        <Route path="/help" element={<HelpCenterPage />} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/booking/:id" element={<ProtectedRoute><BookingDetailPage /></ProtectedRoute>} />
        <Route path="/ai-chat" element={<AIChatPage />} />

        {/* Protected general routes */}
        <Route
          path="/settings/2fa"
          element={
            <ProtectedRoute>
              <TwoFactorSetupPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-trips"
          element={
            <ProtectedRoute>
              <MyTripsPage />
            </ProtectedRoute>
          }
        />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global Auth Modal Overlay */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        contextMessage={authModalMessage}
      />
    </>
  );
};

// ─── Main App Entry Component ───
const App = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <CustomCursor />
          <ScrollProgress />
          <PageTransition>
            <RouterContent />
          </PageTransition>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
