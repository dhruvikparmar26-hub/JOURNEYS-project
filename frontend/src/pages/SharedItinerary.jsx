import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api.js';
import AppShell from '../components/ui/AppShell.jsx';
import Button from '../components/ui/Button.jsx';
import Skeleton from '../components/ui/Skeleton.jsx';
import Card from '../components/ui/Card.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import DayNav from '../components/DayNav.jsx';
import DayCard from '../components/DayCard.jsx';
import MapView from '../components/MapView.jsx';
import CostSummaryCard from '../components/CostSummaryCard.jsx';
import { MapPin, Calendar, Compass, Lock } from 'lucide-react';

const SharedItinerary = () => {
  const { shareToken } = useParams();
  const navigate = useNavigate();
  
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);

  const fetchItinerary = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get(`/itineraries/shared/${shareToken}`);
      setItinerary(data.itinerary);
      
      // Select first day by default
      if (data.itinerary.days && data.itinerary.days.length > 0) {
        setSelectedDay(data.itinerary.days[0]);
      }
    } catch (err) {
      console.error('Error fetching shared itinerary:', err);
      const status = err.response?.status;
      if (status === 404) {
        setError('This shared itinerary could not be found or may have been removed.');
      } else if (status === 403) {
        setError('This itinerary is not publicly shared.');
      } else {
        setError(err.response?.data?.error || 'Failed to fetch itinerary. Please refresh.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItinerary();
  }, [shareToken]);

  // Scroll to day card smoothly
  const handleDaySelect = (day) => {
    setSelectedDay(day);
    const element = document.getElementById(`day-${day.dayNumber}`);
    if (element) {
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border-subtle pb-6">
            <div className="space-y-2 flex-1">
              <Skeleton width="45%" height="2rem" />
              <Skeleton width="20%" height="1rem" />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1 space-y-4">
              <Skeleton width="100%" height="240px" />
            </div>
            <div className="lg:col-span-2 space-y-6">
              {[1, 2].map((n) => (
                <div key={n} className="space-y-3">
                  <Skeleton width="30%" height="1.5rem" />
                  <Skeleton width="100%" height="180px" />
                </div>
              ))}
            </div>
            <div className="lg:col-span-1 space-y-6">
              <Skeleton width="100%" height="280px" />
              <Skeleton width="100%" height="200px" />
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <ErrorState
            title="Access Error"
            message={error}
            onRetry={fetchItinerary}
          />
        </div>
      </AppShell>
    );
  }

  if (!itinerary) {
    return (
      <AppShell>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <EmptyState
            icon={Compass}
            title="Itinerary not found"
            description="The shared itinerary you are trying to view does not exist or has been removed."
            actionLabel="Go Home"
            onAction={() => navigate('/')}
          />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 animate-fade-in flex-grow">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border-subtle pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="headline-md md:text-3xl font-bold tracking-tight text-text-primary">
                {itinerary.title || 'Trip Itinerary'}
              </h1>
              <div className="flex items-center gap-1 text-xs text-text-muted bg-bg-elevated px-2 py-1 rounded">
                <Lock className="w-3 h-3" />
                Read-only
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs font-semibold text-text-secondary">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-secondary" />
                {itinerary.destinations?.join(', ') || 'India'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-secondary" />
                {itinerary.durationDays || 1} Days duration
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={() => navigate('/')}>
              Plan Your Own Trip
            </Button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Day Navigation column */}
          <div className="lg:col-span-1 lg:sticky lg:top-20 h-fit self-start order-2 lg:order-1">
            <DayNav
              days={itinerary.days}
              activeDayNumber={selectedDay?.dayNumber}
              onDayClick={handleDaySelect}
            />
          </div>

          {/* Day Cards list */}
          <div className="lg:col-span-2 space-y-8 order-3 lg:order-2">
            {itinerary.days?.map((day, index) => (
              <div id={`day-${day.dayNumber}`} key={index} className="scroll-mt-24">
                <DayCard
                  day={day}
                  itineraryId={itinerary._id}
                  onBook={() => {}} // No-op for shared view
                  readOnly={true}
                />
                {index < itinerary.days.length - 1 && (
                  <div className="border-l-2 border-dashed border-border ml-6 my-5 h-6"></div>
                )}
              </div>
            ))}
          </div>

          {/* Map and Cost Summary */}
          <div className="lg:col-span-1 space-y-6 order-1 lg:order-3">
            <div className="lg:sticky lg:top-20">
              <MapView 
                day={selectedDay} 
                className="shadow-md"
              />
            </div>
            <CostSummaryCard
              itinerary={itinerary}
              budgetMin={0}
              budgetMax={0}
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default SharedItinerary;
