import React, { useEffect, useRef, useState } from 'react';
import Card from './ui/Card.jsx';
import { Map as MapIcon } from 'lucide-react';

/**
 * MapView Component
 * 
 * Displays an OpenStreetMap using Leaflet showing all pins for the currently selected day,
 * connected by a polyline in the order visited. Uses a premium dark style.
 */
const MapView = ({ day, className = '' }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Check if Leaflet is loaded globally from index.html CDN
  useEffect(() => {
    const checkLeaflet = () => {
      if (window.L) {
        setIsLoaded(true);
      } else {
        setTimeout(checkLeaflet, 100);
      }
    };
    checkLeaflet();
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstanceRef.current) return;

    // Create Leaflet map instance
    const map = window.L.map(mapRef.current, {
      center: [26.9124, 75.7873], // Default Jaipur
      zoom: 12,
      zoomControl: true
    });

    // Add CartoDB Dark Matter tile layer for premium dark aesthetics
    window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 20
    }).addTo(map);

    // Create a layer group to easily clear and add markers/lines
    const layerGroup = window.L.layerGroup().addTo(map);

    mapInstanceRef.current = map;
    layerGroupRef.current = layerGroup;

    // Cleanup on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isLoaded]);

  // Update map when day changes
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current || !day) return;

    const L = window.L;
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;

    // Clear existing markers and polylines from the layer group
    layerGroup.clearLayers();

    // Extract locations from the day
    const locations = [];
    
    // Add hotel location
    const hotel = day.locations?.find(loc => loc.type === 'hotel');
    if (hotel && hotel.lat && hotel.lng) {
      locations.push({
        lat: Number(hotel.lat),
        lng: Number(hotel.lng),
        name: hotel.name,
        type: 'hotel',
      });
    }

    // Add activity locations
    day.activities?.forEach(activity => {
      if (activity.lat && activity.lng) {
        locations.push({
          lat: Number(activity.lat),
          lng: Number(activity.lng),
          name: activity.description || activity.name,
          type: 'activity',
        });
      }
    });

    if (locations.length === 0) return;

    const bounds = [];
    const pathCoordinates = [];

    locations.forEach((location, index) => {
      const isHotel = location.type === 'hotel';
      const markerColor = isHotel ? '#f2ca50' : '#2792ff'; // Gold for hotel, blue for activities

      // Custom HTML Marker using Leaflet DivIcon for matching existing UI styles
      const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `<div style="
          width: 24px;
          height: 24px;
          background-color: ${markerColor};
          border: 2px solid #e5e2e1;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #131313;
          font-size: 11px;
          font-weight: bold;
          box-shadow: 0 2px 5px rgba(0,0,0,0.5);
        ">${index + 1}</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([location.lat, location.lng], { icon: customIcon })
        .bindPopup(`<strong style="color: #131313;">${location.name}</strong>`)
        .addTo(layerGroup);

      bounds.push([location.lat, location.lng]);
      pathCoordinates.push([location.lat, location.lng]);
    });

    // Create polyline connecting the locations
    if (pathCoordinates.length > 1) {
      L.polyline(pathCoordinates, {
        color: '#f2ca50', // Gold route line
        weight: 3,
        opacity: 0.8,
        smoothFactor: 1
      }).addTo(layerGroup);
    }

    // Fit map to show all markers
    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40] });
    }

  }, [day, isLoaded]);

  return (
    <Card noPadding className={`overflow-hidden border border-border-subtle relative ${className}`}>
      <div className="p-4 border-b border-border-subtle flex items-center justify-between bg-bg-elevated/40">
        <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5 font-sans">
          <MapIcon className="w-4 h-4 text-accent-blue" />
          Interactive Corridor Map (OpenStreetMap)
        </h3>
        {day && (
          <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-bg-surface text-text-secondary border border-border/40">
            Day {day.dayNumber}
          </span>
        )}
      </div>
      <div 
        ref={mapRef} 
        className="w-full h-72 bg-bg-elevated z-0"
        style={{ minHeight: '288px' }}
      />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-bg-elevated/80 backdrop-blur-sm z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-border border-t-accent-gold mx-auto mb-2.5"></div>
            <p className="text-xs text-text-secondary font-semibold">Initializing OSM Map...</p>
          </div>
        </div>
      )}
    </Card>
  );
};

export default MapView;
