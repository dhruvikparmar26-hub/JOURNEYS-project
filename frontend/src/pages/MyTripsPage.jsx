import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api.js';
import AppShell from '../components/ui/AppShell.jsx';
import Card from '../components/ui/Card.jsx';
import Badge from '../components/ui/Badge.jsx';
import Button from '../components/ui/Button.jsx';
import Skeleton from '../components/ui/Skeleton.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import { MapPin, Calendar, IndianRupee, ChevronRight, Compass } from 'lucide-react';

const MyTripsPage = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { error: showErrorToast } = useToast();

  const fetchTrips = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get('/itineraries/users/me/trips');
      setTrips(data);
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to fetch your saved trips. Please try again.';
      setError(errMsg);
      showErrorToast(errMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const getStatusVariant = (status) => {
    switch (status) {
      case 'booked': return 'success';
      case 'saved': return 'gold';
      case 'generating': return 'blue';
      case 'generated': return 'muted';
      default: return 'muted';
    }
  };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in w-full flex-grow flex flex-col">
        {/* Header */}
        <div className="border-b border-border pb-5">
          <h1 className="heading-xl font-bold tracking-tight text-text-primary">My Journeys</h1>
          <p className="text-sm text-text-secondary mt-1">
            Manage, review, and complete bookings for your planned India corridors.
          </p>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex gap-4 p-5 bg-bg-surface border border-border-subtle rounded-2xl">
                <div className="flex-1 space-y-3">
                  <Skeleton width="40%" height="1.25rem" />
                  <Skeleton width="60%" height="0.875rem" />
                  <div className="flex gap-4 pt-1">
                    <Skeleton width="80px" height="1.5rem" />
                    <Skeleton width="100px" height="1.5rem" />
                  </div>
                </div>
                <div className="flex items-center">
                  <Skeleton width="24px" height="24px" circle />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <ErrorState
            title="Unable to load journeys"
            message={error}
            onRetry={fetchTrips}
          />
        )}

        {/* Empty state */}
        {!loading && !error && trips.length === 0 && (
          <EmptyState
            icon={Compass}
            title="No journeys found"
            description="You haven't generated or saved any trip itineraries yet. Let's design your first India itinerary corridors!"
            actionLabel="Start Planning"
            onAction={() => navigate('/')}
          />
        )}

        {/* Trips list */}
        {!loading && !error && trips.length > 0 && (
          <div className="space-y-4">
            {trips.map((trip) => {
              const dateStr = trip.createdAt
                ? new Date(trip.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : null;

              return (
                <Link key={trip._id} to={`/itinerary/${trip._id}`}>
                  <Card
                    onClick={() => {}}
                    className="flex items-center justify-between p-5 hover:translate-x-1 hover:border-accent-gold/40 transition-all group"
                  >
                    <div className="space-y-2 flex-1 min-w-0 pr-4">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h3 className="text-base font-bold text-text-primary group-hover:text-accent-gold-dark transition-colors truncate">
                          {trip.title || `${trip.destinations?.join(', ') || 'India'} Corridor`}
                        </h3>
                        <Badge variant={getStatusVariant(trip.status)} size="sm">
                          {trip.status}
                        </Badge>
                      </div>

                      {/* Info details */}
                      <div className="flex flex-wrap gap-y-1.5 gap-x-4 text-xs text-text-secondary">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <MapPin className="w-3.5 h-3.5 text-accent-blue flex-shrink-0" />
                          <span className="truncate">{trip.destinations?.join(' → ') || 'India'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-accent-blue flex-shrink-0" />
                          <span>{trip.durationDays} Days</span>
                        </div>
                        {trip.totalCost > 0 && (
                          <div className="flex items-center gap-0.5 text-text-primary font-bold numeric">
                            <IndianRupee className="w-3.5 h-3.5 text-accent-blue flex-shrink-0" />
                            <span>{trip.totalCost.toLocaleString('en-IN')}</span>
                          </div>
                        )}
                        {dateStr && (
                          <div className="text-text-muted">
                            Planned on {dateStr}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Chevron Indicator */}
                    <div className="w-8 h-8 rounded-full bg-bg-elevated/70 text-text-secondary flex items-center justify-center group-hover:bg-accent-gold/20 group-hover:text-[#006d35] transition-all">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default MyTripsPage;
