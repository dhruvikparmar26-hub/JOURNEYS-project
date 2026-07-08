import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import LandingLayout from '../components/ui/LandingLayout.jsx';
import api from '../utils/api.js';
import { useToast } from '../components/ui/Toast.jsx';
import useAuth from '../hooks/useAuth.js';

const GroupTripsPage = () => {
  const { itineraryId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('editor');
  const [submittingInvite, setSubmittingInvite] = useState(false);
  const [inviteLink, setInviteLink] = useState('');

  useEffect(() => {
    fetchGroupDetails();
  }, [itineraryId]);

  const fetchGroupDetails = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/group-trips/${itineraryId}`);
      setGroup(data.group);
    } catch (err) {
      console.error(err);
      // If 404/not enabled yet, we attempt to enable it
      if (err.response?.status === 404) {
        try {
          const { data } = await api.post(`/group-trips/${itineraryId}/enable`);
          setGroup(data.group);
        } catch (enableErr) {
          console.error(enableErr);
          showErrorToast('Failed to initialize group planning for this trip.');
        }
      } else {
        showErrorToast(err.response?.data?.error || 'Failed to load group details.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;

    try {
      setSubmittingInvite(true);
      const { data } = await api.post(`/group-trips/${itineraryId}/invite`, {
        email: inviteEmail.toLowerCase(),
        role: inviteRole
      });
      setGroup(data.group);
      setInviteLink(data.inviteLink || `${window.location.origin}/itinerary/${itineraryId}?invite=${data.group.inviteToken}`);
      setInviteEmail('');
      showSuccessToast(`Invitation sent to ${inviteEmail}!`);
    } catch (err) {
      console.error(err);
      showErrorToast(err.response?.data?.error || 'Failed to send invitation.');
    } finally {
      setSubmittingInvite(false);
    }
  };

  const handleRemoveMember = async (email) => {
    try {
      const { data } = await api.delete(`/group-trips/${itineraryId}/members/${email}`);
      setGroup(data.group);
      showSuccessToast(`Removed ${email} from the trip.`);
    } catch (err) {
      console.error(err);
      showErrorToast(err.response?.data?.error || 'Failed to remove member.');
    }
  };

  const copyInviteLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      showSuccessToast('Invitation link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <LandingLayout>
        <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-12 text-center">
          <span className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin inline-block"></span>
          <p className="mt-4 text-on-surface-variant">Connecting group planning vault...</p>
        </div>
      </LandingLayout>
    );
  }

  if (!group) {
    return (
      <LandingLayout>
        <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-12 text-center">
          <h2 className="font-display-lg text-2xl mb-4">Group Trip Vault Unavailable</h2>
          <button onClick={() => navigate(-1)} className="bg-primary-container text-on-primary-container px-6 py-2 rounded-full font-bold">Go Back</button>
        </div>
      </LandingLayout>
    );
  }

  const isOwner = String(group.owner?._id || group.owner) === String(user?.id || user?._id);

  return (
    <LandingLayout>
      <div className="max-w-[800px] mx-auto px-margin-mobile md:px-margin-desktop py-12 space-y-12">
        {/* Header */}
        <div>
          <p className="font-label-caps text-[10px] text-outline uppercase tracking-wider mb-2">05 · TOGETHER</p>
          <h1 className="font-display-lg text-3xl md:text-4xl text-[#0B1226] mb-2">
            Plan this trip together
          </h1>
          <p className="text-sm text-on-surface-variant">
            Collaborate in real-time. Invite editors to refine the schedule, or viewers to share details.
          </p>
        </div>

        {/* Invite Form */}
        <form onSubmit={handleSendInvite} className="bg-white rounded-2xl p-8 border border-[#E5DED4] shadow-sm space-y-6">
          <h3 className="font-headline-md text-lg text-[#0B1226]">Invite collaborators</h3>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-6 flex flex-col gap-1.5">
              <label className="font-label-caps text-[10px] text-outline uppercase tracking-wider">Invite by email</label>
              <input
                type="email"
                placeholder="explorer@travel.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="h-12 px-4 rounded-xl border border-[#D1C7BD] bg-white focus:border-primary transition-all outline-none text-sm font-semibold text-[#0B1226]"
                required
              />
            </div>
            <div className="md:col-span-3 flex flex-col gap-1.5">
              <label className="font-label-caps text-[10px] text-outline uppercase tracking-wider">Role</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="h-12 px-4 rounded-xl border border-[#D1C7BD] bg-white focus:border-primary transition-all outline-none text-sm font-semibold text-[#0B1226]"
              >
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            <div className="md:col-span-3">
              <button
                type="submit"
                disabled={submittingInvite}
                className="w-full h-12 bg-[#ffa630] text-[#0B1226] font-bold rounded-xl hover:brightness-105 active:scale-95 transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                {submittingInvite ? 'Inviting...' : 'Send Invite'}
              </button>
            </div>
          </div>

          {inviteLink && (
            <div className="p-4 bg-[#FAF6F0] rounded-xl border border-[#E5DED4] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="w-full sm:flex-1">
                <span className="font-label-caps text-[9px] text-outline uppercase tracking-wider block mb-1">Collaboration Invite Link</span>
                <input 
                  type="text" 
                  value={inviteLink} 
                  readOnly 
                  className="w-full bg-white/60 border-none p-2 rounded text-xs font-mono text-[#006d35] select-all outline-none" 
                />
              </div>
              <button 
                type="button" 
                onClick={copyInviteLink} 
                className="bg-white border border-[#D1C7BD] px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#FAF6F0] transition-colors cursor-pointer whitespace-nowrap"
              >
                Copy Link
              </button>
            </div>
          )}
        </form>

        {/* Member List */}
        <div className="space-y-4">
          <h3 className="font-headline-md text-xl text-[#0B1226]">Members</h3>
          <div className="space-y-3">
            {group.members.map((member) => (
              <div key={member.email || member.user?._id} className="bg-white rounded-xl p-4 border border-[#E5DED4] shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FAF6F0] border border-[#E5DED4] flex items-center justify-center font-bold text-sm text-[#0B1226]">
                    {member.user?.name ? member.user.name.charAt(0).toUpperCase() : member.email?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#0B1226]">
                      {member.user?.name || member.email}
                      {String(member.user?._id || member.user) === String(user?.id || user?._id) && (
                        <span className="ml-2 text-[10px] bg-[#FAF6F0] text-outline px-2 py-0.5 rounded font-normal uppercase font-label-caps">You</span>
                      )}
                    </h4>
                    <p className="text-xs text-on-surface-variant capitalize">
                      {member.role} {member.role === 'owner' ? '' : `• ${member.email}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider font-label-caps border ${
                    member.status === 'accepted' 
                      ? 'bg-[#e6f4ea] text-[#006d35] border-[#3bc48a]/20' 
                      : 'bg-[#FAF6F0] text-[#8e9192] border-[#D1C7BD]'
                  }`}>
                    {member.status}
                  </span>
                  {isOwner && member.role !== 'owner' && (
                    <button
                      onClick={() => handleRemoveMember(member.email)}
                      className="text-xs font-bold text-[#ba1a1a] hover:underline uppercase tracking-wider font-label-caps pl-2 cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits banner */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter items-center">
          <div className="md:col-span-8 rounded-2xl overflow-hidden shadow-sm h-48">
            <img 
              src="https://images.unsplash.com/photo-1539635278303-d4002c07eae3?auto=format&fit=crop&w=800&q=80" 
              alt="Group Traveling" 
              className="w-full h-full object-cover" 
            />
          </div>
          <div className="md:col-span-4 bg-[#885200] text-white p-8 rounded-2xl shadow-sm h-48 flex flex-col justify-center gap-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-2xl text-[#ffa630]">group</span>
              <h4 className="font-bold text-sm uppercase tracking-wider font-label-caps">Group Benefits</h4>
            </div>
            <p className="text-xs text-white/80 leading-relaxed">
              Shared itineraries, split costs, and collaborative photo albums for every leg of the journey.
            </p>
          </div>
        </div>

        {/* Back to itinerary */}
        <div className="text-center pt-4">
          <Link to={`/itinerary/${itineraryId}`} className="text-sm font-bold text-primary hover:underline flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Itinerary
          </Link>
        </div>
      </div>
    </LandingLayout>
  );
};

export default GroupTripsPage;
