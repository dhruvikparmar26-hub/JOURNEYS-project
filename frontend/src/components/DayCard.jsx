import React from 'react';
import ActivityCard from './ActivityCard.jsx';
import { CalendarRange } from 'lucide-react';

/**
 * DayCard Component
 * 
 * Displays a single day's itinerary with hotel card and activity cards in time order.
 * Includes a theme name (LLM-generated) and day number.
 */
const DayCard = ({ day, itineraryId, onBook }) => {
  const { dayNumber, title, locations, activities, travelSegments, dayCost } = day;

  // Combine hotel (from locations) and activities into a sorted list
  const items = [];
  
  // Add hotel if available
  const hotel = locations?.find(loc => loc.type === 'hotel');
  if (hotel) {
    items.push({
      type: 'hotel',
      name: hotel.name,
      description: hotel.notes,
      cost: 0, // Hotel cost is calculated separately in the package
      currency: 'INR',
      lat: hotel.lat,
      lng: hotel.lng,
      address: hotel.name,
      rating: 4.8,
      amenities: ['Free WiFi', 'Air Conditioning', 'Breakfast Included'],
    });
  }

  // Add activities with time sorting
  const sortedActivities = [...(activities || [])].sort((a, b) => {
    if (!a.time) return 1;
    if (!b.time) return -1;
    return a.time.localeCompare(b.time);
  });

  sortedActivities.forEach(activity => {
    items.push({
      type: 'activity',
      name: activity.description,
      description: '',
      cost: activity.cost || 0,
      currency: activity.currency || 'INR',
      time: activity.time,
      duration: '2h',
    });
  });

  return (
    <div className="space-y-4">
      {/* Day Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-2.5 gap-2">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-gold/20 text-[#006d35] flex items-center justify-center flex-shrink-0 mt-0.5">
            <CalendarRange className="w-5.5 h-5.5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-text-primary leading-snug tracking-tight">
              Day {dayNumber}: {title || 'Exploration'}
            </h2>
            {dayCost > 0 && (
              <p className="text-xs font-semibold text-text-secondary mt-0.5 flex items-center">
                Estimated Day Cost:&nbsp;
                <span className="text-[#006d35] font-bold font-mono numeric">₹{dayCost.toLocaleString('en-IN')}</span>
              </p>
            )}
          </div>
        </div>
        <div className="sm:text-right flex items-center sm:justify-end gap-1.5 pl-13 sm:pl-0">
          <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-bg-elevated border border-border-subtle text-text-secondary">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </span>
        </div>
      </div>

      {/* Cards Stack */}
      <div className="space-y-3.5 pl-1.5">
        {items.map((item, index) => (
          <ActivityCard
            key={`${item.type}-${index}`}
            item={item}
            type={item.type}
            onBook={onBook}
            itineraryId={itineraryId}
          />
        ))}
      </div>
    </div>
  );
};

export default DayCard;
