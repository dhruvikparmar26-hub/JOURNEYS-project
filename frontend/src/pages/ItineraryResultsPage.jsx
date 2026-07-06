import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api.js';
import AppShell from '../components/ui/AppShell.jsx';
import Button from '../components/ui/Button.jsx';
import Skeleton from '../components/ui/Skeleton.jsx';
import Card from '../components/ui/Card.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import DayNav from '../components/DayNav.jsx';
import LiveOrchestrationLogs from '../components/LiveOrchestrationLogs.jsx';
import DayCard from '../components/DayCard.jsx';
import MapView from '../components/MapView.jsx';
import CostSummaryCard from '../components/CostSummaryCard.jsx';
import RequireAuthAction from '../components/RequireAuthAction.jsx';
import useAuth from '../hooks/useAuth.js';
import { useToast } from '../components/ui/Toast.jsx';
import { MapPin, Calendar, Compass, Share2 } from 'lucide-react';

/**
 * ItineraryResultsPage Component
 * 
 * Displays the complete itinerary with:
 * - Header with trip title, date range, and gold "Save" button
 * - Day sections with hotel and activity cards
 * - Collapsible Live Orchestration Logs panel
 * - Map view with pins and polyline
 * - Cost summary card with budget comparison
 * 
 * Fully viewable by guests. Save and Book buttons use RequireAuthAction.
 */
const ItineraryResultsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { success: showSuccessToast, error: showErrorToast } = useToast();
  
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState(null);

  // Booking confirm state
  const [bookingItem, setBookingItem] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  const fetchItinerary = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get(`/itineraries/${id}`);
      setItinerary(data);
      
      // Check if still generating
      setIsGenerating(data.status === 'generating');
      
      // Select first day by default
      if (data.days && data.days.length > 0) {
        setSelectedDay(data.days[0]);
      }
    } catch (err) {
      console.error('Error fetching itinerary:', err);
      const status = err.response?.status;
      if (status === 403) {
        setError('You do not have access to this itinerary. Please register or sign in.');
      } else if (status === 404) {
        setError('This itinerary could not be found.');
      } else {
        setError(err.response?.data?.error || 'Failed to fetch itinerary. Please refresh.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch itinerary data
  useEffect(() => {
    fetchItinerary();
  }, [id]);

  // Handle save itinerary
  const handleSave = async () => {
    try {
      setSaving(true);
      const { data } = await api.post(`/itineraries/${id}/save`);
      setItinerary(data.itinerary);
      showSuccessToast('Itinerary saved successfully to your account!');
    } catch (err) {
      console.error('Error saving itinerary:', err);
      showErrorToast(err.response?.data?.error || 'Failed to save itinerary.');
    } finally {
      setSaving(false);
    }
  };

  // Handle share itinerary
  const handleShare = async () => {
    try {
      setSharing(true);
      const { data } = await api.post(`/itineraries/${id}/share`);
      setShareUrl(data.shareUrl);
      showSuccessToast('Share link generated! Copy it from below.');
    } catch (err) {
      console.error('Error generating share link:', err);
      showErrorToast(err.response?.data?.error || 'Failed to generate share link.');
    } finally {
      setSharing(false);
    }
  };

  const copyShareUrl = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      showSuccessToast('Share link copied to clipboard!');
    }
  };

  // Triggered when book button on a card is pressed
  const handleBookTrigger = (bookingData) => {
    setBookingItem(bookingData);
  };

  // Confirmed booking submission
  const handleBookConfirm = async () => {
    if (!bookingItem) return;
    setBookingLoading(true);
    try {
      await api.post('/itineraries/bookings', bookingItem);
      showSuccessToast(`Booking created successfully for "${bookingItem.itemName}"!`);
      setBookingItem(null);
    } catch (err) {
      console.error('Error creating booking:', err);
      const status = err.response?.status;
      const msg = err.response?.data?.error;
      if (status === 403) {
        showErrorToast('Email verification is required for bookings.');
      } else {
        showErrorToast(msg || 'Failed to complete booking. Please try again.');
      }
    } finally {
      setBookingLoading(false);
    }
  };

  // Handle orchestration completion
  const handleOrchestrationComplete = (result) => {
    setIsGenerating(false);
    if (result) {
      setItinerary(prev => ({ ...prev, ...result }));
      if (result.days && result.days.length > 0 && !selectedDay) {
        setSelectedDay(result.days[0]);
      }
    }
  };

  // Scroll to day card smoothly
  const handleDaySelect = (day) => {
    setSelectedDay(day);
    const element = document.getElementById(`day-${day.dayNumber}`);
    if (element) {
      const yOffset = -80; // Offset for sticky navbar
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          {/* Header Skeleton */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border-subtle pb-6">
            <div className="space-y-2 flex-1">
              <Skeleton width="45%" height="2rem" />
              <Skeleton width="20%" height="1rem" />
            </div>
            <Skeleton width="140px" height="2.75rem" />
          </div>

          {/* SSE Terminal Box Skeleton */}
          <Skeleton width="100%" height="80px" />

          {/* Grid Layout Skeleton */}
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
            description="The itinerary you are trying to view does not exist or has been deleted."
            actionLabel="Go Home"
            onAction={() => navigate('/')}
          />
        </div>
      </AppShell>
    );
  }

  // Safe parsing of budget
  let budgetMin = 0;
  let budgetMax = 0;
  try {
    const promptData = itinerary.prompt ? JSON.parse(itinerary.prompt) : {};
    budgetMin = promptData.budgetMin || 0;
    budgetMax = promptData.budgetMax || 0;
  } catch (err) {
    console.error('Error parsing itinerary budget:', err);
  }

  return (
    <AppShell>
      <div className="w-full px-5 md:px-8 py-10 space-y-6 animate-fade-in flex-grow">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Chip variant="gold">AI-OPTIMIZED</Chip>
            <span className="label-system text-[#8e9192]">
              {itinerary.durationDays || 1} DAYS IN {itinerary.destinations?.[0]?.toUpperCase() || 'INDIA'}
            </span>
          </div>
          <h1 className="display-lg text-[#e5e2e1]">
            {itinerary.title || 'Trip Itinerary'}
          </h1>
          <p className="body-lg text-[#c4c7c7] max-w-3xl">
            {itinerary.description || 'Your personalized AI-generated travel experience.'}
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Day-by-day List */}
          <div className="lg:col-span-8 space-y-6">
            {itinerary.days?.map((day, index) => (
              <div key={day._id || index} className="relative">
                {/* Day connector line */}
                {index < (itinerary.days?.length || 0) - 1 && (
                  <div className="absolute left-6 top-12 bottom-0 w-0.5 timeline-line" />
                )}
                
                {/* Day header */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full metallic-circle flex items-center justify-center font-bold text-lg text-[#eac249]">
                    {day.dayNumber}
                  </div>
                  <h3 className="headline-md text-[#e5e2e1]">
                    {day.title || `Day ${day.dayNumber}`}
                  </h3>
                </div>

                {/* Day content */}
                <div className="ml-16 space-y-4">
                  {day.locations?.filter(loc => loc.type === 'hotel').map((hotel, hIndex) => (
                    <Card key={hIndex} className="p-4 border border-[#444748]">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded bg-gradient-to-b from-[#2a2a2a] to-[#202020] flex items-center justify-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">
                          <MapPin className="w-6 h-6 text-[#eac249]" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-bold text-[#e5e2e1]">{hotel.name}</h4>
                            <Chip variant="gold">9.4/10</Chip>
                          </div>
                          <p className="text-sm text-[#c4c7c7] mb-3">{hotel.notes || 'Luxury accommodation'}</p>
                          <div className="flex gap-2">
                            <Chip variant="default">BOUTIQUE</Chip>
                            <Chip variant="default">HISTORIC</Chip>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}

                  {day.activities?.map((activity, aIndex) => (
                    <Card key={aIndex} className="p-4 border border-[#444748]">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-b from-[#2a2a2a] to-[#202020] flex items-center justify-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">
                          <Compass className="w-5 h-5 text-[#a5c8ff]" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="label-system text-[#8e9192]">{activity.time || 'TBD'}</span>
                            <span className="label-system text-[#a5c8ff]">ACTIVITY</span>
                          </div>
                          <h4 className="font-bold text-[#e5e2e1] mb-1">{activity.description}</h4>
                          <p className="text-sm text-[#c4c7c7]">{activity.notes || ''}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 space-y-6">
            {/* Live Route Map */}
            <Card className="border border-[#444748]">
              <div className="bg-gradient-to-b from-[#2a2a2a] to-[#202020] px-4 py-3 border-b border-[#444748] flex items-center justify-between">
                <span className="label-system text-[#8e9192] flex items-center gap-2">
                  <Map className="w-4 h-4" />
                  LIVE ROUTE MAP
                </span>
                <span className="text-xs text-[#8e9192]">EXPAND</span>
              </div>
              <div className="p-4">
                <MapView day={selectedDay} />
              </div>
            </Card>

            {/* Financial Overview */}
            <Card className="border border-[#444748]">
              <div className="p-4 space-y-6">
                {/* Budget Utilization */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="label-system text-[#8e9192]">BUDGET UTILIZATION</span>
                    <span className="font-bold text-[#eac249]">
                      ₹{itinerary.totalCost?.toLocaleString('en-IN') || 0} / ₹{budgetMax?.toLocaleString('en-IN') || 0}
                    </span>
                  </div>
                  <div className="h-4 w-full bg-[#0e0e0e] rounded-full overflow-hidden shadow-[inset_4px_4px_8px_rgba(0,0,0,0.6),inset_-1px_-1px_2px_rgba(255,255,255,0.05)] p-[2px]">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-[#eac249]/60 to-[#eac249] relative shadow-[0_0_10px_rgba(234,194,73,0.3)]"
                      style={{ width: `${Math.min((itinerary.totalCost / budgetMax) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Breakdown */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#c4c7c7] flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Transport
                    </span>
                    <span className="font-bold text-[#e5e2e1]">₹5,000</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#c4c7c7] flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Lodging
                    </span>
                    <span className="font-bold text-[#e5e2e1]">₹15,000</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#c4c7c7] flex items-center gap-2">
                      <Compass className="w-4 h-4" />
                      Activities
                    </span>
                    <span className="font-bold text-[#e5e2e1]">₹8,000</span>
                  </div>
                </div>

                {/* Buttons */}
                <div className="space-y-3">
                  <Button variant="primary" fullWidth>
                    CONFIRM ITINERARY →
                  </Button>
                  <Button variant="ai" fullWidth>
                    ✨ REGENERATE WITH AI
                  </Button>
                </div>

                {/* Status */}
                {isGenerating && (
                  <p className="label-system text-[#8e9192] text-center">
                    ANALYZING LOCAL TRAFFIC...
                  </p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default ItineraryResultsPage;
