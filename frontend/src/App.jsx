import React, { useEffect, useState, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useSearchParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { Terminal } from 'lucide-react';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider, useToast } from './components/ui/Toast.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import useAuth from './hooks/useAuth.js';
import api from './utils/api.js';
import axios from 'axios';

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
import PrivacyPage from './pages/PrivacyPage.jsx';
import TermsPage from './pages/TermsPage.jsx';
import AboutPage from './pages/AboutPage.jsx';

// Auth Modal
import AuthModal from './components/AuthModal.jsx';

// Premium Utilities
import CustomCursor from './components/ui/CustomCursor.jsx';
import PageTransition, { ScrollProgress } from './components/ui/PageTransition.jsx';

// ─── Searchable Autocomplete Locations & Helpers ───
const LOCATIONS = [
  // India (25 options)
  { label: "Delhi, India", lat: 28.6139, lng: 77.2090, country: "India" },
  { label: "Mumbai, India", lat: 19.0760, lng: 72.8777, country: "India" },
  { label: "Bangalore, India", lat: 12.9716, lng: 77.5946, country: "India" },
  { label: "Kolkata, India", lat: 22.5726, lng: 88.3639, country: "India" },
  { label: "Chennai, India", lat: 13.0827, lng: 80.2707, country: "India" },
  { label: "Goa, India", lat: 15.2993, lng: 74.1240, country: "India" },
  { label: "Jaipur, India", lat: 26.9124, lng: 75.7873, country: "India" },
  { label: "Udaipur, India", lat: 24.5854, lng: 73.7125, country: "India" },
  { label: "Agra, India", lat: 27.1767, lng: 78.0081, country: "India" },
  { label: "Kochi, India", lat: 9.9312, lng: 76.2673, country: "India" },
  { label: "Manali, India", lat: 32.2396, lng: 77.1887, country: "India" },
  { label: "Shimla, India", lat: 31.1048, lng: 77.1734, country: "India" },
  { label: "Hyderabad, India", lat: 17.3850, lng: 78.4867, country: "India" },
  { label: "Pune, India", lat: 18.5204, lng: 73.8567, country: "India" },
  { label: "Ahmedabad, India", lat: 23.0225, lng: 72.5714, country: "India" },
  { label: "Srinagar, India", lat: 34.0837, lng: 74.7973, country: "India" },
  { label: "Leh, India", lat: 34.1526, lng: 77.5771, country: "India" },
  { label: "Darjeeling, India", lat: 27.0410, lng: 88.2627, country: "India" },
  { label: "Ooty, India", lat: 11.4102, lng: 76.6950, country: "India" },
  { label: "Varanasi, India", lat: 25.3176, lng: 82.9739, country: "India" },
  { label: "Amritsar, India", lat: 31.6340, lng: 74.8723, country: "India" },
  { label: "Jaisalmer, India", lat: 26.9157, lng: 70.9083, country: "India" },
  { label: "Rishikesh, India", lat: 30.0869, lng: 78.2676, country: "India" },
  { label: "Mysore, India", lat: 12.2958, lng: 76.6394, country: "India" },
  { label: "Pondicherry, India", lat: 11.9416, lng: 79.8083, country: "India" },

  // Asia (15 options)
  { label: "Tokyo, Japan", lat: 35.6762, lng: 139.6503, country: "Japan" },
  { label: "Kyoto, Japan", lat: 35.0116, lng: 135.7681, country: "Japan" },
  { label: "Singapore", lat: 1.3521, lng: 103.8198, country: "Singapore" },
  { label: "Bangkok, Thailand", lat: 13.7563, lng: 100.5018, country: "Thailand" },
  { label: "Phuket, Thailand", lat: 7.8804, lng: 98.3922, country: "Thailand" },
  { label: "Bali, Indonesia", lat: -8.4095, lng: 115.1889, country: "Indonesia" },
  { label: "Kuala Lumpur, Malaysia", lat: 3.1390, lng: 101.6869, country: "Malaysia" },
  { label: "Seoul, South Korea", lat: 37.5665, lng: 126.9780, country: "South Korea" },
  { label: "Hanoi, Vietnam", lat: 21.0285, lng: 105.8542, country: "Vietnam" },
  { label: "Ho Chi Minh City, Vietnam", lat: 10.8231, lng: 106.6297, country: "Vietnam" },
  { label: "Male, Maldives", lat: 4.1755, lng: 73.5093, country: "Maldives" },
  { label: "Colombo, Sri Lanka", lat: 6.9271, lng: 79.8612, country: "Sri Lanka" },
  { label: "Kathmandu, Nepal", lat: 27.7172, lng: 85.3240, country: "Nepal" },
  { label: "Dubai, UAE", lat: 25.2048, lng: 55.2708, country: "UAE" },
  { label: "Hong Kong", lat: 22.3193, lng: 114.1694, country: "Hong Kong" },

  // Europe & Rest of World (15 options)
  { label: "Amalfi Coast, Italy", lat: 40.6331, lng: 14.6029, country: "Italy" },
  { label: "Rome, Italy", lat: 41.9028, lng: 12.4964, country: "Italy" },
  { label: "Venice, Italy", lat: 45.4408, lng: 12.3155, country: "Italy" },
  { label: "Paris, France", lat: 48.8566, lng: 2.3522, country: "France" },
  { label: "London, UK", lat: 51.5074, lng: -0.1278, country: "UK" },
  { label: "Barcelona, Spain", lat: 41.3851, lng: 2.1734, country: "Spain" },
  { label: "Madrid, Spain", lat: 40.4168, lng: -3.7038, country: "Spain" },
  { label: "Amsterdam, Netherlands", lat: 52.3676, lng: 4.9041, country: "Netherlands" },
  { label: "Zurich, Switzerland", lat: 47.3769, lng: 8.5417, country: "Switzerland" },
  { label: "Reykjavik, Iceland", lat: 64.1466, lng: -21.9426, country: "Iceland" },
  { label: "New York, USA", lat: 40.7128, lng: -74.0060, country: "USA" },
  { label: "San Francisco, USA", lat: 37.7749, lng: -122.4194, country: "USA" },
  { label: "Sydney, Australia", lat: -33.8688, lng: 151.2093, country: "Australia" },
  { label: "Cairo, Egypt", lat: 30.0444, lng: 31.2357, country: "Egypt" },
  { label: "Cape Town, South Africa", lat: -33.9249, lng: 18.4241, country: "South Africa" }
];

