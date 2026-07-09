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

/**
 * ItineraryResultsPage Component
 * 
 * Displays the complete itinerary inside LandingLayout.
 */
const ItineraryResultsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
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

  const fetchItinerary = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get(`/itineraries/${id}`);
      setItinerary(data);
      setIsBooked(data.status === 'booked');
      if (data.days && data.days.length > 0) {
        setSelectedDay(data.days[0]);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to fetch itinerary.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItinerary();
  }, [id]);

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

  if (loading) {
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
          <ErrorState title="Access Error" message={error} onRetry={fetchItinerary} />
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

        {/* Book Ticket Callout Banner */}
        {!isBooked && (
          <div className="bg-white rounded-2xl border border-[#ffa630] p-6 shadow-md flex flex-col md:flex-row justify-between items-center gap-6">
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
              className="bg-[#ffa630] text-[#0B1226] font-bold px-6 py-3 rounded-xl hover:brightness-105 active:scale-95 transition-all shadow-sm text-xs uppercase tracking-wider font-label-caps cursor-pointer whitespace-nowrap"
            >
              Book Tickets Now • ₹{(itinerary.totalCost || 18000).toLocaleString('en-IN')}
            </button>
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

      {/* Place Details Modal (Image 9 click detail) */}
      {selectedPlace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
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

      {/* Payment and Ticket Booking Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#E5DED4] shadow-2xl overflow-hidden flex flex-col relative animate-scale-up">
            
            {/* Step 1: Select payment method and input details */}
            {paymentStep === 'select' && (
              <>
                <div className="bg-[#FAF6F0] p-6 border-b border-[#E5DED4] flex justify-between items-center">
                  <h3 className="font-display-lg text-lg text-[#0B1226]">Ticket Booking checkout</h3>
                  <button onClick={() => setShowPaymentModal(false)} className="text-outline hover:text-[#0B1226] cursor-pointer flex items-center">
                    <span className="material-symbols-outlined text-xl">close</span>
                  </button>
                </div>
                
                <div className="p-6 space-y-6">
                  <div className="bg-[#FAF6F0] p-4 rounded-xl border border-[#E5DED4]">
                    <span className="font-label-caps text-[9px] text-outline uppercase block mb-1">Total Travel Cost</span>
                    <span className="font-display-lg text-2xl font-bold text-primary">₹{(itinerary.totalCost || 18000).toLocaleString('en-IN')}</span>
                  </div>
                  
                  {/* Tabs */}
                  <div className="flex border border-[#E5DED4] rounded-xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('upi')}
                      className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider font-label-caps cursor-pointer border-r border-[#E5DED4] transition-colors ${paymentMethod === 'upi' ? 'bg-[#0B1226] text-white' : 'bg-white text-on-surface-variant hover:bg-[#FAF6F0]'}`}
                    >
                      UPI ID
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider font-label-caps cursor-pointer transition-colors ${paymentMethod === 'card' ? 'bg-[#0B1226] text-white' : 'bg-white text-on-surface-variant hover:bg-[#FAF6F0]'}`}
                    >
                      Credit/Debit Card
                    </button>
                  </div>
                  
                  {paymentMethod === 'upi' ? (
                    <div className="space-y-4">
                      {/* Sub-selector for UPI mode */}
                      <div className="grid grid-cols-2 gap-2 p-1 bg-[#FAF6F0] rounded-xl border border-[#E5DED4]">
                        <button
                          type="button"
                          onClick={() => setUpiSubMethod('id')}
                          className={`py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg cursor-pointer transition-colors ${upiSubMethod === 'id' ? 'bg-[#0B1226] text-white' : 'bg-transparent text-outline hover:text-[#0B1226]'}`}
                        >
                          UPI ID Request
                        </button>
                        <button
                          type="button"
                          onClick={() => setUpiSubMethod('qr')}
                          className={`py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg cursor-pointer transition-colors ${upiSubMethod === 'qr' ? 'bg-[#0B1226] text-white' : 'bg-transparent text-outline hover:text-[#0B1226]'}`}
                        >
                          Scan QR Code
                        </button>
                      </div>

                      {upiSubMethod === 'id' ? (
                        <div className="flex flex-col gap-1.5 animate-fade-in">
                          <label className="font-label-caps text-[10px] text-outline uppercase tracking-wider">Enter UPI ID</label>
                          <input
                            type="text"
                            placeholder="e.g. aditya@upi"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            className="w-full h-12 px-4 rounded-xl border border-[#D1C7BD] bg-white focus:border-primary transition-all outline-none text-sm font-semibold text-[#0B1226]"
                          />
                          <p className="text-[10px] text-on-surface-variant italic">A collect request will be sent to this ID.</p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-4 bg-[#FAF6F0] p-4 rounded-xl border border-[#E5DED4] animate-fade-in">
                          <span className="material-symbols-outlined text-3xl text-outline">qr_code_2</span>
                          <div className="text-[11px] text-on-surface-variant leading-relaxed">
                            <p className="font-bold text-[#0B1226]">Scan QR Code on next step</p>
                            <p>We will show a real dynamic QR Code linked to UPI ID: <strong>dhruvikparmar26@oksbi</strong>.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="font-label-caps text-[10px] text-outline uppercase tracking-wider">Card Number</label>
                        <input
                          type="text"
                          placeholder="xxxx xxxx xxxx xxxx"
                          maxLength={19}
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full h-12 px-4 rounded-xl border border-[#D1C7BD] bg-white focus:border-primary transition-all outline-none text-sm font-semibold text-[#0B1226]"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="font-label-caps text-[10px] text-outline uppercase tracking-wider">Expiry Date</label>
                          <input
                            type="text"
                            placeholder="MM/YY"
                            maxLength={5}
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="w-full h-12 px-4 rounded-xl border border-[#D1C7BD] bg-white focus:border-primary transition-all outline-none text-sm font-semibold text-[#0B1226]"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="font-label-caps text-[10px] text-outline uppercase tracking-wider">CVV</label>
                          <input
                            type="password"
                            placeholder="•••"
                            maxLength={3}
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            className="w-full h-12 px-4 rounded-xl border border-[#D1C7BD] bg-white focus:border-primary transition-all outline-none text-sm font-semibold text-[#0B1226]"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="bg-[#FAF6F0]/50 p-4 border-t border-[#E5DED4] flex justify-end gap-3">
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="bg-white border border-[#D1C7BD] text-[#0B1226] font-bold px-6 py-2.5 rounded-lg hover:bg-[#FAF6F0] text-xs uppercase tracking-wider font-label-caps cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      if (paymentMethod === 'upi' && upiSubMethod === 'id' && !upiId.includes('@')) {
                        showErrorToast('Please enter a valid UPI ID');
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
                    className="bg-[#ffa630] text-[#0B1226] font-bold px-6 py-2.5 rounded-lg hover:brightness-105 active:scale-95 transition-all text-xs uppercase tracking-wider font-label-caps cursor-pointer"
                  >
                    Pay & Book Tickets
                  </button>
                </div>
              </>
            )}
            
            {/* Step 1.5: QR Code Screen */}
            {/* Step 1.4: UPI Collect Request Screen */}
            {paymentStep === 'collect' && (
              <>
                <div className="bg-[#FAF6F0] p-6 border-b border-[#E5DED4] flex justify-between items-center">
                  <h3 className="font-display-lg text-lg text-[#0B1226]">UPI Request Sent</h3>
                  <button onClick={() => setShowPaymentModal(false)} className="text-outline hover:text-[#0B1226] cursor-pointer flex items-center">
                    <span className="material-symbols-outlined text-xl">close</span>
                  </button>
                </div>
                
                <div className="p-6 flex flex-col items-center justify-center space-y-6 text-center">
                  {/* Status Indicator */}
                  <div className="w-16 h-16 rounded-full bg-[#ffa630]/10 border border-[#ffa630]/20 flex items-center justify-center text-[#ffa630] animate-pulse">
                    <span className="material-symbols-outlined text-3xl">sms</span>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-bold text-sm text-[#0B1226] uppercase tracking-wider font-label-caps">Collect Request Sent</h4>
                    <p className="text-xs text-on-surface-variant leading-relaxed max-w-xs mx-auto">
                      We have sent a collect request of <strong className="text-[#0B1226]">₹{(itinerary?.totalCost || 18000).toLocaleString('en-IN')}</strong> to your UPI ID: <strong className="text-primary font-mono">{upiId}</strong>.
                    </p>
                  </div>

                  <div className="w-full bg-[#FAF6F0] p-4 rounded-xl border border-[#E5DED4] text-xs space-y-1.5 text-left">
                    <p className="font-bold text-[#0B1226]">How to Pay:</p>
                    <ol className="list-decimal pl-4 space-y-1 text-on-surface-variant">
                      <li>Open your UPI App (Google Pay, PhonePe, Paytm, etc.).</li>
                      <li>Check the notifications or pending requests.</li>
                      <li>Approve the request of ₹{(itinerary?.totalCost || 18000).toLocaleString('en-IN')} from <strong>dhruvikparmar26@oksbi</strong>.</li>
                    </ol>
                  </div>

                  {/* QR Active timer */}
                  <div className="text-xs font-semibold text-outline">
                    Request expires in <span className="font-mono text-primary font-bold">{formatTime(qrSeconds)}</span>
                  </div>
                </div>

                <div className="bg-[#FAF6F0]/50 p-4 border-t border-[#E5DED4] flex justify-between items-center gap-3">
                  <button
                    onClick={() => setPaymentStep('select')}
                    className="bg-white border border-[#D1C7BD] text-[#0B1226] font-bold px-4 py-2.5 rounded-lg hover:bg-[#FAF6F0] text-xs uppercase tracking-wider font-label-caps cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => handleProcessPayment()}
                    className="bg-[#ffa630] text-[#0B1226] font-bold px-6 py-2.5 rounded-lg hover:brightness-105 active:scale-95 transition-all text-xs uppercase tracking-wider font-label-caps cursor-pointer flex-grow flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                    Check Status / Confirm
                  </button>
                </div>
              </>
            )}

            {/* Step 1.5: QR Code Screen */}
            {paymentStep === 'qrcode' && (
              <>
                <div className="bg-[#FAF6F0] p-6 border-b border-[#E5DED4] flex justify-between items-center">
                  <h3 className="font-display-lg text-lg text-[#0B1226]">Scan to Pay</h3>
                  <button onClick={() => setShowPaymentModal(false)} className="text-outline hover:text-[#0B1226] cursor-pointer flex items-center">
                    <span className="material-symbols-outlined text-xl">close</span>
                  </button>
                </div>
                
                <div className="p-6 flex flex-col items-center space-y-6">
                  {/* QR Timer */}
                  <div className="w-full flex justify-between items-center bg-[#FAF6F0] px-4 py-2.5 rounded-xl border border-[#E5DED4] text-xs font-semibold text-[#0B1226]">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                      QR Code Active
                    </span>
                    <span className="font-mono text-primary font-bold">{formatTime(qrSeconds)}</span>
                  </div>

                  {/* QR Image */}
                  <div className="bg-white p-3 rounded-2xl border-2 border-primary/20 shadow-md">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180&margin=5&data=${encodeURIComponent(
                        `upi://pay?pa=dhruvikparmar26@oksbi&pn=Journeys%20Travel&am=${itinerary?.totalCost || 18000}&tn=Booking%20for%20${encodeURIComponent(
                          itinerary?.destinations?.[0] || itinerary?.destination?.label || itinerary?.destination || itinerary?.title || 'Trip'
                        )}&cu=INR`
                      )}`} 
                      alt="UPI QR Code" 
                      className="w-[180px] h-[180px] object-contain"
                    />
                  </div>

                  <div className="text-center space-y-1">
                    <p className="text-sm font-bold text-[#0B1226]">₹{(itinerary?.totalCost || 18000).toLocaleString('en-IN')}</p>
                    <p className="text-[10px] text-on-surface-variant font-medium">Scan using Google Pay, PhonePe, Paytm, or BHIM</p>
                  </div>

                  {/* UPI deep link button for mobile users */}
                  <a
                    href={`upi://pay?pa=dhruvikparmar26@oksbi&pn=Journeys%20Travel&am=${itinerary?.totalCost || 18000}&tn=Booking%20for%20${encodeURIComponent(
                      itinerary?.destinations?.[0] || itinerary?.destination?.label || itinerary?.destination || itinerary?.title || 'Trip'
                    )}&cu=INR`}
                    className="sm:hidden text-xs bg-[#FAF6F0] text-primary border border-primary/30 py-2 px-4 rounded-lg font-bold hover:bg-primary/5 transition-colors cursor-pointer w-full text-center flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                    Pay via UPI App
                  </a>
                </div>

                <div className="bg-[#FAF6F0]/50 p-4 border-t border-[#E5DED4] flex justify-between items-center gap-3">
                  <button
                    onClick={() => setPaymentStep('select')}
                    className="bg-white border border-[#D1C7BD] text-[#0B1226] font-bold px-4 py-2.5 rounded-lg hover:bg-[#FAF6F0] text-xs uppercase tracking-wider font-label-caps cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => handleProcessPayment()}
                    className="bg-[#ffa630] text-[#0B1226] font-bold px-6 py-2.5 rounded-lg hover:brightness-105 active:scale-95 transition-all text-xs uppercase tracking-wider font-label-caps cursor-pointer flex-grow flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                    Confirm Payment
                  </button>
                </div>
              </>
            )}
            
            {/* Step 2: Processing Payment Spinner */}
            {paymentStep === 'processing' && (
              <div className="p-12 text-center flex flex-col items-center justify-center space-y-6">
                <span className="w-12 h-12 border-4 border-[#ffa630] border-t-transparent rounded-full animate-spin"></span>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-[#0B1226] uppercase tracking-wider font-label-caps">Simulating UPI/Card Payment</h4>
                  <p className="text-xs text-on-surface-variant">Connecting to secure banking corridors. Do not refresh...</p>
                </div>
              </div>
            )}
            
            {/* Step 3: Success checkmark */}
            {paymentStep === 'success' && (
              <div className="p-10 text-center flex flex-col items-center justify-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-[#e6f4ea] border border-[#3bc48a]/20 flex items-center justify-center text-[#006d35] scale-up animate-pulse">
                  <span className="material-symbols-outlined text-4xl">check_circle</span>
                </div>
                <div className="space-y-2">
                  <h3 className="font-display-lg text-lg text-[#0B1226]">Payment Successful!</h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed max-w-xs mx-auto">
                    Your tickets are confirmed. Booking details and day-wise plans have been sent to your notifications panel.
                  </p>
                </div>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="bg-[#0B1226] text-white font-bold px-8 py-3 rounded-xl hover:brightness-110 active:scale-95 transition-all text-xs uppercase tracking-wider font-label-caps cursor-pointer w-full mt-4"
                >
                  Done
                </button>
              </div>
            )}
            
          </div>
        </div>
      )}
    </LandingLayout>
  );
};

export default ItineraryResultsPage;
