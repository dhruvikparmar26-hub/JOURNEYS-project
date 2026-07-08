import React, { useState, useEffect } from 'react';
import LandingLayout from '../components/ui/LandingLayout.jsx';
import api from '../utils/api.js';
import { useToast } from '../components/ui/Toast.jsx';

const NotificationsPage = () => {
  const { success: showSuccessToast, error: showErrorToast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(15);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/notifications');
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error(err);
      showErrorToast('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      const { data } = await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => 
        prev.map(n => n._id === id ? data.notification : n)
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      showSuccessToast('All notifications marked as read.');
    } catch (err) {
      console.error(err);
      showErrorToast('Failed to mark all as read.');
    }
  };

  const formatRelativeTime = (dateStr) => {
    const elapsed = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(elapsed / 60000);
    if (minutes < 1) return 'JUST NOW';
    if (minutes < 60) return `${minutes} MINUTES AGO`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} HOURS AGO`;
    const days = Math.floor(hours / 24);
    return `${days} DAYS AGO`;
  };

  if (loading && notifications.length === 0) {
    return (
      <LandingLayout>
        <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-12 text-center">
          <span className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin inline-block"></span>
          <p className="mt-4 text-on-surface-variant">Checking messages...</p>
        </div>
      </LandingLayout>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <LandingLayout>
      <div className="max-w-[640px] mx-auto px-margin-mobile md:px-margin-desktop py-12 space-y-8 flex-grow">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5DED4] pb-6">
          <div>
            <h1 className="font-display-lg text-2xl md:text-3xl text-[#0B1226]">Notifications</h1>
            <p className="text-xs text-on-surface-variant mt-1">
              You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs font-bold text-primary hover:underline uppercase tracking-wider font-label-caps cursor-pointer"
            >
              Mark all read
            </button>
          )}
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E5DED4] p-12 text-center space-y-3">
            <span className="material-symbols-outlined text-4xl text-outline-variant">notifications_off</span>
            <h3 className="font-headline-md text-lg text-[#0B1226]">All caught up!</h3>
            <p className="text-sm text-on-surface-variant">No notifications to display at the moment.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.slice(0, limit).map((n) => (
              <div
                key={n._id}
                onClick={() => !n.read && handleMarkRead(n._id)}
                className={`bg-white rounded-xl p-5 border border-[#E5DED4] shadow-sm transition-all relative flex items-start gap-4 cursor-pointer hover:border-primary-container ${!n.read ? 'ring-1 ring-primary/10' : 'opacity-85'}`}
              >
                {/* Unread status dot */}
                {!n.read && (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ba1a1a] flex-shrink-0 mt-1.5 animate-pulse" />
                )}
                <div className="flex-1 space-y-1">
                  <p className={`text-sm leading-relaxed ${!n.read ? 'font-semibold text-[#0B1226]' : 'text-on-surface-variant'}`}>
                    {n.message}
                  </p>
                  <span className="text-[10px] font-bold text-outline-variant font-label-caps block tracking-wide">
                    {formatRelativeTime(n.createdAt)}
                  </span>
                </div>
                {n.type === 'review_submitted' && (
                  <span className="material-symbols-outlined text-outline-variant text-lg">rate_review</span>
                )}
                {n.type === 'group_trip_joined' && (
                  <span className="material-symbols-outlined text-outline-variant text-lg">group_add</span>
                )}
                {(!n.type || (n.type !== 'review_submitted' && n.type !== 'group_trip_joined')) && (
                  <span className="material-symbols-outlined text-outline-variant text-lg">mail</span>
                )}
              </div>
            ))}

            {limit < notifications.length && (
              <div className="text-center pt-4">
                <button
                  onClick={() => setLimit(prev => prev + 15)}
                  className="bg-white border border-[#D1C7BD] px-6 py-2.5 rounded-full text-xs font-bold text-outline-variant hover:bg-[#FAF6F0] active:scale-95 transition-all cursor-pointer font-label-caps uppercase tracking-wider shadow-sm"
                >
                  Load older notifications
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </LandingLayout>
  );
};

export default NotificationsPage;
