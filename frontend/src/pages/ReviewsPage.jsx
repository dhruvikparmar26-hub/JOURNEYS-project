import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LandingLayout from '../components/ui/LandingLayout.jsx';
import api from '../utils/api.js';
import { useToast } from '../components/ui/Toast.jsx';

const ReviewsPage = () => {
  const { itineraryId } = useParams();
  const navigate = useNavigate();
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewsList, setReviewsList] = useState([]);
  const [reviewsSummary, setReviewsSummary] = useState(null);

  // Form State
  const [overallRating, setOverallRating] = useState(5);
  const [hotelRating, setHotelRating] = useState(5);
  const [activitiesRating, setActivitiesRating] = useState(5);
  const [valueRating, setValueRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchItineraryAndReviews();
  }, [itineraryId]);

  const fetchItineraryAndReviews = async () => {
    try {
      setLoading(true);
      const { data: itinData } = await api.get(`/itineraries/${itineraryId}`);
      setItinerary(itinData);

      const destLabel = itinData.destinations?.[0] || itinData.destination?.label || itinData.destination || itinData.title;
      const { data: revData } = await api.get(`/reviews/destination/${encodeURIComponent(destLabel)}`);
      setReviewsList(revData.reviews || []);
      setReviewsSummary(revData.summary);
    } catch (err) {
      console.error(err);
      showErrorToast('Failed to load itinerary or existing reviews.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!title || !comment) return;

    const payload = {
      itineraryId,
      ratings: {
        overall: Number(overallRating),
        hotel: Number(hotelRating),
        activities: Number(activitiesRating),
        value: Number(valueRating)
      },
      title,
      comment,
      isPublic: true
    };

    try {
      setSubmitting(true);
      await api.post('/reviews', payload);
      showSuccessToast('Review submitted successfully!');
      setTitle('');
      setComment('');
      // Reload reviews
      fetchItineraryAndReviews();
    } catch (err) {
      console.error(err);
      showErrorToast(err.response?.data?.error || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !itinerary) {
    return (
      <LandingLayout>
        <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-12 text-center">
          <span className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin inline-block"></span>
          <p className="mt-4 text-on-surface-variant">Accessing flight log reviews...</p>
        </div>
      </LandingLayout>
    );
  }

  const destinationLabel = itinerary?.destinations?.[0] || itinerary?.destination?.label || itinerary?.destination || itinerary?.title;

  return (
    <LandingLayout>
      <div className="max-w-[720px] mx-auto px-margin-mobile md:px-margin-desktop py-12 space-y-12">
        {/* Header */}
        <div>
          <p className="font-label-caps text-[10px] text-outline uppercase tracking-wider mb-2">07 · REFLECT</p>
          <h1 className="font-display-lg text-3xl md:text-4xl text-[#0B1226] mb-2">How was your trip?</h1>
          <p className="text-sm text-on-surface-variant">Review your trip to {destinationLabel}. Share your rating for hotel lodgings, activities, and transport.</p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmitReview} className="bg-white rounded-2xl p-8 border border-[#E5DED4] shadow-sm space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-[#FAF6F0]">
            <div className="flex flex-col gap-1.5">
              <label className="font-label-caps text-[10px] text-outline uppercase tracking-wider">Overall Rating</label>
              <div className="flex gap-1.5 items-center">
                {[1, 2, 3, 4, 5].map((val) => (
                  <span 
                    key={val} 
                    onClick={() => setOverallRating(val)}
                    className={`material-symbols-outlined cursor-pointer text-2xl ${val <= overallRating ? 'text-[#ffa630]' : 'text-outline/30'}`}
                  >
                    star
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-label-caps text-[10px] text-outline uppercase tracking-wider">Hotel Rating</label>
              <div className="flex gap-1.5 items-center">
                {[1, 2, 3, 4, 5].map((val) => (
                  <span 
                    key={val} 
                    onClick={() => setHotelRating(val)}
                    className={`material-symbols-outlined cursor-pointer text-2xl ${val <= hotelRating ? 'text-[#ffa630]' : 'text-outline/30'}`}
                  >
                    star
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-label-caps text-[10px] text-outline uppercase tracking-wider">Activities Rating</label>
              <div className="flex gap-1.5 items-center">
                {[1, 2, 3, 4, 5].map((val) => (
                  <span 
                    key={val} 
                    onClick={() => setActivitiesRating(val)}
                    className={`material-symbols-outlined cursor-pointer text-2xl ${val <= activitiesRating ? 'text-[#ffa630]' : 'text-outline/30'}`}
                  >
                    star
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-label-caps text-[10px] text-outline uppercase tracking-wider">Value For Money</label>
              <div className="flex gap-1.5 items-center">
                {[1, 2, 3, 4, 5].map((val) => (
                  <span 
                    key={val} 
                    onClick={() => setValueRating(val)}
                    className={`material-symbols-outlined cursor-pointer text-2xl ${val <= valueRating ? 'text-[#ffa630]' : 'text-outline/30'}`}
                  >
                    star
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-label-caps text-[10px] text-outline uppercase tracking-wider">Title</label>
              <input
                type="text"
                placeholder="Summarize your experience"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-12 px-4 rounded-xl border border-[#D1C7BD] bg-white focus:border-primary transition-all outline-none text-sm font-semibold text-[#0B1226]"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-label-caps text-[10px] text-outline uppercase tracking-wider">Your Review</label>
              <textarea
                placeholder="Tell us about the highlights and any challenges you faced..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={5}
                className="p-4 rounded-xl border border-[#D1C7BD] bg-white focus:border-primary transition-all outline-none text-sm font-semibold text-[#0B1226]"
                required
              />
            </div>
          </div>

          <div className="pt-2 text-right">
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#ffa630] text-[#0B1226] font-bold px-8 py-3 rounded-full hover:brightness-105 active:scale-95 transition-all shadow-sm cursor-pointer disabled:opacity-50 font-label-caps text-xs tracking-wider uppercase"
            >
              {submitting ? 'Submitting...' : 'Submit review'}
            </button>
          </div>
        </form>

        {/* Aggregate Ratings Block */}
        <div className="bg-[#0B1226] text-white rounded-2xl p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="flex items-center gap-6">
            <h2 className="font-display-lg text-4xl text-[#ffa630]">
              {reviewsSummary ? Number(reviewsSummary.avgOverall).toFixed(1) : '5.0'}
            </h2>
            <div>
              <div className="flex gap-1 items-center">
                {[1, 2, 3, 4, 5].map((val) => (
                  <span 
                    key={val} 
                    className={`material-symbols-outlined text-sm ${val <= (reviewsSummary?.avgOverall || 5) ? 'text-[#ffa630]' : 'text-white/20'}`}
                  >
                    star
                  </span>
                ))}
              </div>
              <p className="text-xs text-white/60 mt-1 font-semibold uppercase tracking-wider font-label-caps">
                {reviewsSummary ? `${reviewsSummary.count} Reviews Total` : 'No public reviews yet'}
              </p>
            </div>
          </div>
          <div className="text-center sm:text-right border-t sm:border-t-0 border-white/10 pt-4 sm:pt-0 w-full sm:w-auto">
            <p className="text-xs italic text-white/80">"The best curation I've ever experienced."</p>
            <span className="text-[9px] bg-[#ffa630]/20 text-[#ffa630] border border-[#ffa630]/30 px-2 py-0.5 rounded font-bold uppercase font-label-caps inline-block mt-2">
              Bespoke Travel
            </span>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          <h3 className="font-headline-md text-xl text-[#0B1226]">Reviews for {destinationLabel}</h3>
          
          {reviewsList.length === 0 ? (
            <p className="text-sm text-on-surface-variant italic py-6">Be the first to review itineraries for this destination!</p>
          ) : (
            <div className="space-y-4">
              {reviewsList.map((rev) => (
                <div key={rev._id} className="bg-white rounded-xl p-6 border border-[#E5DED4] shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-[#0B1226]">{rev.title}</h4>
                      <div className="flex gap-1 items-center mt-1">
                        {[1, 2, 3, 4, 5].map((val) => (
                          <span 
                            key={val} 
                            className={`material-symbols-outlined text-xs ${val <= rev.ratings?.overall ? 'text-[#ffa630]' : 'text-outline/20'}`}
                          >
                            star
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-outline font-semibold">
                        {rev.user?.name || 'Explorer'}
                      </span>
                      <p className="text-[9px] text-outline-variant font-label-caps uppercase mt-0.5">
                        {new Date(rev.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    {rev.comment}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </LandingLayout>
  );
};

export default ReviewsPage;
