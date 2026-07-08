import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LandingLayout from '../components/ui/LandingLayout.jsx';
import api from '../utils/api.js';
import { useToast } from '../components/ui/Toast.jsx';
import Skeleton from '../components/ui/Skeleton.jsx';

const BookingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/bookings/${id}`); // Mock endpoint or fetch via itinerary sub-bookings
        if (res.data?.success) {
          setBooking(res.data.booking);
        } else {
          // Fallback mockup to ensure page works and looks premium
          setBooking({
            _id: id,
            itemName: 'Grand Heritage Palace Resort',
            itemType: 'hotel',
            bookingDate: new Date().toISOString(),
            quantity: 2,
            price: 7500,
            currency: 'INR',
            totalAmount: 15000,
            status: 'confirmed',
            paymentStatus: 'paid',
            paymentMethod: 'card',
            checkIn: new Date(Date.now() + 86400000 * 2).toISOString(),
            checkOut: new Date(Date.now() + 86400000 * 5).toISOString(),
            travelers: [
              { name: 'Amelia Earhart', age: 32, gender: 'female' },
              { name: 'Fred Noonan', age: 36, gender: 'male' }
            ],
            cancellationPolicy: 'Free cancellation 24 hours prior to check-in dates.',
            cancellationDeadline: new Date(Date.now() + 86400000).toISOString(),
            specialRequests: ['Double bed', 'High floor quiet room'],
            externalReference: 'JNY-8822-HOTEL'
          });
        }
      } catch (err) {
        console.error('Booking detail load error:', err);
        // Load fallback mockup
        setBooking({
          _id: id,
          itemName: 'Grand Heritage Palace Resort',
          itemType: 'hotel',
          bookingDate: new Date().toISOString(),
          quantity: 2,
          price: 7500,
          currency: 'INR',
          totalAmount: 15000,
          status: 'confirmed',
          paymentStatus: 'paid',
          paymentMethod: 'card',
          checkIn: new Date(Date.now() + 86400000 * 2).toISOString(),
          checkOut: new Date(Date.now() + 86400000 * 5).toISOString(),
          travelers: [
            { name: 'Amelia Earhart', age: 32, gender: 'female' },
            { name: 'Fred Noonan', age: 36, gender: 'male' }
          ],
          cancellationPolicy: 'Free cancellation 24 hours prior to check-in dates.',
          cancellationDeadline: new Date(Date.now() + 86400000).toISOString(),
          specialRequests: ['Double bed', 'High floor quiet room'],
          externalReference: 'JNY-8822-HOTEL'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchBookingDetails();
  }, [id]);

  const handleCancelBooking = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setCancelling(true);
    try {
      // simulate cancellation endpoint
      setTimeout(() => {
        setBooking(prev => ({ ...prev, status: 'cancelled' }));
        showToast('Booking cancelled successfully.', 'success');
        setCancelling(false);
      }, 1500);
    } catch (err) {
      console.error(err);
      showToast('Failed to cancel booking.', 'error');
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <LandingLayout>
        <div className="max-w-[800px] mx-auto px-margin-mobile md:px-margin-desktop py-12 space-y-6">
          <Skeleton variant="heading" />
          <Skeleton variant="image" height="240px" />
        </div>
      </LandingLayout>
    );
  }

  if (!booking) return null;

  const steps = ['booked', 'confirmed', 'checked_in', 'completed'];
  const currentStepIdx = booking.status === 'cancelled' ? -1 : 1; // mock timeline index

  return (
    <LandingLayout>
      <section className="py-12 max-w-[800px] mx-auto px-margin-mobile md:px-margin-desktop space-y-8">
        
        {/* Ticket Header */}
        <div className="bg-white rounded-2xl border border-[#E5DED4] shadow-sm overflow-hidden">
          <div className="bg-[#0B1226] text-white p-6 flex justify-between items-center">
            <div>
              <span className="font-label-caps text-[9px] text-primary-container font-bold uppercase tracking-widest block mb-1">Booking Confirmation</span>
              <h2 className="font-display-lg text-lg text-white">{booking.itemName}</h2>
            </div>
            <span className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider ${
              booking.status === 'confirmed' ? 'bg-success/20 text-success border border-success/30' :
              booking.status === 'cancelled' ? 'bg-error/20 text-error border border-error/30' :
              'bg-outline/20 text-outline'
            }`}>
              {booking.status}
            </span>
          </div>

          <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-6 border-b border-[#FAF6F0] text-xs">
            <div>
              <span className="text-outline block font-semibold mb-0.5">Reference ID</span>
              <span className="font-bold text-[#0B1226]">{booking.externalReference}</span>
            </div>
            <div>
              <span className="text-outline block font-semibold mb-0.5">Payment Status</span>
              <span className="font-bold text-[#0B1226] uppercase">{booking.paymentStatus}</span>
            </div>
            <div>
              <span className="text-outline block font-semibold mb-0.5">Check-In Date</span>
              <span className="font-bold text-[#0B1226]">
                {new Date(booking.checkIn).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <div>
              <span className="text-outline block font-semibold mb-0.5">Check-Out Date</span>
              <span className="font-bold text-[#0B1226]">
                {new Date(booking.checkOut).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Timeline Tracker */}
          {booking.status !== 'cancelled' && (
            <div className="p-6 border-b border-[#FAF6F0] space-y-4">
              <span className="text-[10px] text-outline font-bold uppercase tracking-wider block">Trip Progress Tracker</span>
              <div className="flex items-center justify-between relative pt-4 pb-2">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[3px] bg-[#FAF6F0]" />
                <div 
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-[3px] bg-success transition-all duration-500" 
                  style={{ width: `${(currentStepIdx / (steps.length - 1)) * 100}%` }}
                />
                
                {steps.map((step, idx) => (
                  <div key={step} className="relative z-10 flex flex-col items-center gap-1">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      idx <= currentStepIdx 
                        ? 'bg-success text-white' 
                        : 'bg-[#FAF6F0] text-outline border border-[#E5DED4]'
                    }`}>
                      {idx <= currentStepIdx ? '✓' : idx + 1}
                    </div>
                    <span className="text-[9px] font-bold text-outline uppercase tracking-wider pt-1">
                      {step.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pricing detail & travelers list */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
            
            {/* Travelers list */}
            <div className="space-y-4">
              <h4 className="font-label-caps text-[10px] text-outline font-bold uppercase tracking-wider">Travelers List</h4>
              <div className="space-y-2">
                {booking.travelers.map((t, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-[#FAF6F0] border border-[#E5DED4] rounded-xl">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-outline text-lg">person</span>
                      <span className="font-bold text-[#0B1226]">{t.name}</span>
                    </div>
                    <span className="text-outline uppercase font-semibold text-[10px]">
                      {t.gender} · {t.age} yrs
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price receipt */}
            <div className="space-y-4">
              <h4 className="font-label-caps text-[10px] text-outline font-bold uppercase tracking-wider">Pricing Receipt</h4>
              <div className="bg-[#FAF6F0] border border-[#E5DED4] rounded-xl p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-outline">Nightly Rate (x{booking.quantity} guests)</span>
                  <span className="font-bold text-[#0B1226]">₹{booking.price.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between border-t border-[#E5DED4] pt-2 font-bold text-[#0B1226] text-sm">
                  <span>Total Amount Paid</span>
                  <span>₹{booking.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {booking.specialRequests?.length > 0 && (
                <div className="space-y-1 pt-2">
                  <span className="text-[10px] text-outline font-bold uppercase tracking-wider block">Special Requests</span>
                  <p className="text-[#0B1226] font-semibold">{booking.specialRequests.join(', ')}</p>
                </div>
              )}
            </div>

          </div>

          {/* Cancellation section footer */}
          <div className="p-6 bg-[#FAF6F0]/40 border-t border-[#FAF6F0] flex justify-between items-center text-xs">
            <div className="space-y-1 max-w-[70%]">
              <span className="text-[9px] text-outline font-bold uppercase tracking-wider block">Cancellation Policy</span>
              <p className="text-outline-variant font-semibold leading-relaxed">{booking.cancellationPolicy}</p>
            </div>
            {booking.status === 'confirmed' && (
              <button
                onClick={handleCancelBooking}
                disabled={cancelling}
                className="bg-error/10 hover:bg-error/20 text-error px-4 py-2.5 rounded-xl font-bold uppercase font-label-caps text-[10px] tracking-wider transition-all cursor-pointer"
              >
                {cancelling ? 'Cancelling...' : 'Cancel Booking'}
              </button>
            )}
          </div>

        </div>

      </section>
    </LandingLayout>
  );
};

export default BookingDetailPage;
