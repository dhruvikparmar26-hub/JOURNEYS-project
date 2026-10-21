import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';
import LandingLayout from '../components/ui/LandingLayout.jsx';
import AutocompleteInput from '../components/AutocompleteInput.jsx';

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
            <div className="flex flex-col md:flex-row items-end gap-gutter">
              {/* From Input */}
              <div className="w-full md:w-1/3 text-left">
                <AutocompleteInput
                  label="From"
                  value={from}
                  onChange={setFrom}
                  placeholder="E.g. Mumbai, India"
                  icon="flight_takeoff"
                />
              </div>
              {/* Route Motif */}
              <div className="hidden md:flex items-center justify-center gap-4 px-4 min-w-[120px] mb-4">
                <div className="h-[2px] w-16 border-b-2 border-dotted border-outline relative flex items-center justify-center">
                  <div className="bg-surface-container-lowest px-2 -mt-1">
                    <span className="material-symbols-outlined text-primary-container text-xl rotate-90">flight</span>
                  </div>
                </div>
              </div>
              {/* To Input */}
              <div className="w-full md:w-1/3 text-left">
                <AutocompleteInput
                  label="To"
                  value={to}
                  onChange={setTo}
                  placeholder="E.g. Kyoto, Japan"
                  icon="flight_land"
                />
              </div>
              {/* Action */}
              <div className="w-full md:w-auto mb-1">
                <button type="submit" className="w-full h-12 bg-primary-container text-on-primary-container px-8 rounded-xl font-label-caps text-label-caps font-bold hover:brightness-110 shadow-md active:scale-95 transition-all cursor-pointer uppercase tracking-wider text-xs">
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

export default LandingPage;
