import React, { useState, useEffect } from 'react';
import LandingLayout from '../components/ui/LandingLayout.jsx';
import api from '../utils/api.js';
import { useToast } from '../components/ui/Toast.jsx';
import useAuth from '../hooks/useAuth.js';
import Skeleton, { SkeletonProfile } from '../components/ui/Skeleton.jsx';

const ProfilePage = () => {
  const { showToast } = useToast();
  const { user: authUser, updateUserData } = useAuth();

  // Loading states
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState(null);

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    dateOfBirth: '',
    gender: 'prefer-not-to-say',
    bio: '',
    address: { city: '', state: '', country: '', postalCode: '' }
  });

  const [preferencesForm, setPreferencesForm] = useState({
    travelStyle: 'mid-range',
    dietaryRestrictions: '',
    accessibility: '',
    preferredCurrency: 'INR',
    language: 'en',
    interests: ''
  });

  const [passportForm, setPassportForm] = useState({
    number: '',
    expiryDate: '',
    nationality: '',
    issuingCountry: ''
  });

  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const loadProfileData = async () => {
      setLoading(true);
      try {
        // Fetch core user data
        const userRes = await api.get('/profile');
        if (userRes.data?.success) {
          const u = userRes.data.user;
          setProfileForm({
            name: u.name || '',
            phone: u.phone || '',
            dateOfBirth: u.dateOfBirth ? u.dateOfBirth.split('T')[0] : '',
            gender: u.gender || 'prefer-not-to-say',
            bio: u.bio || '',
            address: {
              city: u.address?.city || '',
              state: u.address?.state || '',
              country: u.address?.country || '',
              postalCode: u.address?.postalCode || ''
            }
          });

          setPreferencesForm({
            travelStyle: u.preferences?.travelStyle || 'mid-range',
            dietaryRestrictions: u.preferences?.dietaryRestrictions?.join(', ') || '',
            accessibility: u.preferences?.accessibility?.join(', ') || '',
            preferredCurrency: u.preferences?.preferredCurrency || 'INR',
            language: u.preferences?.language || 'en',
            interests: u.preferences?.interests?.join(', ') || ''
          });

          setPassportForm({
            number: u.passport?.number || '',
            expiryDate: u.passport?.expiryDate ? u.passport.expiryDate.split('T')[0] : '',
            nationality: u.passport?.nationality || '',
            issuingCountry: u.passport?.issuingCountry || ''
          });
        }

        // Fetch stats
        const statsRes = await api.get('/profile/stats');
        if (statsRes.data?.success) {
          setStats(statsRes.data.stats);
        }
      } catch (err) {
        console.error('Failed to load profile data:', err);
        showToast('Error retrieving profile details.', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadProfileData();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.put('/profile', profileForm);
      if (res.data?.success) {
        showToast('Profile updated successfully!', 'success');
        if (updateUserData) updateUserData(res.data.user);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to update profile.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdatePreferences = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const dietaryArray = preferencesForm.dietaryRestrictions.split(',').map(d => d.trim()).filter(Boolean);
      const accessibilityArray = preferencesForm.accessibility.split(',').map(a => a.trim()).filter(Boolean);
      const interestsArray = preferencesForm.interests.split(',').map(i => i.trim()).filter(Boolean);

      const res = await api.put('/profile/preferences', {
        ...preferencesForm,
        dietaryRestrictions: dietaryArray,
        accessibility: accessibilityArray,
        interests: interestsArray
      });

      if (res.data?.success) {
        showToast('Travel preferences saved!', 'success');
        if (updateUserData) updateUserData(res.data.user);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to update travel preferences.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdatePassport = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.put('/profile/passport', passportForm);
      if (res.data?.success) {
        showToast('Travel documents updated!', 'success');
        if (updateUserData) updateUserData(res.data.user);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to update passport documents.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <LandingLayout>
        <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-12">
          <SkeletonProfile />
        </div>
      </LandingLayout>
    );
  }

  return (
    <LandingLayout>
      <section className="py-12 max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sidebar Nav */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Avatar Card */}
          <div className="bg-white rounded-2xl p-6 border border-[#E5DED4] shadow-sm text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-[#ffa630]/20 flex items-center justify-center font-bold text-lg text-primary uppercase border-2 border-[#ffa630] mx-auto overflow-hidden">
              {authUser?.avatar ? (
                <img src={authUser.avatar} alt={authUser.name} className="w-full h-full object-cover" />
              ) : (
                authUser?.name?.substring(0, 2) || 'TR'
              )}
            </div>
            <div>
              <h3 className="font-display-lg text-lg text-[#0B1226]">{authUser?.name}</h3>
              <span className="text-xs text-outline block">{authUser?.email}</span>
            </div>
            {authUser?.tier && (
              <div className="inline-block text-[9px] font-bold text-[#6b4000] bg-[#ffa630]/20 px-3 py-1 rounded-full uppercase tracking-wider">
                👑 {authUser.tier} tier member
              </div>
            )}
          </div>

          {/* Navigation Menu */}
          <div className="bg-white rounded-2xl p-4 border border-[#E5DED4] shadow-sm flex flex-col font-label-caps text-xs font-bold gap-2">
            {[
              { id: 'dashboard', label: 'Travel Stats Dashboard', icon: 'dashboard' },
              { id: 'edit-profile', label: 'Edit Profile Details', icon: 'edit' },
              { id: 'preferences', label: 'Travel Style & Preference', icon: 'tune' },
              { id: 'documents', label: 'Passports & Documents', icon: 'description' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#ffa630]/15 text-primary border-l-4 border-primary'
                    : 'text-outline hover:bg-[#FAF6F0] hover:text-[#0B1226]'
                }`}
              >
                <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

        </div>

        {/* Right Dashboard panel */}
        <div className="lg:col-span-9">
          
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Loyalty tier Card */}
              <div className="bg-gradient-to-r from-[#0B1226] to-[#006875] rounded-2xl p-6 text-white border border-white/5 shadow-lg relative overflow-hidden">
                <div className="absolute right-0 top-0 w-32 h-32 glow-sunset opacity-40" />
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-label-caps text-[9px] text-primary-container font-bold uppercase tracking-widest block mb-1">Loyalty Tier Status</span>
                      <h3 className="font-display-lg text-2xl uppercase tracking-wider">{authUser?.tier || 'Bronze'} Club</h3>
                    </div>
                    <span className="material-symbols-outlined text-4xl text-[#ffa630]">military_tech</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-white/80">
                      <span>Points Balance: {authUser?.loyaltyPoints || 0} pts</span>
                      <span>Next Level: 500 pts</span>
                    </div>
                    <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-[#ffa630] h-full rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min(100, ((authUser?.loyaltyPoints || 0) / 500) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid Statistics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                
                <div className="bg-white rounded-2xl p-5 border border-[#E5DED4] shadow-sm text-center">
                  <span className="text-[10px] text-outline uppercase font-bold block mb-1">Trips Completed</span>
                  <span className="font-display-lg text-2xl text-[#0B1226]">{stats?.tripsCompleted || 0}</span>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-[#E5DED4] shadow-sm text-center">
                  <span className="text-[10px] text-outline uppercase font-bold block mb-1">Countries Visited</span>
                  <span className="font-display-lg text-2xl text-[#0B1226]">{stats?.countriesVisited || 0}</span>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-[#E5DED4] shadow-sm text-center">
                  <span className="text-[10px] text-outline uppercase font-bold block mb-1">Cities Visited</span>
                  <span className="font-display-lg text-2xl text-[#0B1226]">{stats?.citiesVisited || 0}</span>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-[#E5DED4] shadow-sm text-center">
                  <span className="text-[10px] text-outline uppercase font-bold block mb-1">Total Spent</span>
                  <span className="font-display-lg text-2xl text-primary">
                    ₹{(stats?.totalSpent || 0).toLocaleString('en-IN')}
                  </span>
                </div>

              </div>

              {/* Dynamic stats logs */}
              <div className="bg-white rounded-2xl p-6 border border-[#E5DED4] shadow-sm space-y-4">
                <h3 className="font-display-lg text-lg text-[#0B1226] border-b border-[#FAF6F0] pb-2">Travel Footprint</h3>
                <div className="flex items-center gap-6 py-4">
                  <span className="material-symbols-outlined text-4xl text-primary-container">explore</span>
                  <div className="space-y-1">
                    <span className="text-xs text-outline font-bold uppercase tracking-wider block">Estimated Distance Log</span>
                    <p className="text-sm font-semibold text-[#0B1226]">
                      You have traveled an estimated <span className="font-display-lg text-lg text-primary">{stats?.totalDistance || 0} km</span> through our itinerary systems!
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Edit Profile Tab */}
          {activeTab === 'edit-profile' && (
            <div className="bg-white rounded-2xl p-6 border border-[#E5DED4] shadow-sm space-y-6">
              <h2 className="font-display-lg text-xl text-[#0B1226]">Profile Information</h2>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-bold text-[#0B1226] uppercase block mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={profileForm.name}
                      onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full h-11 px-4 bg-[#FAF6F0] border border-[#D1C7BD] rounded-lg text-sm outline-none focus:border-primary text-[#0B1226]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#0B1226] uppercase block mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                      placeholder="e.g. +91 9876543210"
                      className="w-full h-11 px-4 bg-[#FAF6F0] border border-[#D1C7BD] rounded-lg text-sm outline-none focus:border-primary text-[#0B1226]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#0B1226] uppercase block mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={profileForm.dateOfBirth}
                      onChange={e => setProfileForm({ ...profileForm, dateOfBirth: e.target.value })}
                      className="w-full h-11 px-4 bg-[#FAF6F0] border border-[#D1C7BD] rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#0B1226] uppercase block mb-1">Gender</label>
                    <select
                      value={profileForm.gender}
                      onChange={e => setProfileForm({ ...profileForm, gender: e.target.value })}
                      className="w-full h-11 px-4 bg-[#FAF6F0] border border-[#D1C7BD] rounded-lg text-sm"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="non-binary">Non-Binary</option>
                      <option value="prefer-not-to-say">Prefer Not To Say</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#0B1226] uppercase block mb-1">Travel Bio</label>
                  <textarea
                    rows="3"
                    value={profileForm.bio}
                    onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })}
                    placeholder="Tell us about your favorite destination or travel preferences..."
                    className="w-full p-4 bg-[#FAF6F0] border border-[#D1C7BD] rounded-lg text-sm resize-none text-[#0B1226] focus:border-primary outline-none"
                  />
                </div>

                <div className="border-t border-[#FAF6F0] pt-6 space-y-4">
                  <h4 className="font-label-caps text-xs text-outline uppercase tracking-wider font-bold">Billing Address</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="City" value={profileForm.address.city} onChange={e => setProfileForm({ ...profileForm, address: { ...profileForm.address, city: e.target.value } })} className="w-full h-11 px-4 bg-[#FAF6F0] border border-[#D1C7BD] rounded-lg text-sm text-[#0B1226]" />
                    <input type="text" placeholder="State" value={profileForm.address.state} onChange={e => setProfileForm({ ...profileForm, address: { ...profileForm.address, state: e.target.value } })} className="w-full h-11 px-4 bg-[#FAF6F0] border border-[#D1C7BD] rounded-lg text-sm text-[#0B1226]" />
                    <input type="text" placeholder="Country" value={profileForm.address.country} onChange={e => setProfileForm({ ...profileForm, address: { ...profileForm.address, country: e.target.value } })} className="w-full h-11 px-4 bg-[#FAF6F0] border border-[#D1C7BD] rounded-lg text-sm text-[#0B1226]" />
                    <input type="text" placeholder="Postal Code" value={profileForm.address.postalCode} onChange={e => setProfileForm({ ...profileForm, address: { ...profileForm.address, postalCode: e.target.value } })} className="w-full h-11 px-4 bg-[#FAF6F0] border border-[#D1C7BD] rounded-lg text-sm text-[#0B1226]" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-[#ffa630] text-[#0B1226] font-bold uppercase tracking-wider text-xs rounded-full hover:brightness-105 active:scale-95 transition-all cursor-pointer"
                >
                  {submitting ? 'Saving...' : 'Save Profile Details'}
                </button>
              </form>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="bg-white rounded-2xl p-6 border border-[#E5DED4] shadow-sm space-y-6">
              <h2 className="font-display-lg text-xl text-[#0B1226]">Travel Style & Style Settings</h2>
              <form onSubmit={handleUpdatePreferences} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-bold text-[#0B1226] uppercase block mb-1">Preferred Travel Style</label>
                    <select
                      value={preferencesForm.travelStyle}
                      onChange={e => setPreferencesForm({ ...preferencesForm, travelStyle: e.target.value })}
                      className="w-full h-11 px-4 bg-[#FAF6F0] border border-[#D1C7BD] rounded-lg text-sm"
                    >
                      <option value="budget">Budget Backpacker</option>
                      <option value="mid-range">Mid-Range Explorer</option>
                      <option value="luxury">Luxury Club member</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#0B1226] uppercase block mb-1">Preferred Currency</label>
                    <select
                      value={preferencesForm.preferredCurrency}
                      onChange={e => setPreferencesForm({ ...preferencesForm, preferredCurrency: e.target.value })}
                      className="w-full h-11 px-4 bg-[#FAF6F0] border border-[#D1C7BD] rounded-lg text-sm"
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-[#0B1226] uppercase block mb-1">Dietary Restrictions (comma separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. Vegetarian, Gluten-Free, Vegan"
                      value={preferencesForm.dietaryRestrictions}
                      onChange={e => setPreferencesForm({ ...preferencesForm, dietaryRestrictions: e.target.value })}
                      className="w-full h-11 px-4 bg-[#FAF6F0] border border-[#D1C7BD] rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#0B1226] uppercase block mb-1">Accessibility Support (comma separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. Wheelchair friendly, Senior accessibility"
                      value={preferencesForm.accessibility}
                      onChange={e => setPreferencesForm({ ...preferencesForm, accessibility: e.target.value })}
                      className="w-full h-11 px-4 bg-[#FAF6F0] border border-[#D1C7BD] rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#0B1226] uppercase block mb-1">Interests & Hobbies (comma separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. Heritage, Adventure sports, Wildlife, Photography"
                      value={preferencesForm.interests}
                      onChange={e => setPreferencesForm({ ...preferencesForm, interests: e.target.value })}
                      className="w-full h-11 px-4 bg-[#FAF6F0] border border-[#D1C7BD] rounded-lg text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-[#ffa630] text-[#0B1226] font-bold uppercase tracking-wider text-xs rounded-full hover:brightness-105 active:scale-95 transition-all cursor-pointer"
                >
                  {submitting ? 'Saving...' : 'Save Travel Preferences'}
                </button>
              </form>
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="bg-white rounded-2xl p-6 border border-[#E5DED4] shadow-sm space-y-6">
              <h2 className="font-display-lg text-xl text-[#0B1226]">Passport & Documents vault</h2>
              <form onSubmit={handleUpdatePassport} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-bold text-[#0B1226] uppercase block mb-1">Passport Number</label>
                    <input
                      type="text"
                      placeholder="e.g. Z1234567"
                      value={passportForm.number}
                      onChange={e => setPassportForm({ ...passportForm, number: e.target.value })}
                      className="w-full h-11 px-4 bg-[#FAF6F0] border border-[#D1C7BD] rounded-lg text-sm text-[#0B1226] outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#0B1226] uppercase block mb-1">Passport Expiry Date</label>
                    <input
                      type="date"
                      value={passportForm.expiryDate}
                      onChange={e => setPassportForm({ ...passportForm, expiryDate: e.target.value })}
                      className="w-full h-11 px-4 bg-[#FAF6F0] border border-[#D1C7BD] rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#0B1226] uppercase block mb-1">Nationality</label>
                    <input
                      type="text"
                      placeholder="e.g. Indian"
                      value={passportForm.nationality}
                      onChange={e => setPassportForm({ ...passportForm, nationality: e.target.value })}
                      className="w-full h-11 px-4 bg-[#FAF6F0] border border-[#D1C7BD] rounded-lg text-sm text-[#0B1226]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#0B1226] uppercase block mb-1">Issuing Country</label>
                    <input
                      type="text"
                      placeholder="e.g. India"
                      value={passportForm.issuingCountry}
                      onChange={e => setPassportForm({ ...passportForm, issuingCountry: e.target.value })}
                      className="w-full h-11 px-4 bg-[#FAF6F0] border border-[#D1C7BD] rounded-lg text-sm text-[#0B1226]"
                    />
                  </div>
                </div>

                <div className="bg-[#FAF6F0] rounded-xl p-4 border border-[#E5DED4] flex gap-3">
                  <span className="material-symbols-outlined text-outline text-2xl">verified_user</span>
                  <p className="text-[11px] text-outline leading-relaxed">
                    Your document information is securely encrypted in transit and stored locally for automatic auto-fills during boarding pass creations and hotel check-in procedures.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-[#ffa630] text-[#0B1226] font-bold uppercase tracking-wider text-xs rounded-full hover:brightness-105 active:scale-95 transition-all cursor-pointer"
                >
                  {submitting ? 'Saving...' : 'Save Documents'}
                </button>
              </form>
            </div>
          )}

        </div>

      </section>
    </LandingLayout>
  );
};

export default ProfilePage;
