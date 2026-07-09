import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import api from '../utils/api.js';
import Card from './ui/Card.jsx';
import Button from './ui/Button.jsx';
import StatusPill from './ui/StatusPill.jsx';
import { Compass, MapPin, Calendar, AlertCircle, CheckCircle } from 'lucide-react';

/**
 * TripRequestForm
 *
 * Implements:
 * - Photon API (OpenStreetMap) Autocomplete search for origin/destination
 * - Nominatim reverse geocoding for browser geolocation detection
 * - Custom styled double budget range slider (min/max)
 * - Date validation
 * - Public submission handler (saves guestId or userId)
 */
const TripRequestForm = ({ onSubmitSuccess }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Form input fields
  const [origin, setOrigin] = useState({ lat: null, lng: null, label: '' });
  const [destination, setDestination] = useState({ lat: null, lng: null, label: '' });

  // Autocomplete UI state
  const [originSearch, setOriginSearch] = useState('');
  const [destinationSearch, setDestinationSearch] = useState('');
  const [originSuggestions, setOriginSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);
  const [originLoading, setOriginLoading] = useState(false);
  const [destinationLoading, setDestinationLoading] = useState(false);

  const originContainerRef = useRef(null);
  const destinationContainerRef = useRef(null);
  
  // Prefill state values if passed from landing page or explore page
  useEffect(() => {
    if (location.state?.prefillDestination) {
      const label = location.state.prefillDestination;
      setDestinationSearch(label);
      setDestination(prev => ({ ...prev, label }));
      triggerPhotonSearch(label, 'destination');
    }
    if (location.state?.prefillFrom) {
      const label = location.state.prefillFrom;
      setOriginSearch(label);
      setOrigin(prev => ({ ...prev, label }));
      triggerPhotonSearch(label, 'origin');
    }
    if (location.state?.prefillTo) {
      const label = location.state.prefillTo;
      setDestinationSearch(label);
      setDestination(prev => ({ ...prev, label }));
      triggerPhotonSearch(label, 'destination');
    }
  }, [location.state]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (originContainerRef.current && !originContainerRef.current.contains(event.target)) {
        setShowOriginDropdown(false);
      }
      if (destinationContainerRef.current && !destinationContainerRef.current.contains(event.target)) {
        setShowDestinationDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Date states (default to tomorrow and next week)
  const getTomorrowDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return today.toISOString().split('T')[0];
  };

  const getNextWeekDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 7);
    return today.toISOString().split('T')[0];
  };

  const [startDate, setStartDate] = useState(getTomorrowDate());
  const [endDate, setEndDate] = useState(getNextWeekDate());

  // Budget states (in ₹)
  const minLimit = 5000;
  const maxLimit = 150000;
  const [budgetMin, setBudgetMin] = useState(15000);
  const [budgetMax, setBudgetMax] = useState(80000);

  // Status & error states
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ─── Autocomplete logic using Photon API ──────────────────────────
  const triggerPhotonSearch = async (query, type) => {
    if (!query || query.trim().length < 3) {
      if (type === 'origin') setOriginSuggestions([]);
      else setDestinationSuggestions([]);
      return;
    }

    const setLoader = type === 'origin' ? setOriginLoading : setDestinationLoading;
    const setSuggestions = type === 'origin' ? setOriginSuggestions : setDestinationSuggestions;

    setLoader(true);
    try {
      // Photon is a search engine for OpenStreetMap data
      const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=8`;
      const response = await axios.get(url);
      
      const features = response.data.features || [];
      const suggestions = features.map(feature => {
        const props = feature.properties || {};
        const geom = feature.geometry || {};
        
        // Build a nice descriptive address label
        const addressParts = [
          props.name,
          props.city || props.town || props.village,
          props.state,
          props.country
        ].filter(Boolean);

        // Deduplicate adjacent identical parts
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
        };
      });

      setSuggestions(suggestions);
    } catch (err) {
      console.warn(`Photon search failed for ${type}:`, err.message);
    } finally {
      setLoader(false);
    }
  };

  // Debouncing or handling typing updates
  const handleOriginChange = (e) => {
    const val = e.target.value;
    setOriginSearch(val);
    setOrigin(prev => ({ ...prev, label: val, lat: null, lng: null }));
    setShowOriginDropdown(true);
    
    const timeoutId = setTimeout(() => {
      triggerPhotonSearch(val, 'origin');
    }, 400);
    return () => clearTimeout(timeoutId);
  };

  const handleDestinationChange = (e) => {
    const val = e.target.value;
    setDestinationSearch(val);
    setDestination(prev => ({ ...prev, label: val, lat: null, lng: null }));
    setShowDestinationDropdown(true);

    const timeoutId = setTimeout(() => {
      triggerPhotonSearch(val, 'destination');
    }, 400);
    return () => clearTimeout(timeoutId);
  };

  // ─── Automatic Geolocation & Reverse Geocoding via Nominatim ──────
  useEffect(() => {
    if (!navigator.geolocation) return;

    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Fetch reverse geocode details from OpenStreetMap Nominatim
          const response = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            {
              headers: {
                'User-Agent': 'JourneysTravelPlannerAgent/1.0'
              }
            }
          );
          
          if (response.data) {
            const displayName = response.data.display_name;
            const address = response.data.address || {};
            const city = address.city || address.town || address.village || address.county;
            const state = address.state;
            const label = city && state ? `${city}, ${state}` : displayName;

            setOrigin({ lat: latitude, lng: longitude, label });
            setOriginSearch(label);
          } else {
            setOrigin({ lat: latitude, lng: longitude, label: 'Current Geolocation' });
            setOriginSearch('Current Geolocation');
          }
        } catch (err) {
          console.warn('OSM Reverse geocoding failed:', err);
          setOrigin({ lat: latitude, lng: longitude, label: 'Current Geolocation' });
          setOriginSearch('Current Geolocation');
        } finally {
          setGeoLoading(false);
        }
      },
      (err) => {
        console.info('Geolocation denied or timed out.');
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  }, []);

  // Handle budget dual slider adjustments
  const handleMinChange = (e) => {
    const value = Math.min(Number(e.target.value), budgetMax - 5000);
    setBudgetMin(value);
  };

  const handleMaxChange = (e) => {
    const value = Math.max(Number(e.target.value), budgetMin + 5000);
    setBudgetMax(value);
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!origin.lat || !destination.lat) {
      setError('Please select valid locations from the autocomplete dropdown.');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const payload = {
        origin,
        destination,
        startDate,
        endDate,
        budgetMin,
        budgetMax,
      };

      // Call the itinerary generation endpoint
      const { data } = await api.post('/itineraries', payload);
      
      // Redirect to the itinerary results page
      navigate(`/itinerary/${data.itineraryId}`);
      
      if (onSubmitSuccess) {
        onSubmitSuccess(data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate itinerary. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  // Helper percentages for budget slider tracks
  const minPercent = ((budgetMin - minLimit) / (maxLimit - minLimit)) * 100;
  const maxPercent = ((budgetMax - minLimit) / (maxLimit - minLimit)) * 100;

  // Verify form completion
  const isFormValid = origin.label && destination.label && startDate && endDate;

  return (
    <div className="w-full">
      {/* Branded Form Header */}
      <div className="flex items-center justify-between border-b border-border pb-5 mb-6">
        <div>
          <h2 className="text-lg font-extrabold text-text-primary tracking-tight flex items-center gap-2">
            <Compass className="w-5 h-5 text-accent-gold" />
            Where to next?
          </h2>
          <p className="text-xs text-text-secondary mt-1">Design your custom route planner (powered by OpenStreetMap).</p>
        </div>
        {geoLoading && (
          <StatusPill label="Locating..." color="blue" pulsing={true} />
        )}
      </div>

      {error && (
        <div className="mb-5 p-3.5 rounded bg-danger-bg border border-danger/20 text-danger text-xs flex gap-2.5">
          <AlertCircle className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed font-semibold">{error}</div>
        </div>
      )}

      {success && (
        <div className="mb-5 p-3.5 rounded bg-success-bg border border-success/20 text-success text-xs flex gap-2.5">
          <CheckCircle className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed font-semibold">{success}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 1. Origin Input */}
        <div className="space-y-1.5 relative" ref={originContainerRef}>
          <label className="label-system text-[#8e9192]">
            Current Location / Start Point
          </label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8e9192] pointer-events-none" />
            <input
              type="text"
              value={originSearch}
              onChange={handleOriginChange}
              onFocus={() => setShowOriginDropdown(true)}
              placeholder="Search start city, hotel, or landmark..."
              className="w-full bg-[#0e0e0e] border border-[#4d4635] focus:border-[#eac249] focus:ring-0 rounded pl-12 pr-4 py-3 text-sm font-semibold text-[#e5e2e1] placeholder:text-[#8e9192]/70 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.6),inset_-1px_-1px_2px_rgba(255,255,255,0.05)] transition-colors"
              required
            />
            {(geoLoading || originLoading) && (
              <span className="absolute right-4 top-3.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#eac249] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#eac249]"></span>
              </span>
            )}
          </div>

          {/* Origin Autocomplete Dropdown */}
          {showOriginDropdown && originSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 mt-1 bg-[#161616] border border-[#4d4635] rounded shadow-2xl z-50 max-h-60 overflow-y-auto">
              {originSuggestions.map((suggestion, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setOrigin(suggestion);
                    setOriginSearch(suggestion.label);
                    setShowOriginDropdown(false);
                  }}
                  className="px-4 py-2.5 text-xs font-semibold text-[#e5e2e1] hover:bg-[#eac249] hover:text-[#131313] cursor-pointer transition-colors border-b border-[#2a2a2a] last:border-0"
                >
                  {suggestion.label}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. Destination Input */}
        <div className="space-y-1.5 relative" ref={destinationContainerRef}>
          <label className="label-system text-[#8e9192]">
            Destination
          </label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8e9192] pointer-events-none" />
            <input
              type="text"
              value={destinationSearch}
              onChange={handleDestinationChange}
              onFocus={() => setShowDestinationDropdown(true)}
              placeholder="Search destination city, attraction, or airport..."
              className="w-full bg-[#0e0e0e] border border-[#4d4635] focus:border-[#eac249] focus:ring-0 rounded pl-12 pr-4 py-3 text-sm font-semibold text-[#e5e2e1] placeholder:text-[#8e9192]/70 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.6),inset_-1px_-1px_2px_rgba(255,255,255,0.05)] transition-colors"
              required
            />
            {destinationLoading && (
              <span className="absolute right-4 top-3.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#eac249] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#eac249]"></span>
              </span>
            )}
          </div>

          {/* Destination Autocomplete Dropdown */}
          {showDestinationDropdown && destinationSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 mt-1 bg-[#161616] border border-[#4d4635] rounded shadow-2xl z-50 max-h-60 overflow-y-auto">
              {destinationSuggestions.map((suggestion, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setDestination(suggestion);
                    setDestinationSearch(suggestion.label);
                    setShowDestinationDropdown(false);
                  }}
                  className="px-4 py-2.5 text-xs font-semibold text-[#e5e2e1] hover:bg-[#eac249] hover:text-[#131313] cursor-pointer transition-colors border-b border-[#2a2a2a] last:border-0"
                >
                  {suggestion.label}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="label-system text-[#8e9192]">
              Departure Date
            </label>
            <input
              type="date"
              value={startDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-[#0e0e0e] border border-[#4d4635] focus:border-[#eac249] focus:ring-0 rounded px-4 py-2.5 text-sm font-semibold text-[#e5e2e1] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.6),inset_-1px_-1px_2px_rgba(255,255,255,0.05)] transition-colors cursor-pointer"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="label-system text-[#8e9192]">
              Return Date
            </label>
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-[#0e0e0e] border border-[#4d4635] focus:border-[#eac249] focus:ring-0 rounded px-4 py-2.5 text-sm font-semibold text-[#e5e2e1] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.6),inset_-1px_-1px_2px_rgba(255,255,255,0.05)] transition-colors cursor-pointer"
              required
            />
          </div>
        </div>

        {/* 4. Budget Slider */}
        <div className="space-y-4 pt-2">
          <div className="flex justify-between items-center text-xs">
            <span className="label-system text-[#8e9192]">
              Budget Range
            </span>
            <span className="font-extrabold text-[#eac249] font-mono text-sm">
              ₹{budgetMin.toLocaleString('en-IN')} - ₹{budgetMax.toLocaleString('en-IN')}
            </span>
          </div>

          {/* Dual range slider container */}
          <div className="relative w-full h-8 flex items-center">
            {/* Custom Track background */}
            <div className="absolute h-1.5 w-full bg-[#0e0e0e] rounded-full border border-[#4d4635] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.6),inset_-1px_-1px_2px_rgba(255,255,255,0.05)]" />

            {/* Active Gold Range Segment */}
            <div
              className="absolute h-1.5 bg-[#eac249] rounded-full shadow-[0_0_8px_rgba(234,194,73,0.5)]"
              style={{
                left: `${minPercent}%`,
                width: `${maxPercent - minPercent}%`,
              }}
            />

            {/* Min Slider input */}
            <input
              type="range"
              min={minLimit}
              max={maxLimit}
              step="1000"
              value={budgetMin}
              onChange={handleMinChange}
              className="absolute w-full h-1.5 pointer-events-none appearance-none bg-transparent focus:outline-none custom-range-slider"
            />

            {/* Max Slider input */}
            <input
              type="range"
              min={minLimit}
              max={maxLimit}
              step="1000"
              value={budgetMax}
              onChange={handleMaxChange}
              className="absolute w-full h-1.5 pointer-events-none appearance-none bg-transparent focus:outline-none custom-range-slider"
            />
          </div>
          <div className="flex justify-between text-[9px] text-text-muted font-mono uppercase font-bold">
            <span>₹{minLimit.toLocaleString('en-IN')}</span>
            <span>₹{maxLimit.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* 5. Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
          disabled={!isFormValid || loading}
          className="mt-4 font-extrabold cursor-pointer"
        >
          Generate Itinerary
        </Button>
      </form>
    </div>
  );
};

export default TripRequestForm;