const findLocationInfo = (text) => {
  if (!text) return null;
  const t = text.toLowerCase().trim();
  const match = LOCATIONS.find(loc => loc.label.toLowerCase().includes(t) || t.includes(loc.label.toLowerCase()));
  if (match) return match;

  const countries = ["india", "japan", "usa", "italy", "france", "uk", "australia", "egypt", "south africa", "singapore", "thailand", "indonesia", "malaysia", "south korea", "vietnam", "maldives", "nepal", "uae"];
  const countryCoords = {
    "india": { lat: 20.5937, lng: 78.9629, country: "India" },
    "japan": { lat: 36.2048, lng: 138.2529, country: "Japan" },
    "usa": { lat: 37.0902, lng: -95.7129, country: "USA" },
    "italy": { lat: 41.8719, lng: 12.5674, country: "Italy" },
    "france": { lat: 46.2276, lng: 2.2137, country: "France" },
    "uk": { lat: 55.3781, lng: -3.4360, country: "UK" },
    "australia": { lat: -25.2744, lng: 133.7751, country: "Australia" },
    "egypt": { lat: 26.8206, lng: 30.8025, country: "Egypt" },
    "south africa": { lat: -30.5595, lng: 22.9375, country: "South Africa" },
    "singapore": { lat: 1.3521, lng: 103.8198, country: "Singapore" },
    "thailand": { lat: 15.8700, lng: 100.9925, country: "Thailand" },
    "indonesia": { lat: -0.7893, lng: 113.9213, country: "Indonesia" },
    "malaysia": { lat: 4.2105, lng: 101.9758, country: "Malaysia" },
    "south korea": { lat: 35.9078, lng: 127.7669, country: "South Korea" },
    "vietnam": { lat: 14.0583, lng: 108.2772, country: "Vietnam" },
    "maldives": { lat: 3.2028, lng: 73.2207, country: "Maldives" },
    "nepal": { lat: 28.3949, lng: 84.1240, country: "Nepal" },
    "uae": { lat: 23.4241, lng: 53.8478, country: "UAE" }
  };

  for (const c of countries) {
    if (t.includes(c)) {
      return countryCoords[c];
    }
  }
  return { lat: 20.5937, lng: 78.9629, country: "India" };
};

const getHaversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
};

