import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import api from '../utils/api.js';
import { useToast } from '../components/ui/Toast.jsx';
import LandingLayout from '../components/ui/LandingLayout.jsx';
import AutocompleteInput from '../components/AutocompleteInput.jsx';
import { findLocationInfo } from '../data/locations.js';
import { getHaversineDistance } from '../utils/geo.js';

const SIMULATED_LOGS = [
  'Weather check: 18°C and clear in destination...',
  'Activity agent prioritizing local reviews and walking paths...',
  'Hotel agent matching suites with high rating scores...',
  'Cross-referencing logistics maps and train schedules...',
  'Resolving time windows and routes corridors...',
  'Optimizing transport connections & booking indexes...',
  'Generating itinerary days... almost complete.'
];

const DashboardPage = () => {
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
            return iata.length === 3 && !name.includes('heliport') && !name.includes('military');
          })
          .map(el => {
            const name = el.tags?.name || '';
            const iata = el.tags?.iata || '';
            const city = el.tags?.['addr:city'] || '';
            const country = el.tags?.['addr:country'] || '';
            return {
              label: `${name} (${iata})`,
              name,
              iata,
              city,
              lat: el.lat || el.center?.lat,
              lng: el.lon || el.center?.lon,
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
                iata,
                city: props.city || '',
                lat: geom.coordinates?.[1],
                lng: geom.coordinates?.[0],
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

  // Simulating logging progress in agent console
  useEffect(() => {
    if (!isGenerating) return;
    if (logIndex >= SIMULATED_LOGS.length) return;

    const timer = setTimeout(() => {
      setConsoleLogs(prev => [...prev, SIMULATED_LOGS[logIndex]]);
      setLogIndex(prev => prev + 1);
    }, 8000 / SIMULATED_LOGS.length); // complete in 8 seconds

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

  // ─── RENDERING 1: Agent Console Loading View ───────────
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

  // ─── RENDERING 2: Plan Form View ───────────────────────
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

export default DashboardPage;
