import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import LandingLayout from '../components/ui/LandingLayout.jsx';
import api from '../utils/api.js';
import { useToast } from '../components/ui/Toast.jsx';

const getDestinationImage = (dest) => {
  const d = (dest || '').toLowerCase();
  if (d.includes('delhi')) return 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80';
  if (d.includes('jaipur')) return 'https://images.unsplash.com/photo-1477584322811-2a4fe51a28bb?auto=format&fit=crop&w=1200&q=80';
  if (d.includes('mumbai')) return 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?auto=format&fit=crop&w=1200&q=80';
  if (d.includes('goa')) return 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80';
  if (d.includes('amalfi')) return 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=1200&q=80';
  if (d.includes('kyoto')) return 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80';
  if (d.includes('tokyo')) return 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80';
  return 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80';
};

const PackingListPage = () => {
  const { itineraryId } = useParams();
  const navigate = useNavigate();
  const { success: showSuccessToast, error: showErrorToast } = useToast();
  
  const [packingList, setPackingList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [checkedItems, setCheckedItems] = useState({});
  const [selectedTripType, setSelectedTripType] = useState('general');

  useEffect(() => {
    fetchPackingList();
  }, [itineraryId]);

  const fetchPackingList = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/packing-list/${itineraryId}?tripType=${selectedTripType}`);
      setPackingList(data.packingList);
      setSelectedTripType(data.packingList.tripType || 'general');
      
      // Initialize checked items from backend values
      const initialChecked = {};
      data.packingList.categories.forEach(cat => {
        cat.items.forEach((item, index) => {
          if (item.checked) {
            initialChecked[`${cat.name}-${index}`] = true;
          }
        });
      });
      setCheckedItems(initialChecked);
    } catch (err) {
      console.error(err);
      showErrorToast('Failed to fetch or generate packing list.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    try {
      setRegenerating(true);
      const { data } = await api.post(`/packing-list/${itineraryId}/regenerate`, { tripType: selectedTripType });
      setPackingList(data.packingList);
      
      // Reset checks
      setCheckedItems({});
      showSuccessToast('Packing list regenerated!');
    } catch (err) {
      console.error(err);
      showErrorToast('Failed to regenerate packing list.');
    } finally {
      setRegenerating(false);
    }
  };

  const toggleCheck = async (categoryName, itemIndex) => {
    if (!packingList) return;

    const key = `${categoryName}-${itemIndex}`;
    const newCheckedVal = !checkedItems[key];

    // Optimistically update checkbox state in UI
    setCheckedItems(prev => ({
      ...prev,
      [key]: newCheckedVal
    }));

    // Update locally stored model categories list
    const updatedCategories = packingList.categories.map(cat => {
      if (cat.name !== categoryName) return cat;
      return {
        ...cat,
        items: cat.items.map((item, idx) => {
          if (idx !== itemIndex) return item;
          return { ...item, checked: newCheckedVal };
        })
      };
    });

    setPackingList(prev => ({
      ...prev,
      categories: updatedCategories
    }));

    // Persist checks to backend database
    try {
      await api.put(`/packing-list/${itineraryId}`, { categories: updatedCategories });
    } catch (err) {
      console.error('Failed to save packing list selections:', err);
    }
  };

  const getPackedCount = (category) => {
    return category.items.filter((_, i) => checkedItems[`${category.name}-${i}`]).length;
  };

  if (loading) {
    return (
      <LandingLayout>
        <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-12 text-center">
          <span className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin inline-block"></span>
          <p className="mt-4 text-on-surface-variant">Generating your customized checklist...</p>
        </div>
      </LandingLayout>
    );
  }

  if (!packingList) {
    return (
      <LandingLayout>
        <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-12 text-center">
          <h2 className="font-display-lg text-2xl mb-4">No Packing List Found</h2>
          <button onClick={() => navigate(-1)} className="bg-primary-container text-on-primary-container px-6 py-2 rounded-full font-bold">Go Back</button>
        </div>
      </LandingLayout>
    );
  }

  // Count overall packed items
  const totalItems = packingList.categories.reduce((acc, cat) => acc + cat.items.length, 0);
  const totalPacked = Object.values(checkedItems).filter(Boolean).length;

  return (
    <LandingLayout>
      <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-12 space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#E5DED4] pb-8">
          <div>
            <p className="font-label-caps text-[10px] text-outline uppercase tracking-wider mb-2">06 · PACK</p>
            <h1 className="font-display-lg text-3xl md:text-4xl text-[#0B1226] mb-1">
              Packing list for {packingList.destination}
            </h1>
            <p className="text-sm text-on-surface-variant">
              Season: <span className="font-semibold capitalize text-[#0B1226]">{packingList.season || 'General'}</span> • {totalPacked} / {totalItems} packed • Generated by {packingList.generatedBy === 'ai' ? 'AI Agent Engine' : 'Rules System'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedTripType}
              onChange={(e) => setSelectedTripType(e.target.value)}
              className="bg-white border border-[#D1C7BD] px-4 py-2.5 rounded-lg text-sm text-[#0B1226] font-semibold outline-none focus:border-primary-container"
            >
              <option value="general">Cultural Exploration</option>
              <option value="adventure">Adventure & Outdoors</option>
              <option value="beach">Relaxed Coastal</option>
              <option value="business">Business Smart</option>
            </select>
            <button
              onClick={handleRegenerate}
              disabled={regenerating}
              className="bg-[#ffa630] text-[#0B1226] font-bold px-6 py-2.5 rounded-lg hover:brightness-105 transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {regenerating ? 'Regenerating...' : 'Regenerate'}
            </button>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
          {packingList.categories.map((category) => (
            <div key={category.name} className="bg-white rounded-2xl p-8 border border-[#E5DED4] shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#FAF6F0]">
                  <h3 className="font-headline-md text-xl text-[#0B1226]">{category.name}</h3>
                  <span className="font-label-caps text-xs text-outline-variant font-bold">
                    {getPackedCount(category)} / {category.items.length} Items
                  </span>
                </div>
                <div className="space-y-4">
                  {category.items.map((item, index) => {
                    const isChecked = !!checkedItems[`${category.name}-${index}`];
                    return (
                      <div 
                        key={index} 
                        onClick={() => toggleCheck(category.name, index)}
                        className="flex items-center justify-between py-2 border-b border-[#FAF6F0] cursor-pointer hover:bg-[#FAF6F0]/40 px-2 rounded transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`material-symbols-outlined text-2xl transition-colors ${isChecked ? 'text-primary' : 'text-outline/40'}`}>
                            {isChecked ? 'check_box' : 'check_box_outline_blank'}
                          </span>
                          <span className={`text-sm ${isChecked ? 'line-through text-on-surface-variant/50' : 'text-[#0B1226]'}`}>
                            {item.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.quantity && (
                            <span className="text-xs font-semibold bg-[#FAF6F0] text-outline px-2.5 py-0.5 rounded-full">
                              x{item.quantity}
                            </span>
                          )}
                          {item.essential && (
                            <span className="text-[9px] font-bold tracking-widest text-[#ba1a1a] border border-[#ba1a1a]/20 bg-[#ba1a1a]/5 px-2 py-0.5 rounded uppercase">
                              Must pack
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Travel Tips Banner (Image 12 style) */}
        {packingList.travelTips && packingList.travelTips.length > 0 && (
          <div className="bg-[#0B1226] rounded-2xl p-8 md:p-10 text-white relative overflow-hidden">
            <div className="absolute right-4 bottom-4 w-40 h-40 bg-white/5 rounded-full -mr-10 -mb-10 blur-xl"></div>
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-4">
                <h3 className="font-display-lg text-2xl text-[#ffa630] mb-2">Travel tips for {packingList.destination}</h3>
                <p className="text-sm text-white/60">Local insights to make your journey smoother and more authentic.</p>
              </div>
              <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {packingList.travelTips.map((tip, idx) => {
                  const parts = tip.split(':');
                  const title = parts[0];
                  const desc = parts.slice(1).join(':');
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center gap-2 text-[#ffa630]">
                        <Sparkles className="w-4 h-4 text-[#ffa630] flex-shrink-0" />
                        <h4 className="font-bold text-xs uppercase tracking-wider">{title}</h4>
                      </div>
                      <p className="text-xs text-white/80 leading-relaxed pl-6">{desc || 'Always respect local traditions and guidelines.'}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Scenic Closing Banner */}
        <div className="rounded-2xl h-80 overflow-hidden relative shadow-lg group">
          <img 
            src={getDestinationImage(packingList.destination)} 
            alt={packingList.destination} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1226]/80 via-[#0B1226]/40 to-transparent flex flex-col justify-end p-10">
            <h3 className="font-display-lg text-3xl text-[#ffa630] mb-2">{packingList.destination} Awaits</h3>
            <p className="text-sm text-white/80 max-w-md">Pack light, travel deep. Your journey to the heart of {packingList.destination} begins with the right preparation.</p>
          </div>
        </div>
      </div>
    </LandingLayout>
  );
};

export default PackingListPage;
