import React from 'react';
import Card from './ui/Card.jsx';
import Button from './ui/Button.jsx';
import RequireAuthAction from './RequireAuthAction.jsx';
import { Star, Clock, MapPin, Hotel, Sparkles } from 'lucide-react';

/**
 * ActivityCard Component
 * 
 * Displays an individual activity/hotel with thumbnail, details, price, and Book button.
 */
const ActivityCard = ({ 
  item, 
  type = 'activity', 
  onBook,
  itineraryId 
}) => {
  const {
    name,
    description,
    cost,
    currency = 'INR',
    lat,
    lng,
    address,
    time,
    duration,
    rating,
    amenities,
  } = item;

  // Reliable India travel image placeholders
  const getImageUrl = () => {
    if (type === 'hotel') {
      return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&h=300&q=80';
    }
    return 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=400&h=300&q=80';
  };

  const handleBook = () => {
    if (onBook) {
      onBook({
        itineraryId,
        itemName: name,
        itemType: type,
        bookingDate: new Date().toISOString(),
        price: cost,
        currency: currency,
        metadata: {
          lat,
          lng,
          address,
          time,
          duration,
        },
      });
    }
  };

  return (
    <Card elevated noPadding className="overflow-hidden group hover:shadow-lg transition-all duration-300 border border-border-subtle bg-bg-surface">
      <div className="flex flex-col sm:flex-row">
        {/* Thumbnail Image */}
        <div className="sm:w-44 h-44 sm:h-auto flex-shrink-0 relative overflow-hidden bg-bg-elevated">
          <img
            src={getImageUrl()}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          {rating && (
            <div className="absolute top-2.5 right-2.5 bg-bg-surface/90 backdrop-blur-sm px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm border border-border/30">
              <Star className="w-3 h-3 text-[#f2a93b] fill-[#f2a93b]" />
              <span className="text-[10px] font-bold text-text-primary">{rating}</span>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4.5 flex flex-col justify-between">
          <div>
            {/* Header Title + Price */}
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-extrabold text-text-primary text-base leading-tight tracking-tight truncate">
                  {name}
                </h3>
                {type === 'hotel' && amenities && amenities.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {amenities.slice(0, 3).map((amenity, idx) => (
                      <span key={idx} className="text-[9px] font-bold font-mono px-2 py-0.5 bg-bg-elevated text-text-secondary border border-border/30 rounded-full">
                        {amenity}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Price Badge */}
              <div className="flex-shrink-0">
                <div className="bg-accent-gold/15 border border-accent-gold-dark/20 px-2.5 py-1 rounded-xl">
                  <span className="text-[#006d35] font-extrabold text-xs font-mono numeric">
                    {currency === 'INR' ? '₹' : '$'}{cost?.toLocaleString() || '0'}
                  </span>
                  {type === 'hotel' && <span className="text-[10px] text-text-secondary font-medium ml-0.5">/night</span>}
                </div>
              </div>
            </div>

            {/* Description */}
            {description && (
              <p className="text-xs text-text-secondary mb-3.5 line-clamp-2 leading-relaxed">
                {description}
              </p>
            )}

            {/* Meta Details (Time/Duration/Location) */}
            <div className="flex flex-col gap-1.5 mb-2">
              {(time || duration) && (
                <div className="flex items-center gap-4 text-xs font-semibold text-text-muted">
                  {time && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-accent-blue" />
                      <span>{time}</span>
                    </div>
                  )}
                  {duration && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-accent-blue" />
                      <span>{duration}</span>
                    </div>
                  )}
                </div>
              )}

              {address && (
                <div className="flex items-start gap-1.5 text-xs font-semibold text-text-muted">
                  <MapPin className="w-3.5 h-3.5 text-accent-blue flex-shrink-0 mt-0.5" />
                  <span className="truncate">{address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Card Footer Actions */}
          <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-border-subtle">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1">
              {type === 'hotel' ? (
                <>
                  <Hotel className="w-3.5 h-3.5 text-accent-blue" />
                  Accommodation
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-accent-blue" />
                  Activity Point
                </>
              )}
            </span>
            <RequireAuthAction
              onAuthed={handleBook}
              contextMessage="Sign in to book this item"
            >
              <Button variant="primary" size="sm" className="cursor-pointer font-bold">
                Book
              </Button>
            </RequireAuthAction>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ActivityCard;