const AutocompleteInput = ({ label, value, onChange, placeholder, icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions from Photon API
  const triggerPhotonSearch = async (query) => {
    if (!query || query.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=8`;
      const response = await axios.get(url);
      const features = response.data.features || [];
      const results = features.map(feature => {
        const props = feature.properties || {};
        const geom = feature.geometry || {};

        const addressParts = [
          props.name,
          props.city || props.town || props.village,
          props.state,
          props.country
        ].filter(Boolean);

        const labelParts = [];
        addressParts.forEach(part => {
          if (!labelParts.includes(part)) {
            labelParts.push(part);
          }
        });

        return {
          label: labelParts.join(', '),
          lat: geom.coordinates[1],
          lng: geom.coordinates[0],
          country: props.country || ''
        };
      });
      setSuggestions(results);
    } catch (err) {
      console.warn('Photon lookup in App.jsx failed:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const text = typeof value === 'object' ? value.label : value;
    if (!text || text.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    const delayDebounce = setTimeout(() => {
      triggerPhotonSearch(text);
    }, 450);
    return () => clearTimeout(delayDebounce);
  }, [value]);

  const displayValue = typeof value === 'object' ? value.label : value;

  return (
    <div className="relative flex flex-col gap-1.5 w-full" ref={dropdownRef}>
      <label className="font-label-caps text-[10px] text-outline uppercase tracking-wider">{label}</label>
      <div className="relative col-span-1">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant text-sm">{icon}</span>
        <input
          type="text"
          placeholder={placeholder}
          value={displayValue}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full h-12 pl-10 pr-4 rounded-xl border border-[#D1C7BD] bg-white focus:border-primary transition-all outline-none text-sm font-semibold text-[#0B1226]"
          required
        />
        {loading && (
          <span className="absolute right-3 top-4 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-[65px] left-0 w-full bg-white border border-[#E5DED4] rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
          {suggestions.map((loc, i) => (
            <div
              key={i}
              onMouseDown={() => {
                onChange(loc);
                setIsOpen(false);
              }}
              className="px-4 py-2.5 text-xs text-[#0B1226] hover:bg-[#FAF6F0] cursor-pointer font-semibold border-b border-[#FAF6F0] last:border-0"
            >
              {loc.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

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
  const [vehicleType, setVehicleType] = useState('plane');
  const [estimatedDistance, setEstimatedDistance] = useState(0);
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [isCrossCountry, setIsCrossCountry] = useState(false);

  // Airport search states
  const [activeSearch, setActiveSearch] = useState(null); // 'origin' | 'destination' | null
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  // Trigger airport search on Overpass API
  useEffect(() => {
    if (vehicleType !== 'plane' || !searchQuery || searchQuery.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      setSearchLoading(true);
      
      try {
        const osmQuery = `[out:json][timeout:8];(
          node[aeroway=aerodrome][iata](~"name"~"${searchQuery}",i);
          way[aeroway=aerodrome][iata](~"name"~"${searchQuery}",i);
          node[aeroway=aerodrome][iata](~"iata"~"^${searchQuery.toUpperCase()}$",i);
          node[aeroway=aerodrome][iata](~"addr:city"~"${searchQuery}",i);
        );out center 15;`;
        
        const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(osmQuery)}`;
        const response = await axios.get(url, { timeout: 8000 });
        const elements = response.data?.elements || [];
        const overpassMatches = elements
          .filter(el => {
            const iata = (el.tags?.iata || '').trim().toUpperCase();
            const name = (el.tags?.name || '').toLowerCase();
            // Strict airport checks: must have a valid 3-letter IATA code and shouldn't be auxiliary structures
            const isValidIata = /^[A-Z]{3}$/.test(iata);
            const isAuxiliary = name.includes('cargo') || name.includes('depot') || name.includes('bus') || name.includes('parking') || name.includes('hangar') || name.includes('terminal');
            return isValidIata && !isAuxiliary;
          })
          .map(el => {
            const name = el.tags.name;
            const city = el.tags['addr:city'] || el.tags.municipality || el.tags.city || '';
            const iata = el.tags.iata.toUpperCase();
            const country = el.tags['addr:country'] || 'India';
            
            const labelParts = [name, city, country].filter(Boolean);
            return {
              label: labelParts.join(', '),
              name,
              city,
              iata,
              lat: el.lat || el.center?.lat,
              lng: el.lon || el.center?.lng,
              country
            };
          });

        // Deduplicate by IATA code
        const seenIata = new Set();
        const deduplicated = [];
        overpassMatches.forEach(item => {
          if (!seenIata.has(item.iata)) {
            seenIata.add(item.iata);
            deduplicated.push(item);
          }
        });

        setSuggestions(deduplicated.slice(0, 10));
      } catch (err) {
        console.warn('Overpass airport search failed, using Photon fallback:', err.message);
        try {
          const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(searchQuery + ' airport')}&limit=15`;
          const response = await axios.get(url);
          const features = response.data.features || [];
          const photonMatches = features
            .filter(f => {
              const props = f.properties || {};
              const name = (props.name || '').toLowerCase();
              const isAirportValue = props.osm_value === 'aerodrome' || props.osm_key === 'aeroway';
              const isAuxiliary = name.includes('cargo') || name.includes('depot') || name.includes('bus') || name.includes('parking') || name.includes('hangar');
              return isAirportValue && !isAuxiliary;
            })
            .map(f => {
              const props = f.properties || {};
              const geom = f.geometry || {};
              const iata = (props.name.match(/\b[A-Z]{3}\b/) || [''])[0] || '';
              return {
                label: props.name + (props.city ? `, ${props.city}` : ''),
                name: props.name,
                city: props.city || '',
                iata: iata.toUpperCase(),
                lat: geom.coordinates[1],
                lng: geom.coordinates[0],
                country: props.country || ''
              };
            });

          const seenIata = new Set();
          const deduplicated = [];
          photonMatches.forEach(item => {
            if (item.iata && seenIata.has(item.iata)) return;
            if (item.iata) seenIata.add(item.iata);
            deduplicated.push(item);
          });
          setSuggestions(deduplicated.slice(0, 10));
        } catch (err2) {
          console.error(err2);
          setSuggestions([]);
        }
      } finally {
        setSearchLoading(false);
      }
    }, 450);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery, vehicleType]);

  // Dynamic Route & Pricing Calculations
  useEffect(() => {
    const originInfo = typeof origin === 'object' ? origin : findLocationInfo(origin);
    const destInfo = typeof destination === 'object' ? destination : findLocationInfo(destination);

    const oLabel = typeof origin === 'object' ? origin.label : origin;
    const dLabel = typeof destination === 'object' ? destination.label : destination;

    if (originInfo && destInfo && oLabel && dLabel && oLabel.trim() && dLabel.trim()) {
      const oCountry = originInfo.country || '';
      const dCountry = destInfo.country || '';
      const cross = oCountry.toLowerCase() !== dCountry.toLowerCase() && oCountry && dCountry;

      setIsCrossCountry(cross);
      let currentVehicle = vehicleType;
      if (cross) {
        setVehicleType('plane');
        currentVehicle = 'plane';
      }

      const dist = getHaversineDistance(originInfo.lat, originInfo.lng, destInfo.lat, destInfo.lng);
      setEstimatedDistance(dist);

      let cost = 0;
      if (currentVehicle === 'plane') {
        cost = Math.round(dist * 8 + 2000);
      } else if (currentVehicle === 'bus') {
        cost = Math.round(dist * 3);
      } else if (currentVehicle === 'bike') {
        cost = Math.round(dist * 1.5);
      } else if (currentVehicle === 'car') {
        cost = Math.round(dist * 10);
      }
      setEstimatedCost(cost);
    } else {
      setEstimatedDistance(0);
      setEstimatedCost(0);
      setIsCrossCountry(false);
    }
  }, [origin, destination, vehicleType]);

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
    const oLabel = typeof origin === 'object' ? origin.label : origin;
    const dLabel = typeof destination === 'object' ? destination.label : destination;
    if (!oLabel || !dLabel || !startDate || !endDate) return;

    try {
      setIsGenerating(true);
      setConsoleLogs(['System listening. Ready to build itinerary corridors.', 'Initialized connection.']);
      setLogIndex(0);

      // Trigger backend call
      const originInfo = typeof origin === 'object' ? origin : findLocationInfo(origin);
      const destInfo = typeof destination === 'object' ? destination : findLocationInfo(destination);
      const payload = {
        origin: {
          label: oLabel,
          lat: originInfo ? originInfo.lat : 28.6139,
          lng: originInfo ? originInfo.lng : 77.2090
        },
        destination: {
          label: dLabel,
          lat: destInfo ? destInfo.lat : 26.9124,
          lng: destInfo ? destInfo.lng : 75.7873
        },
        startDate,
        endDate,
        budgetMin: Math.max(0, estimatedCost - 10000),
        budgetMax: estimatedCost + 20000,
        vehicleType
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
    setOrigin('Delhi, India');
    setDestination('Amalfi Coast, Italy');
    setStartDate('2026-06-15');
    setEndDate('2026-06-22');
    setVehicleType('plane');
    showSuccessToast('Prefilled details for Amalfi Coast!');
  };

  // ─── RENDERING 1: Agent Console Loading View (Image 6) ───────────
  if (isGenerating) {
    const oLabel = typeof origin === 'object' ? origin.label : origin;
    const dLabel = typeof destination === 'object' ? destination.label : destination;
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
                  <h3 className="font-headline-md text-lg text-[#0B1226]">{oLabel || 'Start'} → {dLabel || 'Destination'}</h3>
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
            {vehicleType === 'plane' ? (
              <div className="col-span-1 sm:col-span-2 space-y-1.5">
                <label className="font-label-caps text-[10px] text-outline uppercase tracking-wider">Flight Route</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 border border-[#D1C7BD] rounded-xl overflow-hidden divide-y sm:divide-y-0 sm:divide-x divide-[#D1C7BD] bg-white relative shadow-sm">
                  {/* From Box */}
                  <div className="p-4 cursor-pointer hover:bg-[#FAF6F0] transition-colors relative flex-1 min-h-[84px] flex flex-col justify-center" onClick={() => setActiveSearch('origin')}>
                    <p className="text-[10px] font-bold text-outline uppercase tracking-wider">From</p>
                    {origin ? (
                      <>
                        <h4 className="text-xl font-extrabold text-[#0B1226] mt-1">{typeof origin === 'object' ? (origin.city || origin.label.split(',')[0]) : origin}</h4>
                        <p className="text-xs text-on-surface-variant font-semibold mt-0.5 truncate">
                          {typeof origin === 'object' && origin.iata ? `${origin.iata}, ${origin.name || origin.label}` : (typeof origin === 'object' ? origin.label : '')}
                        </p>
                      </>
                    ) : (
                      <>
                        <h4 className="text-xl font-extrabold text-outline-variant mt-1">Select Airport</h4>
                        <p className="text-xs text-outline-variant font-semibold mt-0.5">Choose departure airport</p>
                      </>
                    )}
                  </div>

                  {/* To Box */}
                  <div className="p-4 cursor-pointer hover:bg-[#FAF6F0] transition-colors relative flex-1 min-h-[84px] flex flex-col justify-center" onClick={() => setActiveSearch('destination')}>
                    <p className="text-[10px] font-bold text-outline uppercase tracking-wider">To</p>
                    {destination ? (
                      <>
                        <h4 className="text-xl font-extrabold text-[#0B1226] mt-1">{typeof destination === 'object' ? (destination.city || destination.label.split(',')[0]) : destination}</h4>
                        <p className="text-xs text-on-surface-variant font-semibold mt-0.5 truncate">
                          {typeof destination === 'object' && destination.iata ? `${destination.iata}, ${destination.name || destination.label}` : (typeof destination === 'object' ? destination.label : '')}
                        </p>
                      </>
                    ) : (
                      <>
                        <h4 className="text-xl font-extrabold text-outline-variant mt-1">Select Airport</h4>
                        <p className="text-xs text-outline-variant font-semibold mt-0.5">Choose destination airport</p>
                      </>
                    )}
                  </div>

                  {/* Swap Button icon */}
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      const temp = origin;
                      setOrigin(destination);
                      setDestination(temp);
                    }}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-[#D1C7BD] rounded-full flex items-center justify-center hover:bg-[#FAF6F0] hover:text-primary transition-colors cursor-pointer z-10 shadow-sm hidden sm:flex"
                  >
                    <span className="material-symbols-outlined text-sm rotate-90 sm:rotate-0">sync_alt</span>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Origin */}
                <AutocompleteInput
                  label="Origin"
                  value={origin}
                  onChange={setOrigin}
                  placeholder="e.g. Mumbai, India"
                  icon="flight_takeoff"
                />
                {/* Destination */}
                <AutocompleteInput
                  label="Destination"
                  value={destination}
                  onChange={setDestination}
                  placeholder="e.g. Kyoto, Japan"
                  icon="flight_land"
                />
              </>
            )}
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
            {/* Vehicle Type */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="font-label-caps text-[10px] text-outline uppercase tracking-wider">Vehicle Type</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant text-sm">
                  {vehicleType === 'plane' ? 'flight' :
                    vehicleType === 'car' ? 'directions_car' :
                      vehicleType === 'bus' ? 'directions_bus' :
                        'directions_bike'}
                </span>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  disabled={isCrossCountry}
                  className="w-full h-12 pl-10 pr-4 rounded-xl border border-[#D1C7BD] bg-white focus:border-primary transition-all outline-none text-sm font-semibold text-[#0B1226] appearance-none cursor-pointer"
                >
                  <option value="plane">Plane / Flight</option>
                  <option value="car">Car (Road trip)</option>
                  <option value="bus">Bus</option>
                  <option value="bike">Bike (Motorcycle)</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant pointer-events-none">arrow_drop_down</span>
              </div>
              {isCrossCountry && (
                <span className="text-[10px] text-[#885200] font-bold mt-1 flex items-center gap-1">
                  ⚠️ Flight is required for cross-country/international travel.
                </span>
              )}
            </div>

            {/* Route & Pricing Details Card */}
            {estimatedDistance > 0 && (
              <div className="sm:col-span-2 bg-[#FAF6F0] rounded-xl p-5 border border-[#E5DED4] space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-[#E5DED4]">
                  <span className="text-xs font-bold text-[#0B1226] uppercase tracking-wider font-label-caps">Estimated Route Details</span>
                  <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider font-label-caps">Calculated Live</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-white p-3 rounded-lg border border-[#E5DED4]">
                    <span className="font-label-caps text-[9px] text-outline uppercase block mb-1">Total Distance</span>
                    <span className="font-display-lg text-base font-bold text-[#0B1226]">{estimatedDistance.toLocaleString()} km</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-[#E5DED4]">
                    <span className="font-label-caps text-[9px] text-outline uppercase block mb-1">Estimated Cost</span>
                    <span className="font-display-lg text-base font-bold text-primary">₹{estimatedCost.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full h-14 bg-[#ffa630] text-[#0B1226] font-bold rounded-xl hover:brightness-105 active:scale-95 transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 text-sm uppercase tracking-wider font-label-caps"
          >
            Generate My Trip Details
          </button>
        </form>

        {activeSearch && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 border border-[#E5DED4] shadow-2xl relative space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-[#FAF6F0]">
                <h3 className="font-bold text-sm text-[#0B1226] uppercase">
                  Select {activeSearch === 'origin' ? 'Departure' : 'Destination'} Airport
                </h3>
                <button 
                  type="button"
                  onClick={() => {
                    setActiveSearch(null);
                    setSearchQuery('');
                    setSuggestions([]);
                  }}
                  className="text-outline hover:text-[#0B1226] text-xs font-bold"
                >
                  Close
                </button>
              </div>
              
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant text-sm">search</span>
                <input
                  type="text"
                  autoFocus
                  placeholder="Type city, airport name, or code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-12 pl-10 pr-4 rounded-xl border border-[#D1C7BD] bg-white focus:border-primary transition-all outline-none text-sm font-semibold text-[#0B1226]"
                />
                {searchLoading && (
                  <span className="absolute right-3 top-4 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                )}
              </div>

              <div className="max-h-60 overflow-y-auto divide-y divide-[#FAF6F0]">
                {suggestions.length > 0 ? (
                  suggestions.map((loc, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        if (activeSearch === 'origin') {
                          setOrigin(loc);
                        } else {
                          setDestination(loc);
                        }
                        setActiveSearch(null);
                        setSearchQuery('');
                        setSuggestions([]);
                      }}
                      className="py-3 px-2 hover:bg-[#FAF6F0] cursor-pointer flex justify-between items-center transition-colors"
                    >
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-[#0B1226]">{loc.city || loc.label.split(',')[0]}</span>
                        <span className="text-xs text-on-surface-variant mt-0.5">{loc.name || loc.label}</span>
                      </div>
                      {loc.iata && (
                        <span className="bg-[#ffa630]/20 text-[#6b4000] border border-[#ffa630]/30 px-2 py-0.5 rounded text-[10px] font-bold font-mono">
                          {loc.iata}
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-xs text-outline-variant font-semibold">
                    {searchQuery.trim().length >= 3 ? 'No airports found' : 'Type at least 3 characters to search...'}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

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
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/about" element={<AboutPage />} />

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
