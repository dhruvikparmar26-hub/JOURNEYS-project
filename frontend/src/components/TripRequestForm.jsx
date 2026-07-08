import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { loadGoogleMaps } from '../utils/maps.js';
import api from '../utils/api.js';
import Card from './ui/Card.jsx';
import Button from './ui/Button.jsx';
import StatusPill from './ui/StatusPill.jsx';
import { Compass, MapPin, Calendar, AlertCircle, CheckCircle, Navigation } from 'lucide-react';

/**
 * TripRequestForm
 *
 * Implements:
 * - Dynamic Google Maps API loader
 * - Browser geolocation reverse geocoding with geocode fallback
 * - Restricted Places Autocomplete (India only) for origin/destination
 * - Custom styled green double budget range slider (min/max)
 * - Date validation
 * - Public submission handler (saves guestId or userId)
 */
const TripRequestForm = ({ onSubmitSuccess }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [apiKey, setApiKey] = useState('');
  
  // Form input fields
  const [origin, setOrigin] = useState({ lat: null, lng: null, label: '' });
  const [destination, setDestination] = useState({ lat: null, lng: null, label: '', placeId: '' });

  // Prefill state values if passed from landing page or explore page
  useEffect(() => {
    if (location.state?.prefillDestination) {
      setDestination(prev => ({
        ...prev,
        label: location.state.prefillDestination
      }));
    }
    if (location.state?.prefillFrom) {
      setOrigin(prev => ({
        ...prev,
        label: location.state.prefillFrom
      }));
    }
    if (location.state?.prefillTo) {
      setDestination(prev => ({
        ...prev,
        label: location.state.prefillTo
      }));
    }
  }, [location.state]);
  
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

  // DOM Refs for autocomplete
  const originInputRef = useRef(null);
  const destinationInputRef = useRef(null);

  // ─── Phase 1: Load Google Maps script on mount ───────────────────
  useEffect(() => {
    loadGoogleMaps()
      .then((maps) => {
        if (maps) {
          setMapsLoaded(true);
          // Retrieve the loaded API key from Config Endpoint
          api.get('/config').then(({ data }) => {
            setApiKey(data.googleMapsApiKey);
          });
        }
      })
      .catch((err) => {
        console.error('Google Maps initialization failed:', err);
      });
  }, []);

  // ─── Phase 2: Autocomplete initialization ────────────────────────
  useEffect(() => {
    if (!mapsLoaded || !window.google?.maps?.places) return;

    // 1. Initialize Autocomplete for Origin
    const originAutocomplete = new window.google.maps.places.Autocomplete(originInputRef.current, {
      componentRestrictions: { country: 'in' },
      fields: ['geometry', 'formatted_address', 'name'],
    });

    originAutocomplete.addListener('place_changed', () => {
      const place = originAutocomplete.getPlace();
      if (place.geometry?.location) {
        setOrigin({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          label: place.formatted_address || place.name || '',
        });
      }
    });

    // 2. Initialize Autocomplete for Destination (restriced to India)
    const destinationAutocomplete = new window.google.maps.places.Autocomplete(destinationInputRef.current, {
      componentRestrictions: { country: 'in' },
      fields: ['geometry', 'formatted_address', 'name', 'place_id'],
    });

    destinationAutocomplete.addListener('place_changed', () => {
      const place = destinationAutocomplete.getPlace();
      if (place.geometry?.location) {
        setDestination({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          label: place.formatted_address || place.name || '',
          placeId: place.place_id || '',
        });
      }
    });
  }, [mapsLoaded]);

  // ─── Phase 3: Automatic Geolocation & Reverse Geocoding ──────────
  useEffect(() => {
    if (!navigator.geolocation) return;

    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Fetch API key dynamically if not already saved
          let currentKey = apiKey;
          if (!currentKey) {
            const { data } = await api.get('/config');
            currentKey = data.googleMapsApiKey;
          }

          if (currentKey) {
            const response = await axios.get(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${currentKey}`
            );
            
            if (response.data.results?.[0]) {
              const formattedAddress = response.data.results[0].formatted_address;
              // Extract city if possible
              const addressComponents = response.data.results[0].address_components;
              const cityComp = addressComponents.find(c => c.types.includes('locality'));
              const stateComp = addressComponents.find(c => c.types.includes('administrative_area_level_1'));
              const label = cityComp && stateComp 
                ? `${cityComp.long_name}, ${stateComp.short_name}` 
                : formattedAddress;

              setOrigin({ lat: latitude, lng: longitude, label });
              if (originInputRef.current) {
                originInputRef.current.value = label;
              }
            } else {
              // Fallback to coordinates label if reverse geocoding returns no result
              setOrigin({ lat: latitude, lng: longitude, label: 'Current Geolocation' });
              if (originInputRef.current) originInputRef.current.value = 'Current Geolocation';
            }
          }
        } catch (err) {
          console.warn('Geolocation reverse geocoding failed:', err);
        } finally {
          setGeoLoading(false);
        }
      },
      (err) => {
        console.info('Geolocation permission denied or timed out. Falling back to manual prefill.');
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  }, [apiKey]);

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
          <p className="text-xs text-text-secondary mt-1">Design your custom route planner across India corridors.</p>
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
        {/* 1. Origin */}
        <div className="space-y-1.5">
          <label className="label-system text-[#8e9192]">
            Current Location / Start Point
          </label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8e9192] pointer-events-none" />
            <input
              ref={originInputRef}
              type="text"
              defaultValue={origin.label}
              onChange={(e) => setOrigin(prev => ({ ...prev, label: e.target.value, lat: null }))}
              placeholder="Search start city, hotel, or landmark..."
              className="w-full bg-[#0e0e0e] border border-[#4d4635] focus:border-[#eac249] focus:ring-0 rounded pl-12 pr-4 py-3 text-sm font-semibold text-[#e5e2e1] placeholder:text-[#8e9192]/70 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.6),inset_-1px_-1px_2px_rgba(255,255,255,0.05)] transition-colors"
              required
            />
            {geoLoading && (
              <span className="absolute right-4 top-3.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#eac249] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#eac249]"></span>
              </span>
            )}
          </div>
        </div>

        {/* 2. Destination Input */}
        <div className="space-y-1.5">
          <label className="label-system text-[#8e9192]">
            Destination in India
          </label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8e9192] pointer-events-none" />
            <input
              ref={destinationInputRef}
              type="text"
              placeholder="Search destination city, attraction, or airport..."
              className="w-full bg-[#0e0e0e] border border-[#4d4635] focus:border-[#eac249] focus:ring-0 rounded pl-12 pr-4 py-3 text-sm font-semibold text-[#e5e2e1] placeholder:text-[#8e9192]/70 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.6),inset_-1px_-1px_2px_rgba(255,255,255,0.05)] transition-colors"
              required
            />
          </div>
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
