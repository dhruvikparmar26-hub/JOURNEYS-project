import React, { useEffect, useRef, useState } from 'react';
import Card from './ui/Card.jsx';
import { loadGoogleMaps } from '../utils/maps.js';
import { Map, MapPin } from 'lucide-react';

/**
 * MapView Component
 * 
 * Displays a Google Map showing all pins for the currently selected day,
 * connected by a polyline in the order visited using accent.blue for the route line.
 */
const MapView = ({ day, className = '' }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const polylineRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load Google Maps API using centralized loader (which fetches config dynamically)
  useEffect(() => {
    loadGoogleMaps()
      .then(() => {
        setIsLoaded(true);
      })
      .catch((err) => {
        console.error('Google Maps initialization failed in MapView:', err);
      });
  }, []);

  // Initialize map when API is loaded
  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstanceRef.current) return;

    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      center: { lat: 26.9124, lng: 75.7873 }, // Default to Jaipur
      zoom: 12,
      styles: [
        {
          featureType: 'all',
          elementType: 'geometry',
          stylers: [{ color: '#131313' }],
        },
        {
          featureType: 'all',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#e5e2e1' }],
        },
        {
          featureType: 'all',
          elementType: 'labels.text.stroke',
          stylers: [{ color: '#131313' }],
        },
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [{ color: '#1b1b1c' }],
        },
        {
          featureType: 'road',
          elementType: 'geometry',
          stylers: [{ color: '#2a2a2a' }],
        },
        {
          featureType: 'road',
          elementType: 'geometry.stroke',
          stylers: [{ color: '#4d4635' }],
        },
        {
          featureType: 'poi',
          elementType: 'geometry',
          stylers: [{ color: '#202020' }],
        },
        {
          featureType: 'administrative',
          elementType: 'geometry',
          stylers: [{ color: '#2a2a2a' }],
        },
      ],
    });
  }, [isLoaded]);

  // Update map when day changes
  useEffect(() => {
    if (!mapInstanceRef.current || !day) return;

    // Clear existing markers and polyline
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
    }

    // Extract locations from the day
    const locations = [];
    
    // Add hotel location
    const hotel = day.locations?.find(loc => loc.type === 'hotel');
    if (hotel && hotel.lat && hotel.lng) {
      locations.push({
        lat: hotel.lat,
        lng: hotel.lng,
        name: hotel.name,
        type: 'hotel',
      });
    }

    // Add activity locations
    day.activities?.forEach(activity => {
      if (activity.lat && activity.lng) {
        locations.push({
          lat: activity.lat,
          lng: activity.lng,
          name: activity.description,
          type: 'activity',
        });
      }
    });

    if (locations.length === 0) return;

    // Create markers
    const bounds = new window.google.maps.LatLngBounds();
    
    locations.forEach((location, index) => {
      const isHotel = location.type === 'hotel';
      const markerColor = isHotel ? '#f2ca50' : '#2792ff'; // Gold for hotel, blue for activities

      const marker = new window.google.maps.Marker({
        position: { lat: location.lat, lng: location.lng },
        map: mapInstanceRef.current,
        title: location.name,
        label: {
          text: (index + 1).toString(),
          color: '#131313',
          fontSize: '11px',
          fontWeight: 'bold',
        },
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 11,
          fillColor: markerColor,
          fillOpacity: 1,
          strokeColor: '#e5e2e1',
          strokeWeight: 2,
        },
      });

      markersRef.current.push(marker);
      bounds.extend({ lat: location.lat, lng: location.lng });
    });

    // Create polyline connecting the locations
    if (locations.length > 1) {
      const path = locations.map(loc => ({ loc: loc, lat: loc.lat, lng: loc.lng }));
      
      polylineRef.current = new window.google.maps.Polyline({
        path: path,
        geodesic: true,
        strokeColor: '#f2ca50', // Gold
        strokeOpacity: 0.8,
        strokeWeight: 3.5,
      });

      polylineRef.current.setMap(mapInstanceRef.current);
    }

    // Fit map to show all markers
    mapInstanceRef.current.fitBounds(bounds);

  }, [day, isLoaded]);

  return (
    <Card noPadding className={`overflow-hidden border border-border-subtle relative ${className}`}>
      <div className="p-4 border-b border-border-subtle flex items-center justify-between bg-bg-elevated/40">
        <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5 font-sans">
          <Map className="w-4 h-4 text-accent-blue" />
          Interactive Corridor Map
        </h3>
        {day && (
          <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-bg-surface text-text-secondary border border-border/40">
            Day {day.dayNumber}
          </span>
        )}
      </div>
      <div 
        ref={mapRef} 
        className="w-full h-72 bg-bg-elevated"
        style={{ minHeight: '288px' }}
      />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-bg-elevated/80 backdrop-blur-sm z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-border border-t-accent-gold mx-auto mb-2.5"></div>
            <p className="text-xs text-text-secondary font-semibold">Initializing Maps SDK...</p>
          </div>
        </div>
      )}
    </Card>
  );
};

export default MapView;
