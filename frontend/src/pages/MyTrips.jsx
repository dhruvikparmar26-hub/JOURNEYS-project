import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api.js';
import AppShell from '../components/ui/AppShell.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Chip from '../components/ui/Chip.jsx';
import Skeleton from '../components/ui/Skeleton.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import { Compass, Calendar, MapPin, ArrowRight, Sparkles } from 'lucide-react';

const MyTrips = () => {
  const navigate = useNavigate();
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  const fetchTrips = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get('/itineraries/users/me/trips');
      setItineraries(data || []);
    } catch (err) {
      console.error('Failed to fetch trips:', err);
      setError('Failed to load your trips. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const filteredItineraries = itineraries.filter(itinerary => {
    if (activeTab === 'all') return true;
    return itinerary.status === activeTab;
  });

  const tabs = [
    { id: 'all', label: 'All Trips', count: itineraries.length },
    { id: 'saved', label: 'Saved', count: itineraries.filter(i => i.status === 'saved').length },
    { id: 'booked', label: 'Booked', count: itineraries.filter(i => i.status === 'booked').length },
    { id: 'draft', label: 'Draft', count: itineraries.filter(i => i.status === 'draft' || i.status === 'generating').length },
  ];

  if (loading) {
    return (
      <AppShell>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="mb-8">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="h-48">
                <Skeleton className="h-6 w-3/4 mb-4" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-1/3" />
              </Card>
            ))}
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
            title="Failed to Load Trips"
            message={error}
            onRetry={fetchTrips}
          />
        </div>
      </AppShell>
    );
  }

  if (itineraries.length === 0) {
    return (
      <AppShell>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <EmptyState
            icon={Compass}
            title="No Trips Yet"
            description="You haven't saved any itineraries yet. Start planning your next adventure!"
            action={
              <Button onClick={() => navigate('/')}>
                Plan a Trip
              </Button>
            }
          />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="w-full px-5 md:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="display-lg text-[#e5e2e1] mb-4">
            My Trips
          </h1>
          <p className="body-lg text-[#c4c7c7]">
            {itineraries.length} {itineraries.length === 1 ? 'trip' : 'trips'} saved
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-[#444748]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 px-2 text-sm font-medium transition-colors relative cursor-pointer ${
                activeTab === tab.id
                  ? 'text-[#eac249]'
                  : 'text-[#c4c7c7] hover:text-[#e5e2e1]'
              }`}
            >
              {tab.label}
              <span className="ml-2 text-[#8e9192]">({tab.count})</span>
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#eac249]" />
              )}
            </button>
          ))}
        </div>

        {/* Trips Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItineraries.map((itinerary) => (
            <Card
              key={itinerary._id}
              className="cursor-pointer hover-lift border border-[#444748]"
              onClick={() => navigate(`/itinerary/${itinerary._id}`)}
            >
              <div className="space-y-4">
                {/* Trip Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-[#eac249] mb-1">
                      {itinerary.title || 'Untitled Trip'}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-[#8e9192]">
                      <Calendar className="w-3.5 h-3.5" />
                      {itinerary.durationDays ? `${itinerary.durationDays} days` : 'N/A'}
                    </div>
                  </div>
                  <Chip variant="gold">AI</Chip>
                </div>

                {/* Route Info */}
                {itinerary.days && itinerary.days.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-[#c4c7c7]">
                    <MapPin className="w-4 h-4 text-[#8e9192]" />
                    <span className="truncate">
                      {itinerary.destinations?.join(', ') || 'India'}
                    </span>
                  </div>
                )}

                {/* Cost */}
                {itinerary.totalCost !== undefined && (
                  <div className="text-sm font-semibold text-[#e5e2e1]">
                    ₹{itinerary.totalCost.toLocaleString('en-IN')}
                  </div>
                )}

                {/* Status */}
                <div className="flex items-center justify-between pt-3 border-t border-[#444748]">
                  <Chip variant="default">
                    {itinerary.status === 'saved' ? 'SAVED' :
                     itinerary.status === 'booked' ? 'BOOKED' :
                     itinerary.status === 'generating' ? 'GENERATING' :
                     'DRAFT'}
                  </Chip>
                  <ArrowRight className="w-4 h-4 text-[#8e9192]" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredItineraries.length === 0 && !loading && (
          <div className="text-center py-16">
            <Sparkles className="w-16 h-16 text-[#8e9192] mx-auto mb-4" />
            <h3 className="headline-md text-[#e5e2e1] mb-2">No trips found</h3>
            <p className="body-md text-[#c4c7c7] mb-6">
              {activeTab === 'all' 
                ? 'Start planning your next adventure!'
                : `No ${activeTab} trips yet.`}
            </p>
            <Button onClick={() => navigate('/')}>
              Plan a Trip
            </Button>
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default MyTrips;
