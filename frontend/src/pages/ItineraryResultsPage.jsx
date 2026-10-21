import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api.js';
import LandingLayout from '../components/ui/LandingLayout.jsx';
import Skeleton from '../components/ui/Skeleton.jsx';
import Card from '../components/ui/Card.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import MapView from '../components/MapView.jsx';
import useAuth from '../hooks/useAuth.js';
import { useToast } from '../components/ui/Toast.jsx';
import { MapPin, Calendar, Compass, Share2 } from 'lucide-react';
import Chip from '../components/ui/Chip.jsx';
import LiveOrchestrationLogs from '../components/LiveOrchestrationLogs.jsx';

/**
 * ItineraryResultsPage Component
 * 
 * Displays the complete itinerary inside LandingLayout.
 */
const ItineraryResultsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { success: showSuccessToast, error: showErrorToast } = useToast();
  
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState(null);
  
  const [isBooked, setIsBooked] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [isPaying, setIsPaying] = useState(false);
  const [paymentStep, setPaymentStep] = useState('select');
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [sendingReport, setSendingReport] = useState(false);
  const [qrSeconds, setQrSeconds] = useState(300);
  const [upiSubMethod, setUpiSubMethod] = useState('id'); // 'id' | 'qr'

  const handleOpenPlaceDetails = (place) => {
    setSelectedPlace(place);
  };

  const handleSendDetails = async () => {
    if (!itinerary) return;
    try {
      setSendingReport(true);
      const destinationLabel = itinerary.destinations?.[0] || itinerary.destination?.label || itinerary.destination || itinerary.title;
      const promptData = itinerary.prompt ? (typeof itinerary.prompt === 'string' ? JSON.parse(itinerary.prompt) : itinerary.prompt) : {};

      const daysStr = itinerary.days?.map(d => {
        const hotelStr = d.locations?.filter(l => l.type === 'hotel').map(h => `- Stay: ${h.name} (${h.notes || 'Curated stay'})`).join('\n') || '';
        const actsStr = d.activities?.map(a => `- ${a.time || '10:00 AM'}: ${a.description} (${a.notes || 'Activity details'})`).join('\n') || '';
        const transStr = d.travelSegments?.map(t => `- Transit: ${t.mode.toUpperCase()} from ${t.from?.split(',')[0]} to ${t.to?.split(',')[0]} (${t.distanceKm} km, ₹${t.cost})`).join('\n') || '';
        
        return `Day ${d.dayNumber}:\n${hotelStr ? hotelStr + '\n' : ''}${actsStr ? actsStr + '\n' : ''}${transStr ? transStr + '\n' : ''}`;
      }).join('\n') || '';

      const reportMessage = `📊 JOURNEYS Trip Report - ${destinationLabel.toUpperCase()}
-----------------------------------------------
Origin: ${promptData.origin?.label || 'Mumbai'}
Destination: ${destinationLabel}
Duration: ${itinerary.durationDays || 3} Days
Travel Mode: ${itinerary.days?.[0]?.travelSegments?.[0]?.mode?.toUpperCase() || 'PLANE'}
Estimated Distance: ${itinerary.days?.[0]?.travelSegments?.[0]?.distanceKm || 1415} km
Total Planned Cost: ₹${(itinerary.totalCost || 18000).toLocaleString('en-IN')}

DAY-BY-DAY PLANS:
${daysStr}
-----------------------------------------------
Report generated successfully. Safe travels!`;

      await api.post('/notifications', {
        type: 'itinerary_saved',
        message: reportMessage,
        relatedItineraryId: itinerary._id,
        category: 'trip',
        priority: 'high'
      });

      showSuccessToast('Full trip details report sent to your notifications!');
    } catch (err) {
      console.error(err);
      showErrorToast('Failed to send trip report.');
    } finally {
      setSendingReport(false);
    }
  };

  const handleProcessPayment = async () => {
    setIsPaying(true);
    setPaymentStep('processing');
    
    // Payment Processing Simulation
    const steps = [
      'Initiating transaction gateway...',
      'Contacting payment processor...',
      'Confirming transit seat reservations...',
      'Generating booking confirmation stub...'
    ];
    
    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 800));
    }
    
    const destinationLabel = itinerary.destinations?.[0] || itinerary.destination?.label || itinerary.destination || itinerary.title;
    const promptData = itinerary.prompt ? (typeof itinerary.prompt === 'string' ? JSON.parse(itinerary.prompt) : itinerary.prompt) : {};
    
    try {
      const pMethodLabel = paymentMethod === 'upi' ? `UPI ID: ${upiId}` : `Card: **** **** **** ${cardNumber.slice(-4)}`;
      
      // Create Booking in DB to update spend metrics
      await api.post('/itineraries/bookings', {
        itineraryId: itinerary._id,
        itemName: `Trip Package to ${destinationLabel}`,
        itemType: 'transport',
        bookingDate: new Date(),
        quantity: 1,
        price: itinerary.totalCost || 18000,
        currency: 'INR'
      });

      await api.post('/notifications', {
        type: 'booking_confirmed',
        message: `🎉 Ticket Booked! Your journey from ${promptData.origin?.label?.split(',')[0] || 'Delhi'} to ${destinationLabel?.split(',')[0] || 'Jaipur'} is confirmed. Total cost of ₹${(itinerary.totalCost || 18000).toLocaleString('en-IN')} paid successfully via ${pMethodLabel}.`,
        relatedItineraryId: itinerary._id,
        category: 'booking',
        priority: 'urgent'
      });
      
      await api.post('/notifications', {
        type: 'itinerary_ready',
        message: `📅 Day-to-day itinerary for ${destinationLabel} is now active. Total Days: ${itinerary.days?.length || 3}. Pack light and enjoy your journey!`,
        relatedItineraryId: itinerary._id,
        category: 'trip',
        priority: 'high'
      });
      
      try {
        await api.patch(`/itineraries/${itinerary._id}`, { status: 'booked' });
      } catch (statusErr) {
        console.log('Ignore minor status error, fallback to local confirmation state');
      }

      setIsBooked(true);
      setPaymentStep('success');
      showSuccessToast('Tickets booked successfully!');
    } catch (err) {
      console.error(err);
      showErrorToast('Failed to create booking notifications. Resuming local checkout simulation.');
      setIsBooked(true);
      setPaymentStep('success');
    } finally {
      setIsPaying(false);
    }
  };

  const fetchItinerary = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      setError(null);
      const { data } = await api.get(`/itineraries/${id}`);
      setItinerary(data);
      setIsBooked(data.status === 'booked');
      if (data.days && data.days.length > 0) {
        setSelectedDay(data.days[0]);
      }
    } catch (err) {
      console.error(err);
      if (!silent) {
        setError(err.response?.data?.error || 'Failed to fetch itinerary.');
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchItinerary();
    }
  }, [id, authLoading]);

  // Auto-poll when the itinerary is still being generated by the AI orchestrator
  useEffect(() => {
    let pollInterval;
    if (itinerary && itinerary.status === 'generating') {
      pollInterval = setInterval(() => {
        fetchItinerary(true);
      }, 2000);
    }
    return () => clearInterval(pollInterval);
  }, [id, itinerary?.status]);

  useEffect(() => {
    if (paymentStep !== 'qrcode') return;
    setQrSeconds(300);
    const interval = setInterval(() => {
      setQrSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [paymentStep]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { data } = await api.post(`/itineraries/${id}/save`);
      setItinerary(data.itinerary);
      showSuccessToast('Itinerary saved to your account!');
    } catch (err) {
      console.error(err);
      showErrorToast('Failed to save itinerary.');
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    try {
      setSharing(true);
      const { data } = await api.post(`/itineraries/${id}/share`);
      setShareUrl(data.shareUrl || `${window.location.origin}/shared/${data.shareToken}`);
      showSuccessToast('Share link generated!');
    } catch (err) {
      console.error(err);
      showErrorToast('Failed to generate share link.');
    } finally {
      setSharing(false);
    }
  };

  const copyShareUrl = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      showSuccessToast('Copied share link to clipboard!');
    }
  };

  if (loading || authLoading) {
    return (
      <LandingLayout>
        <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-12 text-center">
          <span className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin inline-block"></span>
          <p className="mt-4 text-on-surface-variant">Opening itinerary details...</p>
        </div>
      </LandingLayout>
    );
  }

  if (error) {
    return (
      <LandingLayout>
        <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-12">
          <ErrorState title="Access Error" message={error} onRetry={() => fetchItinerary(false)} />
        </div>
      </LandingLayout>
    );
  }

  if (!itinerary) {
    return (
      <LandingLayout>
        <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-12">
          <EmptyState icon={Compass} title="Itinerary not found" description="The itinerary you are trying to view does not exist." />
        </div>
      </LandingLayout>
    );
  }

  if (itinerary.status === 'generating') {
    return (
      <LandingLayout>
        <div className="max-w-[800px] mx-auto px-margin-mobile md:px-margin-desktop py-16 text-center space-y-6">
          <div className="w-16 h-16 border-4 border-[#ffa630] border-t-transparent rounded-full animate-spin inline-block mx-auto" />
          <h2 className="font-display-lg text-2xl text-[#0B1226]">AI Orchestrator is Crafting Your Itinerary...</h2>
          <p className="text-sm text-on-surface-variant max-w-md mx-auto">
            Analyzing routes, selecting top stays, curating daily activities, and optimizing your budget. This usually takes just a few seconds.
          </p>
          <div className="text-left mt-6">
            <LiveOrchestrationLogs itineraryId={id} isGenerating={true} onComplete={() => fetchItinerary(false)} />
          </div>
        </div>
      </LandingLayout>
    );
  }

  if (itinerary.status === 'failed') {
    return (
      <LandingLayout>
        <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-12">
          <ErrorState 
            title="Itinerary Generation Failed" 
            message={itinerary.error || "The AI orchestrator encountered an issue while generating your itinerary. Please try creating a new itinerary with adjusted parameters."} 
            onRetry={() => navigate('/planner')} 
          />
        </div>
      </LandingLayout>
    );
  }

  const promptData = itinerary.prompt ? (typeof itinerary.prompt === 'string' ? JSON.parse(itinerary.prompt) : itinerary.prompt) : {};
  const budgetMax = promptData.budgetMax || 200000;
  const destinationLabel = itinerary.destinations?.[0] || itinerary.destination?.label || itinerary.destination || itinerary.title;

  return (
    <LandingLayout>
      <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-12 space-y-8 flex-grow">
        {/* Ticket Header Stub (Image 7 style) */}
        <div className="bg-white rounded-2xl border border-[#E5DED4] p-8 shadow-sm flex flex-col md:flex-row relative group">
          <div className="flex-[3] relative space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className={`text-[10px] px-3 py-1 rounded font-bold uppercase tracking-wider font-label-caps border ${isBooked ? 'bg-[#e6f4ea] text-[#006d35] border-[#3bc48a]/20' : 'bg-[#fff5e6] text-[#885200] border-[#ffa630]/20'}`}>
                  {isBooked ? 'Confirmed / Booked' : 'Pending Booking'}
                </span>
                <span className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">
                  {itinerary.durationDays || 3} DAYS IN {destinationLabel?.toUpperCase()}
                </span>
              </div>
              <div className="text-right">
                <span className="font-label-caps text-[9px] text-outline uppercase block mb-0.5">Date Range</span>
                <span className="font-semibold text-xs text-[#0B1226]">{new Date(itinerary.tripStartDate || itinerary.startDate || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>
            <div className="flex items-center gap-6 py-2">
              <div className="flex-1">
                <p className="font-display-lg text-2xl uppercase">{promptData.origin?.label?.split(',')[0] || 'Delhi'}</p>
                <p className="text-[10px] text-on-surface-variant font-label-caps uppercase">Origin</p>
              </div>
              <div className="flex-[2] flex flex-col items-center">
                <span className="material-symbols-outlined text-primary text-xl rotate-90">
                  {itinerary.days?.[0]?.travelSegments?.[0]?.mode === 'flight' ? 'flight' : 
                   itinerary.days?.[0]?.travelSegments?.[0]?.mode === 'train' ? 'train' : 
                   'directions_car'}
                </span>
                <div className="w-full h-px border-b border-dashed border-[#D1C7BD]"></div>
              </div>
              <div className="flex-1 text-right">
                <p className="font-display-lg text-2xl uppercase">{promptData.destination?.label?.split(',')[0] || destinationLabel?.split(',')[0] || 'Jaipur'}</p>
                <p className="text-[10px] text-on-surface-variant font-label-caps uppercase">Destination</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 border-t border-[#FAF6F0] pt-4">
              <div>
                <p className="font-label-caps text-[9px] text-outline uppercase">Total Spend</p>
                <p className="font-semibold text-sm text-[#0B1226]">₹{(itinerary.totalCost || 18000).toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="font-label-caps text-[9px] text-outline uppercase">Meals</p>
                <p className="font-semibold text-sm text-[#0B1226]">Included</p>
              </div>
              <div>
                <p className="font-label-caps text-[9px] text-outline uppercase">Days Planned</p>
                <p className="font-semibold text-sm text-[#0B1226]">{itinerary.days?.length || 3}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Book Ticket Section (Inline normal page flow, NO backdrop blur) */}
        {isBooked ? (
          <div className="bg-[#e6f4ea] rounded-2xl border-2 border-[#3bc48a]/30 p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 animate-fade-in">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#3bc48a]/20 flex items-center justify-center text-[#006d35] shrink-0">
                <span className="material-symbols-outlined text-2xl">verified</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-[#006d35] text-white px-2.5 py-0.5 rounded font-bold uppercase tracking-wider font-label-caps">
                    Confirmed Booking
                  </span>
                  <span className="text-xs text-on-surface-variant font-mono">
                    Ref #JRN-{(itinerary?._id || 'BOOKING').slice(-6).toUpperCase()}
                  </span>
                </div>
                <h4 className="font-bold text-base text-[#0B1226]">
                  Trip Tickets & Reservations Secured
                </h4>
                <p className="text-xs text-on-surface-variant">
                  Your flights, accommodations, and itinerary entries are booked and active in your traveler vault.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/my-trips')}
              className="bg-[#0B1226] text-white font-bold px-6 py-3 rounded-xl hover:brightness-110 active:scale-95 transition-all text-xs uppercase tracking-wider font-label-caps cursor-pointer shadow-sm whitespace-nowrap"
            >
              View in My Trips
            </button>
          </div>
        ) : !showPaymentModal ? (
          <div className="bg-white rounded-2xl border-2 border-[#ffa630] p-6 shadow-md flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="space-y-1">
              <h4 className="font-bold text-base text-[#0B1226] flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">local_activity</span>
                Complete Your Trip Ticket Booking
              </h4>
              <p className="text-xs text-on-surface-variant max-w-xl">
                Secure your flights/transits, reserve hotel stays, and purchase attraction entries in one unified transaction.
              </p>
            </div>
            <button
              onClick={() => {
                setPaymentStep('select');
                setShowPaymentModal(true);
              }}
              className="bg-[#ffa630] text-[#0B1226] font-bold px-6 py-3 rounded-xl hover:brightness-105 active:scale-95 transition-all shadow-sm text-xs uppercase tracking-wider font-label-caps cursor-pointer whitespace-nowrap flex items-center gap-2"
            >
              <span>Book Tickets Now • ₹{(itinerary.totalCost || 18000).toLocaleString('en-IN')}</span>
              <span className="material-symbols-outlined text-base">expand_more</span>
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border-2 border-[#ffa630] shadow-xl overflow-hidden transition-all animate-fade-in">
            {/* Header */}
            <div className="bg-[#FAF6F0] px-6 py-4 border-b border-[#E5DED4] flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#ffa630]/20 flex items-center justify-center text-[#ffa630]">
                  <span className="material-symbols-outlined text-xl">confirmation_number</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-label-caps text-[9px] text-[#006d35] bg-[#e6f4ea] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                      Instant Confirmation
                    </span>
                    <span className="text-[11px] text-on-surface-variant font-medium">
                      {promptData.origin?.label?.split(',')[0] || 'Origin'} ➔ {promptData.destination?.label?.split(',')[0] || destinationLabel?.split(',')[0] || 'Destination'}
                    </span>
                  </div>
                  <h3 className="font-display-lg text-lg text-[#0B1226] mt-0.5">Ticket Booking & Checkout</h3>
                </div>
              </div>
              <button 
                onClick={() => setShowPaymentModal(false)} 
                className="px-3.5 py-1.5 rounded-full bg-white border border-[#E5DED4] flex items-center gap-1.5 text-xs font-bold text-outline hover:text-[#0B1226] hover:bg-[#FAF6F0] transition-colors cursor-pointer"
                aria-label="Collapse checkout"
              >
                <span>Collapse</span>
                <span className="material-symbols-outlined text-sm">expand_less</span>
              </button>
            </div>
            
            {/* Step 1: Select payment method and input details */}
            {paymentStep === 'select' && (
              <div className="grid grid-cols-1 md:grid-cols-12">
                {/* Left Column: Boarding Pass & Trip Summary (5 cols) */}
                <div className="md:col-span-5 bg-[#FAF6F0] p-6 border-b md:border-b-0 md:border-r border-[#E5DED4] flex flex-col justify-between space-y-5">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-[10px] font-bold text-outline-variant font-label-caps uppercase">
                      <span>Trip Summary</span>
                      <span className="bg-white border border-[#E5DED4] px-2 py-0.5 rounded-full text-primary">
                        {itinerary.durationDays || itinerary.days?.length || 2} Days
                      </span>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-[#E5DED4] shadow-xs space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-[#0B1226]">
                        <span className="uppercase">{promptData.origin?.label?.split(',')[0] || 'Origin'}</span>
                        <span className="material-symbols-outlined text-sm text-[#ffa630] rotate-90">flight</span>
                        <span className="uppercase">{promptData.destination?.label?.split(',')[0] || destinationLabel?.split(',')[0] || 'Destination'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-on-surface-variant font-mono">
                        <span className="material-symbols-outlined text-xs text-outline">calendar_today</span>
                        <span>{new Date(itinerary.tripStartDate || itinerary.startDate || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>

                    {/* Features checklist */}
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center gap-2 text-xs font-medium text-[#0B1226]">
                        <span className="material-symbols-outlined text-sm text-[#006d35]">check_circle</span>
                        <span>Round-trip Flight Passes</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-medium text-[#0B1226]">
                        <span className="material-symbols-outlined text-sm text-[#006d35]">check_circle</span>
                        <span>Hotel Accommodations (Reserved)</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-medium text-[#0B1226]">
                        <span className="material-symbols-outlined text-sm text-[#006d35]">check_circle</span>
                        <span>Curated Sightseeing & Landmark Entries</span>
                      </div>
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div className="border-t border-[#E5DED4] pt-4 space-y-2">
                    <div className="flex justify-between text-[11px] text-on-surface-variant">
                      <span>Transit Fare</span>
                      <span className="font-semibold text-[#0B1226]">₹{Math.round((itinerary.totalCost || 18000) * 0.45).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-on-surface-variant">
                      <span>Hotel Accommodations</span>
                      <span className="font-semibold text-[#0B1226]">₹{Math.round((itinerary.totalCost || 18000) * 0.40).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-on-surface-variant">
                      <span>Activities & Sightseeing</span>
                      <span className="font-semibold text-[#0B1226]">₹{Math.round((itinerary.totalCost || 18000) * 0.15).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-[#006d35]">
                      <span>Booking & Gateway Fee</span>
                      <span className="font-bold uppercase tracking-wider font-label-caps">Free</span>
                    </div>

                    <div className="pt-3 border-t border-[#E5DED4] flex justify-between items-baseline">
                      <span className="font-label-caps text-xs text-outline uppercase font-bold">Total Payable</span>
                      <span className="font-display-lg text-2xl font-extrabold text-[#0B1226]">
                        ₹{(itinerary.totalCost || 18000).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-outline-variant pt-2">
                      <span className="material-symbols-outlined text-xs text-[#006d35]">lock</span>
                      <span>256-Bit SSL Encrypted Banking Corridor</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Payment Options & Form (7 cols) */}
                <div className="md:col-span-7 p-6 flex flex-col justify-between space-y-5">
                  <div className="space-y-4">
                    <div>
                      <span className="font-label-caps text-[10px] text-outline uppercase tracking-wider block mb-2 font-bold">
                        Choose Payment Method
                      </span>
                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('upi')}
                          className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                            paymentMethod === 'upi' 
                              ? 'border-[#0B1226] bg-[#0B1226] text-white shadow-md' 
                              : 'border-[#E5DED4] bg-white text-[#0B1226] hover:bg-[#FAF6F0]'
                          }`}
                        >
                          <span className="material-symbols-outlined text-xl mt-0.5 text-[#ffa630]">account_balance_wallet</span>
                          <div>
                            <p className="text-xs font-bold leading-tight">UPI Payment</p>
                            <p className={`text-[10px] mt-0.5 ${paymentMethod === 'upi' ? 'text-white/80' : 'text-on-surface-variant'}`}>
                              GPay, PhonePe, Paytm
                            </p>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod('card')}
                          className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                            paymentMethod === 'card' 
                              ? 'border-[#0B1226] bg-[#0B1226] text-white shadow-md' 
                              : 'border-[#E5DED4] bg-white text-[#0B1226] hover:bg-[#FAF6F0]'
                          }`}
                        >
                          <span className="material-symbols-outlined text-xl mt-0.5 text-[#ffa630]">credit_card</span>
                          <div>
                            <p className="text-xs font-bold leading-tight">Card Payment</p>
                            <p className={`text-[10px] mt-0.5 ${paymentMethod === 'card' ? 'text-white/80' : 'text-on-surface-variant'}`}>
                              Visa, Mastercard, RuPay
                            </p>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Payment Inputs */}
                    {paymentMethod === 'upi' ? (
                      <div className="space-y-3.5">
                        <div className="grid grid-cols-2 bg-[#FAF6F0] p-1 rounded-xl border border-[#E5DED4]">
                          <button
                            type="button"
                            onClick={() => setUpiSubMethod('id')}
                            className={`py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg cursor-pointer transition-all ${
                              upiSubMethod === 'id' ? 'bg-[#0B1226] text-white shadow-sm' : 'bg-transparent text-outline hover:text-[#0B1226]'
                            }`}
                          >
                            UPI ID Request
                          </button>
                          <button
                            type="button"
                            onClick={() => setUpiSubMethod('qr')}
                            className={`py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg cursor-pointer transition-all ${
                              upiSubMethod === 'qr' ? 'bg-[#0B1226] text-white shadow-sm' : 'bg-transparent text-outline hover:text-[#0B1226]'
                            }`}
                          >
                            Scan Instant QR
                          </button>
                        </div>

                        {upiSubMethod === 'id' ? (
                          <div className="space-y-2.5 animate-fade-in">
                            <label className="font-label-caps text-[10px] text-outline uppercase tracking-wider font-bold">
                              Enter Your Virtual Payment Address (UPI ID)
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. aditya@oksbi"
                              value={upiId}
                              onChange={(e) => setUpiId(e.target.value)}
                              className="w-full h-11 px-4 rounded-xl border border-[#D1C7BD] bg-white focus:border-primary transition-all outline-none text-sm font-semibold text-[#0B1226]"
                            />
                            {/* Quick handle suggestions */}
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                              <span className="text-[10px] text-outline">Quick handles:</span>
                              {['@oksbi', '@okhdfcbank', '@paytm', '@ybl'].map((handle) => (
                                <button
                                  key={handle}
                                  type="button"
                                  onClick={() => {
                                    const base = upiId.split('@')[0] || 'yourname';
                                    setUpiId(`${base}${handle}`);
                                  }}
                                  className="text-[10px] bg-[#FAF6F0] hover:bg-[#E5DED4] text-[#0B1226] font-mono px-2 py-0.5 rounded border border-[#E5DED4] cursor-pointer transition-colors"
                                >
                                  {handle}
                                </button>
                              ))}
                            </div>
                            <p className="text-[10px] text-on-surface-variant italic">
                              A collect request will be sent directly to your UPI mobile app.
                            </p>
                          </div>
                        ) : (
                          <div className="flex items-center gap-4 bg-[#FAF6F0] p-4 rounded-2xl border border-[#E5DED4] animate-fade-in">
                            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-primary flex-shrink-0 shadow-xs border border-[#E5DED4]">
                              <span className="material-symbols-outlined text-2xl">qr_code_2</span>
                            </div>
                            <div className="text-xs text-on-surface-variant leading-relaxed">
                              <p className="font-bold text-[#0B1226]">Dynamic QR Code on Next Screen</p>
                              <p className="text-[11px] mt-0.5">
                                A verified QR code linked to <strong>dhruvikparmar26@oksbi</strong> with auto-expiration will be displayed.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3.5 animate-fade-in pt-1">
                        <div className="flex flex-col gap-1">
                          <label className="font-label-caps text-[10px] text-outline uppercase tracking-wider font-bold">Card Number</label>
                          <input
                            type="text"
                            placeholder="xxxx xxxx xxxx xxxx"
                            maxLength={19}
                            value={cardNumber}
                            onChange={(e) => {
                              const v = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
                              setCardNumber(v);
                            }}
                            className="w-full h-11 px-4 rounded-xl border border-[#D1C7BD] bg-white focus:border-primary transition-all outline-none text-sm font-semibold text-[#0B1226] font-mono"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1">
                            <label className="font-label-caps text-[10px] text-outline uppercase tracking-wider font-bold">Expiry (MM/YY)</label>
                            <input
                              type="text"
                              placeholder="MM/YY"
                              maxLength={5}
                              value={cardExpiry}
                              onChange={(e) => {
                                let v = e.target.value.replace(/\D/g, '').slice(0, 4);
                                if (v.length >= 2) v = `${v.slice(0, 2)}/${v.slice(2)}`;
                                setCardExpiry(v);
                              }}
                              className="w-full h-11 px-4 rounded-xl border border-[#D1C7BD] bg-white focus:border-primary transition-all outline-none text-sm font-semibold text-[#0B1226] font-mono"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="font-label-caps text-[10px] text-outline uppercase tracking-wider font-bold">CVV Code</label>
                            <input
                              type="password"
                              placeholder="•••"
                              maxLength={3}
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                              className="w-full h-11 px-4 rounded-xl border border-[#D1C7BD] bg-white focus:border-primary transition-all outline-none text-sm font-semibold text-[#0B1226] font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="pt-4 border-t border-[#E5DED4] flex justify-end items-center gap-3">
                    <button
                      onClick={() => setShowPaymentModal(false)}
                      className="bg-white border border-[#D1C7BD] text-[#0B1226] font-bold px-5 py-2.5 rounded-xl hover:bg-[#FAF6F0] text-xs uppercase tracking-wider font-label-caps cursor-pointer transition-colors"
                    >
                      Collapse
                    </button>
                    <button
                      onClick={async () => {
                        if (paymentMethod === 'upi' && upiSubMethod === 'id' && !upiId.includes('@')) {
                          showErrorToast('Please enter a valid UPI ID (e.g. yourname@oksbi)');
                          return;
                        }
                        if (paymentMethod === 'card' && (cardNumber.length < 15 || !cardExpiry || cardCvv.length < 3)) {
                          showErrorToast('Please enter valid Card details');
                          return;
                        }
                        
                        if (paymentMethod === 'upi') {
                          if (upiSubMethod === 'id') {
                            setPaymentStep('collect');
                          } else {
                            setPaymentStep('qrcode');
                          }
                        } else {
                          await handleProcessPayment();
                        }
                      }}
                      className="bg-[#ffa630] text-[#0B1226] font-bold px-6 py-2.5 rounded-xl hover:brightness-105 active:scale-95 transition-all text-xs uppercase tracking-wider font-label-caps cursor-pointer shadow-md flex items-center gap-1.5"
                    >
                      <span>Pay & Book Tickets</span>
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Step 1.4: UPI Collect Request Screen */}
            {paymentStep === 'collect' && (
              <div className="p-8 max-w-lg mx-auto w-full flex flex-col items-center justify-center space-y-6 text-center animate-fade-in">
                <div className="w-16 h-16 rounded-2xl bg-[#ffa630]/15 flex items-center justify-center text-[#ffa630] animate-pulse">
                  <span className="material-symbols-outlined text-3xl">sms</span>
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-display-lg text-lg text-[#0B1226]">Collect Request Sent!</h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed max-w-sm">
                    We have dispatched a secure collect request of <strong className="text-[#0B1226]">₹{(itinerary?.totalCost || 18000).toLocaleString('en-IN')}</strong> to your VPA: <strong className="text-primary font-mono">{upiId}</strong>.
                  </p>
                </div>

                <div className="w-full bg-[#FAF6F0] p-5 rounded-2xl border border-[#E5DED4] text-xs space-y-2 text-left">
                  <p className="font-bold text-[#0B1226] uppercase font-label-caps text-[10px] tracking-wider">How to Complete Payment:</p>
                  <ol className="list-decimal pl-4 space-y-1 text-on-surface-variant leading-relaxed">
                    <li>Open your UPI App (Google Pay, PhonePe, Paytm, or BHIM).</li>
                    <li>Look for the notification or pending approval banner.</li>
                    <li>Approve the request of ₹{(itinerary?.totalCost || 18000).toLocaleString('en-IN')} from <strong>dhruvikparmar26@oksbi</strong>.</li>
                  </ol>
                </div>

                <div className="text-xs font-semibold text-outline">
                  Request active for <span className="font-mono text-primary font-bold">{formatTime(qrSeconds)}</span>
                </div>

                <div className="w-full flex justify-between items-center gap-3 pt-2">
                  <button
                    onClick={() => setPaymentStep('select')}
                    className="bg-white border border-[#D1C7BD] text-[#0B1226] font-bold px-5 py-2.5 rounded-xl hover:bg-[#FAF6F0] text-xs uppercase tracking-wider font-label-caps cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => handleProcessPayment()}
                    className="bg-[#ffa630] text-[#0B1226] font-bold px-6 py-2.5 rounded-xl hover:brightness-105 active:scale-95 transition-all text-xs uppercase tracking-wider font-label-caps cursor-pointer flex-grow flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <span className="material-symbols-outlined text-base">verified</span>
                    <span>Verify & Confirm Booking</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 1.5: QR Code Screen */}
            {paymentStep === 'qrcode' && (
              <div className="p-8 max-w-lg mx-auto w-full flex flex-col items-center space-y-5 text-center animate-fade-in">
                <div className="w-full flex justify-between items-center bg-[#FAF6F0] px-4 py-2.5 rounded-xl border border-[#E5DED4] text-xs font-semibold text-[#0B1226]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                    Scan with Any UPI App
                  </span>
                  <span className="font-mono text-primary font-bold">{formatTime(qrSeconds)} remaining</span>
                </div>

                {/* QR Image Container */}
                <div className="bg-white p-4 rounded-3xl border-2 border-primary/20 shadow-lg inline-block">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200&margin=5&data=${encodeURIComponent(
                      `upi://pay?pa=dhruvikparmar26@oksbi&pn=Journeys%20Travel&am=${itinerary?.totalCost || 18000}&tn=Booking%20for%20${encodeURIComponent(
                        itinerary?.destinations?.[0] || itinerary?.destination?.label || itinerary?.destination || itinerary?.title || 'Trip'
                      )}&cu=INR`
                    )}`} 
                    alt="UPI QR Code" 
                    className="w-[200px] h-[200px] object-contain rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <p className="font-display-lg text-xl font-bold text-[#0B1226]">
                    ₹{(itinerary?.totalCost || 18000).toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-on-surface-variant">Google Pay • PhonePe • Paytm • BHIM • Any Bank UPI</p>
                  <p className="text-[11px] font-mono text-outline pt-1">UPI ID: dhruvikparmar26@oksbi</p>
                </div>

                <div className="w-full flex justify-between items-center gap-3 pt-2">
                  <button
                    onClick={() => setPaymentStep('select')}
                    className="bg-white border border-[#D1C7BD] text-[#0B1226] font-bold px-5 py-2.5 rounded-xl hover:bg-[#FAF6F0] text-xs uppercase tracking-wider font-label-caps cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => handleProcessPayment()}
                    className="bg-[#ffa630] text-[#0B1226] font-bold px-6 py-2.5 rounded-xl hover:brightness-105 active:scale-95 transition-all text-xs uppercase tracking-wider font-label-caps cursor-pointer flex-grow flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <span className="material-symbols-outlined text-base">verified</span>
                    <span>Confirm Payment</span>
                  </button>
                </div>
              </div>
            )}
            
            {/* Step 2: Processing Payment Spinner */}
            {paymentStep === 'processing' && (
              <div className="p-16 text-center flex flex-col items-center justify-center space-y-6">
                <span className="w-14 h-14 border-4 border-[#ffa630] border-t-transparent rounded-full animate-spin"></span>
                <div className="space-y-1.5">
                  <h4 className="font-display-lg text-lg text-[#0B1226]">Securing Your Reservations...</h4>
                  <p className="text-xs text-on-surface-variant max-w-sm">
                    Connecting to banking corridors and reserving your transit seats and hotel rooms. Please do not close this window.
                  </p>
                </div>
              </div>
            )}
            
            {/* Step 3: Success checkmark */}
            {paymentStep === 'success' && (
              <div className="p-10 max-w-md mx-auto w-full text-center flex flex-col items-center justify-center space-y-6 animate-scale-up">
                <div className="w-16 h-16 rounded-full bg-[#e6f4ea] border border-[#3bc48a]/30 flex items-center justify-center text-[#006d35] shadow-sm">
                  <span className="material-symbols-outlined text-4xl">check_circle</span>
                </div>
                
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest font-label-caps bg-[#e6f4ea] text-[#006d35] px-3 py-1 rounded-full">
                    Confirmed • Ref #JRN-{(itinerary?._id || 'BOOKING').slice(-6).toUpperCase()}
                  </span>
                  <h3 className="font-display-lg text-2xl text-[#0B1226]">Booking Confirmed!</h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed max-w-xs mx-auto">
                    Your tickets, hotel voucher, and day-by-day boarding pass have been verified and saved to your traveler vault.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setIsBooked(true);
                    setShowPaymentModal(false);
                  }}
                  className="bg-[#0B1226] text-white font-bold px-8 py-3.5 rounded-xl hover:brightness-110 active:scale-95 transition-all text-xs uppercase tracking-wider font-label-caps cursor-pointer w-full shadow-md"
                >
                  Done & View Boarding Pass
                </button>
              </div>
            )}
          </div>
        )}

        {/* Pink conflict alert box (Image 7 style) */}
        <div className="p-5 bg-[#fce8e6] border border-[#ba1a1a]/20 text-[#ba1a1a] rounded-2xl space-y-2">
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider font-label-caps">
            <span className="material-symbols-outlined text-sm">warning</span>
            HEADS UP — A FEW CONFLICTS TO REVIEW
          </div>
          <ul className="text-xs list-disc list-inside space-y-1 text-[#ba1a1a]/80 pl-2 leading-relaxed">
            <li>Check-in at {destinationLabel?.split(',')[0]} Hotel is scheduled after your first day tour begins.</li>
            <li>Local festival traffic warnings reported for Day 2 monument circuits.</li>
          </ul>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap gap-3 items-center justify-between border-b border-[#E5DED4] pb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#ffa630] text-[#0B1226] font-bold px-6 py-2.5 rounded-lg hover:brightness-105 active:scale-95 transition-all shadow-sm text-xs uppercase tracking-wider font-label-caps cursor-pointer"
            >
              {saving ? 'Saving...' : 'Save this trip'}
            </button>
            <button
              onClick={handleShare}
              disabled={sharing}
              className="bg-white border border-[#D1C7BD] text-[#0B1226] font-bold px-6 py-2.5 rounded-lg hover:bg-[#FAF6F0] active:scale-95 transition-all shadow-sm text-xs uppercase tracking-wider font-label-caps cursor-pointer"
            >
              {sharing ? 'Sharing...' : 'Share itinerary'}
            </button>
            <button
              onClick={() => navigate(`/packing-list/${itinerary._id}`)}
              className="bg-white border border-[#D1C7BD] text-[#0B1226] font-bold px-6 py-2.5 rounded-lg hover:bg-[#FAF6F0] active:scale-95 transition-all shadow-sm text-xs uppercase tracking-wider font-label-caps cursor-pointer"
            >
              Get Packing List
            </button>
            <button
              onClick={() => navigate(`/group-trip/${itinerary._id}`)}
              className="bg-white border border-[#D1C7BD] text-[#0B1226] font-bold px-6 py-2.5 rounded-lg hover:bg-[#FAF6F0] active:scale-95 transition-all shadow-sm text-xs uppercase tracking-wider font-label-caps cursor-pointer animate-pulse"
            >
              Plan with crew
            </button>
            <button
              onClick={handleSendDetails}
              disabled={sendingReport}
              className="bg-white border border-[#D1C7BD] text-[#0B1226] font-bold px-6 py-2.5 rounded-lg hover:bg-[#FAF6F0] active:scale-95 transition-all shadow-sm text-xs uppercase tracking-wider font-label-caps cursor-pointer"
            >
              {sendingReport ? 'Sending...' : 'Send details to me'}
            </button>
          </div>
          <div>
            <Link 
              to={`/reviews/${itinerary._id}`}
              className="text-xs font-bold text-primary hover:underline uppercase tracking-wider font-label-caps flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">rate_review</span>
              Leave a Review
            </Link>
          </div>
        </div>

        {shareUrl && (
          <div className="p-4 bg-white rounded-xl border border-[#E5DED4] flex items-center justify-between gap-4 max-w-xl">
            <span className="text-xs font-mono text-[#006d35] select-all truncate">{shareUrl}</span>
            <button onClick={copyShareUrl} className="bg-[#0B1226] text-white px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer">
              Copy URL
            </button>
          </div>
        )}

        {/* Content Split Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
          {/* Day by Day List */}
          <div className="lg:col-span-8 space-y-6">
            <h3 className="font-headline-md text-xl text-[#0B1226] border-b border-[#E5DED4] pb-4">Day by day</h3>
            {itinerary.days?.map((day, index) => (
              <div key={day._id || index} id={`day-${day.dayNumber}`} className="relative pl-8">
                {/* Visual timeline dotted line */}
                {index < (itinerary.days?.length || 0) - 1 && (
                  <div className="absolute left-3.5 top-8 bottom-0 w-px border-l-2 border-dashed border-[#D1C7BD] -ml-[1px]" />
                )}

                {/* Day circle bullet */}
                <div className="absolute left-0 top-0 w-7 h-7 rounded-full bg-[#ffa630] border-2 border-white flex items-center justify-center text-[10px] font-bold text-[#0B1226] shadow-sm">
                  {day.dayNumber}
                </div>

                <div className="space-y-4">
                  <h4 className="font-display-lg text-lg text-[#0B1226] pt-0.5">
                    Day {day.dayNumber} — {day.title || 'Sightseeing'}
                  </h4>

                  {/* Hotels */}
                  {day.locations?.filter(loc => loc.type === 'hotel').map((hotel, hIndex) => (
                    <div 
                      key={hIndex} 
                      onClick={() => handleOpenPlaceDetails({
                        name: hotel.name,
                        type: 'hotel',
                        description: hotel.notes || 'A beautiful, premium stay option curated by our AI travel assistant.',
                        rating: '4.8 ★',
                        details: 'Features luxury rooms, outstanding hospitality, dining options, and close proximity to key landmarks.',
                        reviews: [
                          'Absolutely loved the stay! The service was top notch.',
                          'Excellent location and very clean rooms. Highly recommended.'
                        ]
                      })}
                      className="bg-white rounded-xl p-5 border border-[#E5DED4] shadow-sm flex items-start gap-4 hover:border-primary cursor-pointer hover:shadow-md transition-all"
                    >
                      <div className="w-12 h-12 rounded-lg bg-[#FAF6F0] flex items-center justify-center text-[#ffa630] flex-shrink-0">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>hotel</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <h5 className="font-bold text-sm text-[#0B1226]">{hotel.name}</h5>
                          <span className="text-[10px] font-bold bg-[#e6f4ea] text-[#006d35] border border-[#3bc48a]/20 px-2 py-0.5 rounded font-label-caps">9.4/10</span>
                        </div>
                        <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{hotel.notes || 'Luxury local stays.'}</p>
                        <div className="flex gap-2 mt-3 text-[9px] font-bold uppercase tracking-wider font-label-caps text-outline-variant">
                          <span className="bg-[#FAF6F0] border border-[#E5DED4] px-2 py-0.5 rounded">Boutique</span>
                          <span className="bg-[#FAF6F0] border border-[#E5DED4] px-2 py-0.5 rounded">Historic</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Activities */}
                  {day.activities?.map((act, aIndex) => (
                    <div 
                      key={aIndex} 
                      onClick={() => handleOpenPlaceDetails({
                        name: act.description,
                        type: 'activity',
                        time: act.time || '10:00 AM',
                        description: act.notes || 'A curated local activity to explore the heritage and culture of the region.',
                        details: 'We recommend starting early. Bring comfortable walking shoes, a camera, and stay hydrated!',
                        rating: '4.7 ★',
                        reviews: [
                          'A must-visit spot. Super rich history and very beautiful!',
                          'Great experience. Guided tour is recommended.'
                        ]
                      })}
                      className="bg-white rounded-xl p-5 border border-[#E5DED4] shadow-sm flex items-start gap-4 hover:border-primary cursor-pointer hover:shadow-md transition-all"
                    >
                      <div className="w-12 h-12 rounded-lg bg-[#FAF6F0] flex items-center justify-center text-primary flex-shrink-0">
                        <span className="material-symbols-outlined">explore</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-outline-variant font-mono uppercase">{act.time || '10:00 AM'}</span>
                          <span className="text-[9px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.2 rounded font-bold uppercase tracking-wider font-label-caps">Activity</span>
                        </div>
                        <h5 className="font-bold text-sm text-[#0B1226] mt-2">{act.description}</h5>
                        <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{act.notes}</p>
                      </div>
                    </div>
                  ))}

                  {/* Travel Segments (Transit / Transport) */}
                  {day.travelSegments?.map((seg, sIndex) => (
                    <div key={sIndex} className="bg-white rounded-xl p-5 border border-[#E5DED4] shadow-sm flex items-start gap-4 hover:border-primary-container transition-colors">
                      <div className="w-12 h-12 rounded-lg bg-[#FAF6F0] flex items-center justify-center text-primary flex-shrink-0 animate-pulse">
                        <span className="material-symbols-outlined">
                          {seg.mode === 'flight' ? 'flight' : seg.mode === 'train' ? 'train' : 'directions_car'}
                        </span>
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.2 rounded font-bold uppercase tracking-wider font-label-caps">Transit</span>
                          <span className="text-[10px] font-bold bg-[#ffa630]/20 text-[#6b4000] px-2 py-0.5 rounded uppercase tracking-wider font-label-caps">{seg.mode.toUpperCase()}</span>
                        </div>
                        <h5 className="font-bold text-sm text-[#0B1226] mt-2">
                          Travel from {seg.from?.split(',')[0]} to {seg.to?.split(',')[0]}
                        </h5>
                        <div className="flex gap-4 mt-3 text-xs text-outline font-semibold">
                          <span>⏱️ {seg.durationMinutes ? `${Math.floor(seg.durationMinutes / 60)}h ${seg.durationMinutes % 60}m` : '2h 10m'}</span>
                          <span>📏 {seg.distanceKm} km</span>
                          <span className="text-[#0B1226] font-bold">💰 ₹{seg.cost?.toLocaleString('en-IN') || '4,500'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Stays Suggestions & Maps */}
          <div className="lg:col-span-4 space-y-6">
            <h3 className="font-headline-md text-xl text-[#0B1226] border-b border-[#E5DED4] pb-4">Suggested stays</h3>
            
            <div className="space-y-4">
              {/* Hotel 1 */}
              <div className="bg-white border border-[#E5DED4] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <img 
                  src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80" 
                  alt="hotel stays" 
                  className="w-full h-40 object-cover" 
                />
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-[#0B1226]">The Oberoi Rajvilas</h4>
                    <span className="text-[9px] font-bold text-[#ffa630]">★★★★★</span>
                  </div>
                  <p className="text-xs text-on-surface-variant">4.9 ★ • ₹52,500/night</p>
                  <a href="#" className="text-xs font-bold text-primary hover:underline uppercase tracking-wider font-label-caps block pt-2">View Details →</a>
                </div>
              </div>

              {/* Hotel 2 */}
              <div className="bg-white border border-[#E5DED4] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <img 
                  src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=400&q=80" 
                  alt="hotel stays" 
                  className="w-full h-40 object-cover" 
                />
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-[#0B1226]">ITC Rajputana</h4>
                    <span className="text-[9px] font-bold text-[#ffa630]">★★★★★</span>
                  </div>
                  <p className="text-xs text-on-surface-variant">4.7 ★ • ₹9,000/night</p>
                  <a href="#" className="text-xs font-bold text-primary hover:underline uppercase tracking-wider font-label-caps block pt-2">View Details →</a>
                </div>
              </div>

              {/* Custom maps promo block */}
              <div className="bg-[#885200] text-white p-6 rounded-2xl shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-2xl text-[#ffa630]">map</span>
                  <h4 className="font-bold text-xs uppercase tracking-wider font-label-caps">Want a custom map?</h4>
                </div>
                <p className="text-xs text-white/80 leading-relaxed">
                  We can create a physical print of your journey to keep forever. Frame your travel memory corridor.
                </p>
                <button className="bg-white text-[#0B1226] text-[10px] font-bold uppercase tracking-wider px-4 py-2 rounded-full hover:bg-[#FAF6F0] transition-colors cursor-pointer font-label-caps shadow-sm">
                  Order Print
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Place Details Modal (zero blur) */}
      {selectedPlace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1226]/25 animate-fade-in p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-[#E5DED4] shadow-2xl overflow-hidden flex flex-col relative animate-scale-up">
            {/* Header */}
            <div className="bg-[#FAF6F0] p-6 border-b border-[#E5DED4] flex justify-between items-start">
              <div>
                <span className="text-[9px] bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider font-label-caps block w-max mb-2">
                  {selectedPlace.type.toUpperCase()}
                </span>
                <h3 className="font-display-lg text-lg text-[#0B1226] leading-snug">{selectedPlace.name}</h3>
              </div>
              <button 
                onClick={() => setSelectedPlace(null)}
                className="text-outline hover:text-[#0B1226] cursor-pointer flex items-center"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6 space-y-4 overflow-y-auto max-h-[60vh]">
              {selectedPlace.type === 'activity' && (
                <div className="flex gap-4 text-xs font-semibold text-outline pb-2">
                  <span>⏱️ Scheduled Time: {selectedPlace.time}</span>
                  <span>⭐ Rating: {selectedPlace.rating}</span>
                </div>
              )}
              {selectedPlace.type === 'hotel' && (
                <div className="flex gap-4 text-xs font-semibold text-outline pb-2">
                  <span>⭐ Rating: {selectedPlace.rating}</span>
                  <span>🛌 Stay Type: Luxury</span>
                </div>
              )}
              
              <div className="space-y-1.5">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#0B1226]">Description</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">{selectedPlace.description}</p>
              </div>

              <div className="space-y-1.5 bg-[#FAF6F0] p-4 rounded-xl border border-[#E5DED4]">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#885200]">Travel Tip</h4>
                <p className="text-xs text-[#6b4000] leading-relaxed">{selectedPlace.details}</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#0B1226]">Guest Reviews</h4>
                <div className="space-y-2">
                  {selectedPlace.reviews.map((r, i) => (
                    <div key={i} className="text-xs bg-[#FAF6F0]/40 p-3 rounded-lg border border-[#FAF6F0] italic text-on-surface-variant">
                      "{r}"
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="bg-[#FAF6F0]/50 p-4 border-t border-[#E5DED4] flex justify-end">
              <button
                onClick={() => setSelectedPlace(null)}
                className="bg-[#0B1226] text-white font-bold px-6 py-2 rounded-lg hover:brightness-110 text-xs uppercase tracking-wider font-label-caps cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

    </LandingLayout>
  );
};

export default ItineraryResultsPage;
