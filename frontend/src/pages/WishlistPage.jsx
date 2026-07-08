import React, { useState, useEffect } from 'react';
import LandingLayout from '../components/ui/LandingLayout.jsx';
import api from '../utils/api.js';
import { useToast } from '../components/ui/Toast.jsx';

const WishlistPage = () => {
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  // Form State
  const [destinationLabel, setDestinationLabel] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [targetMonth, setTargetMonth] = useState('June');
  const [priority, setPriority] = useState('medium');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/wishlist');
      setWishlistItems(data.items || []);
    } catch (err) {
      console.error(err);
      showErrorToast('Failed to fetch wishlist items.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = async (e) => {
    e.preventDefault();
    if (!destinationLabel) return;

    // Parse comma separated tags
    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0)
      .map(t => t.startsWith('#') ? t : `#${t}`);

    const payload = {
      destination: { label: destinationLabel },
      tags,
      targetMonth,
      priority,
      notes: 'My next dream getaway.',
      coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80' // default cover
    };

    try {
      setSubmitting(true);
      const { data } = await api.post('/wishlist', payload);
      setWishlistItems(prev => [data.item, ...prev]);
      setDestinationLabel('');
      setTagsInput('');
      showSuccessToast(`Bookmarked ${destinationLabel}!`);
    } catch (err) {
      console.error(err);
      showErrorToast(err.response?.data?.error || 'Failed to add bookmark.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (id) => {
    try {
      await api.delete(`/wishlist/${id}`);
      setWishlistItems(prev => prev.filter(item => item._id !== id));
      showSuccessToast('Removed from wishlist.');
    } catch (err) {
      console.error(err);
      showErrorToast('Failed to remove item.');
    }
  };

  // Extract all unique tags for filtering
  const allTags = ['all', ...new Set(wishlistItems.flatMap(item => item.tags || []))];

  const filteredItems = wishlistItems.filter(item => {
    if (activeFilter === 'all') return true;
    return item.tags?.includes(activeFilter);
  });

  return (
    <LandingLayout>
      <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-12 space-y-12">
        {/* Header */}
        <div>
          <p className="font-label-caps text-[10px] text-outline uppercase tracking-wider mb-2">03 · SAVE</p>
          <h1 className="font-display-lg text-3xl md:text-4xl text-[#0B1226] mb-2">Places you're dreaming about</h1>
          <p className="text-sm text-on-surface-variant">Bookmark destinations, catalog tags, and map seasons to build your wish corridors.</p>
        </div>

        {/* Input Form Card */}
        <form onSubmit={handleBookmark} className="bg-white rounded-2xl p-8 border border-[#E5DED4] shadow-sm space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
            <div className="lg:col-span-3 flex flex-col gap-1.5">
              <label className="font-label-caps text-[10px] text-outline uppercase tracking-wider">Destination</label>
              <input
                type="text"
                placeholder="e.g. Amalfi Coast, Italy"
                value={destinationLabel}
                onChange={(e) => setDestinationLabel(e.target.value)}
                className="h-12 px-4 rounded-xl border border-[#D1C7BD] bg-white focus:border-primary transition-all outline-none text-sm font-semibold text-[#0B1226]"
                required
              />
            </div>
            <div className="lg:col-span-3 flex flex-col gap-1.5">
              <label className="font-label-caps text-[10px] text-outline uppercase tracking-wider">Tags (comma separated)</label>
              <input
                type="text"
                placeholder="#beach, #relax"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="h-12 px-4 rounded-xl border border-[#D1C7BD] bg-white focus:border-primary transition-all outline-none text-sm font-semibold text-[#0B1226]"
              />
            </div>
            <div className="lg:col-span-2 flex flex-col gap-1.5">
              <label className="font-label-caps text-[10px] text-outline uppercase tracking-wider">Target Month</label>
              <select
                value={targetMonth}
                onChange={(e) => setTargetMonth(e.target.value)}
                className="h-12 px-4 rounded-xl border border-[#D1C7BD] bg-white focus:border-primary transition-all outline-none text-sm font-semibold text-[#0B1226]"
              >
                <option value="January">January</option>
                <option value="February">February</option>
                <option value="March">March</option>
                <option value="April">April</option>
                <option value="May">May</option>
                <option value="June">June</option>
                <option value="July">July</option>
                <option value="August">August</option>
                <option value="September">September</option>
                <option value="October">October</option>
                <option value="November">November</option>
                <option value="December">December</option>
              </select>
            </div>
            <div className="lg:col-span-2 flex flex-col gap-1.5">
              <label className="font-label-caps text-[10px] text-outline uppercase tracking-wider">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="h-12 px-4 rounded-xl border border-[#D1C7BD] bg-white focus:border-primary transition-all outline-none text-sm font-semibold text-[#0B1226]"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="lg:col-span-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full h-12 bg-[#ffa630] text-[#0B1226] font-bold rounded-xl hover:brightness-105 active:scale-95 transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider font-label-caps"
              >
                <span className="material-symbols-outlined text-sm font-bold">bookmark</span>
                {submitting ? '...' : 'Bookmark'}
              </button>
            </div>
          </div>
        </form>

        {/* Filter Tabs */}
        {allTags.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none font-label-caps text-xs">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveFilter(tag)}
                className={`px-4 py-2 rounded-full border text-xs font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
                  activeFilter === tag
                    ? 'bg-[#0B1226] text-white border-[#0B1226]'
                    : 'bg-white text-outline-variant border-[#E5DED4] hover:bg-[#FAF6F0]'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* Wishlist Grid */}
        {loading ? (
          <div className="text-center py-12">
            <span className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin inline-block"></span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E5DED4] p-12 text-center space-y-3">
            <span className="material-symbols-outlined text-4xl text-outline-variant">favorite_border</span>
            <h3 className="font-headline-md text-lg text-[#0B1226]">Your wishlist is empty</h3>
            <p className="text-sm text-on-surface-variant">Add destinations you'd love to visit to see them here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
            {filteredItems.map((item) => (
              <div key={item._id} className="bg-white rounded-2xl border border-[#E5DED4] overflow-hidden shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow">
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-headline-md text-lg text-[#0B1226] leading-tight group-hover:text-primary transition-colors">
                        {item.destination?.label || item.destination}
                      </h3>
                      <p className="text-xs text-on-surface-variant mt-1">
                        Target: <span className="font-semibold text-[#0B1226]">{item.targetMonth || 'Anytime'}</span>
                      </p>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded font-label-caps border uppercase ${
                      item.priority === 'high' 
                        ? 'bg-[#ba1a1a]/5 text-[#ba1a1a] border-[#ba1a1a]/20' 
                        : item.priority === 'medium'
                        ? 'bg-[#885200]/5 text-[#885200] border-[#885200]/20'
                        : 'bg-[#006d35]/5 text-[#006d35] border-[#006d35]/20'
                    }`}>
                      {item.priority}
                    </span>
                  </div>

                  {/* Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.tags.map((tag, idx) => (
                        <span key={idx} className="text-[10px] bg-[#FAF6F0] text-outline border border-[#E5DED4] px-2 py-0.5 rounded font-semibold uppercase font-label-caps">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="px-6 py-4 bg-[#FAF6F0]/40 border-t border-[#FAF6F0] flex justify-between items-center">
                  <button 
                    onClick={() => handleRemove(item._id)} 
                    className="text-xs font-bold text-[#ba1a1a] hover:underline uppercase tracking-wider font-label-caps cursor-pointer"
                  >
                    Remove
                  </button>
                  <img 
                    src={item.coverImage || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=120&q=80'} 
                    alt="thumbnail" 
                    className="w-10 h-10 rounded-lg object-cover shadow-sm"
                  />
                </div>
              </div>
            ))}

            {/* Focus forms box */}
            <div 
              onClick={() => window.scrollTo({ top: 120, behavior: 'smooth' })}
              className="bg-[#FAF6F0]/40 rounded-2xl border border-dashed border-[#D1C7BD] flex flex-col items-center justify-center text-center p-8 cursor-pointer hover:bg-white hover:border-[#ffa630] transition-all min-h-[180px]"
            >
              <span className="material-symbols-outlined text-3xl text-outline-variant mb-2">add_location_alt</span>
              <span className="font-bold text-xs uppercase tracking-wider font-label-caps text-[#0B1226]/60">Add New Dream</span>
            </div>
          </div>
        )}
      </div>
    </LandingLayout>
  );
};

export default WishlistPage;
