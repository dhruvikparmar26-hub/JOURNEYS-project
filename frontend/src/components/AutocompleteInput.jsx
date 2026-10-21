import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

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
      console.warn('Photon lookup in AutocompleteInput failed:', err.message);
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

export default AutocompleteInput;
