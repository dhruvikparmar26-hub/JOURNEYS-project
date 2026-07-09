import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import api from '../../utils/api.js';
import { useScrollDirection } from '../../hooks/useAnimations.js';

// ─── Shared Header for Landing / Auth Views ────────────────────────
export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const scrollDirection = useScrollDirection();
  
  // States
  const [isSticky, setIsSticky] = useState(false);
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const [isAvatarOpen, setIsAvatarOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Monitor Scroll for Sticky Header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch Notifications if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const fetchNotifications = async () => {
        try {
          const res = await api.get('/notifications');
          if (res.data?.success) {
            setNotifications(res.data.notifications || []);
            setUnreadCount(res.data.notifications?.filter(n => !n.read).length || 0);
          }
        } catch (err) {
          console.error('Failed to fetch header notifications:', err);
        }
      };
      fetchNotifications();
      // Poll every 45 seconds for real-time feel
      const interval = setInterval(fetchNotifications, 45000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleLogout = async () => {
    await logout();
    setIsAvatarOpen(false);
    navigate('/');
  };

  const categories = [
    { name: 'Beach Escapes', icon: 'beach_access', slug: 'beach' },
    { name: 'Mountain Climbs', icon: 'landscape', slug: 'mountain' },
    { name: 'Heritage & Culture', icon: 'account_balance', slug: 'heritage' },
    { name: 'Adventure Thrills', icon: 'hiking', slug: 'adventure' },
    { name: 'Spiritual Journeys', icon: 'self_improvement', slug: 'spiritual' },
    { name: 'Wildlife & Nature', icon: 'forest', slug: 'wildlife' }
  ];

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isSticky 
          ? 'bg-[#0B1226]/95 border-b border-outline-variant/10 shadow-lg py-3 backdrop-blur-md' 
          : 'bg-[#0B1226] py-5'
      } ${
        scrollDirection === 'down' && window.scrollY > 300 
          ? '-translate-y-full' 
          : 'translate-y-0'
      }`}
    >
      <div className="flex justify-between items-center max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop relative">
        
        {/* Logo */}
        <div 
          className="flex items-center gap-3 cursor-pointer active:scale-95 transition-transform" 
          onClick={() => navigate('/')}
        >
          <svg viewBox="0 0 100 100" className="w-9 h-9 flex-shrink-0" aria-label="Journeys Logo" role="img">
            <circle cx="50" cy="50" r="50" fill="#0B1226" />
            <path
              d="M33 67 L67 33 M47 33 H67 V53"
              stroke="#ffa630"
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
          <span className="font-display-lg text-xl text-primary-container block uppercase tracking-tighter">Journeys</span>
        </div>

        {/* Links & Mega Menu trigger */}
        <div className="hidden lg:flex items-center gap-8 font-label-caps text-[11px] tracking-wider font-bold">
          
          {/* Explore with Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => setIsExploreOpen(true)}
            onMouseLeave={() => setIsExploreOpen(false)}
          >
            <Link 
              to="/explore" 
              className={`flex items-center gap-1 transition-colors py-2 ${
                location.pathname === '/explore' ? 'text-primary-container' : 'text-background/80 hover:text-background'
              }`}
            >
              Explore <span className="material-symbols-outlined text-xs">keyboard_arrow_down</span>
            </Link>
            
            {/* Mega Menu Dropdown */}
            {isExploreOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-80 bg-white border border-[#E5DED4] rounded-xl shadow-xl p-4 grid grid-cols-2 gap-2 animate-scale-in z-50 text-[#0B1226]">
                <div className="col-span-2 border-b border-[#FAF6F0] pb-2 mb-1">
                  <span className="text-[10px] text-outline font-bold uppercase tracking-widest block">Categories</span>
                </div>
                {categories.map((cat) => (
                  <Link
                    key={cat.slug}
                    to={`/explore?category=${cat.slug}`}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#FAF6F0] transition-colors"
                    onClick={() => setIsExploreOpen(false)}
                  >
                    <span className="material-symbols-outlined text-primary text-lg">{cat.icon}</span>
                    <span className="text-xs font-semibold text-[#0B1226]">{cat.name}</span>
                  </Link>
                ))}
                <Link
                  to="/explore"
                  className="col-span-2 text-center text-xs font-bold text-primary mt-2 pt-2 border-t border-[#FAF6F0] block hover:underline"
                  onClick={() => setIsExploreOpen(false)}
                >
                  View All Destinations →
                </Link>
              </div>
            )}
          </div>

          <Link to="/planner" className={`transition-colors py-2 ${location.pathname === '/planner' ? 'text-primary-container' : 'text-background/80 hover:text-background'}`}>Trip Planner</Link>
          <Link to="/my-trips" className={`transition-colors py-2 ${location.pathname === '/my-trips' ? 'text-primary-container' : 'text-background/80 hover:text-background'}`}>My Trips</Link>
          <Link to="/wishlist" className={`transition-colors py-2 ${location.pathname === '/wishlist' ? 'text-primary-container' : 'text-background/80 hover:text-background'}`}>Wishlist</Link>
          <Link to="/price-tracker" className={`transition-colors py-2 ${location.pathname === '/price-tracker' ? 'text-primary-container' : 'text-background/80 hover:text-background'}`}>Price Alerts</Link>
          <Link to="/analytics" className={`transition-colors py-2 ${location.pathname === '/analytics' ? 'text-primary-container' : 'text-background/80 hover:text-background'}`}>Insights</Link>
          {user?.role === 'admin' && (
            <Link to="/admin" className={`transition-colors py-2 ${location.pathname === '/admin' ? 'text-primary-container' : 'text-background/80 hover:text-background'}`}>Admin</Link>
          )}
        </div>

        {/* Auth Slot / Interactive Notifications & Avatar */}
        <div className="flex items-center gap-5 font-label-caps text-xs">
          
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              
              {/* Notification Bell */}
              <div className="relative cursor-pointer py-1" onClick={() => navigate('/notifications')}>
                <span className="material-symbols-outlined text-background/80 hover:text-background text-2xl transition-colors">notifications</span>
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </div>

              {/* Avatar Dropdown trigger */}
              <div 
                className="relative"
                onClick={() => setIsAvatarOpen(!isAvatarOpen)}
                onMouseEnter={() => setIsAvatarOpen(true)}
              >
                <div className="flex items-center gap-2 cursor-pointer py-2">
                  <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center border border-primary-container/20 text-[#0B1226] font-bold text-xs uppercase overflow-hidden">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user?.name?.substring(0, 2) || 'TR'
                    )}
                  </div>
                  <span className="hidden md:inline text-background/80 font-bold max-w-[100px] truncate hover:text-background transition-colors">
                    {user?.name?.split(' ')[0] || 'Traveler'}
                  </span>
                </div>

                {/* Avatar Menu */}
                {isAvatarOpen && (
                  <div 
                    className="absolute right-0 mt-1 w-48 bg-white border border-[#E5DED4] rounded-xl shadow-xl py-2 animate-scale-in z-50 text-[#0B1226]"
                    onMouseLeave={() => setIsAvatarOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-[#FAF6F0] mb-1">
                      <span className="font-bold text-xs block text-[#0B1226] truncate">{user?.name}</span>
                      <span className="text-[10px] text-outline block truncate">{user?.email}</span>
                      {user?.tier && (
                        <span className="inline-block mt-1 text-[9px] font-bold text-[#6b4000] bg-[#ffa630]/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          👑 {user.tier} Tier
                        </span>
                      )}
                    </div>
                    <Link to="/profile" className="flex items-center gap-2 px-4 py-2 hover:bg-[#FAF6F0] text-xs font-bold transition-colors">
                      <span className="material-symbols-outlined text-sm">person</span> Profile Dashboard
                    </Link>
                    <Link to="/settings" className="flex items-center gap-2 px-4 py-2 hover:bg-[#FAF6F0] text-xs font-bold transition-colors">
                      <span className="material-symbols-outlined text-sm">settings</span> Account Settings
                    </Link>
                    <Link to="/help" className="flex items-center gap-2 px-4 py-2 hover:bg-[#FAF6F0] text-xs font-bold transition-colors">
                      <span className="material-symbols-outlined text-sm">help</span> Help Center
                    </Link>
                    <hr className="my-1 border-[#FAF6F0]" />
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 hover:bg-error/10 hover:text-error text-xs font-bold transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">logout</span> Log Out
                    </button>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-6">
              <Link to="/login" className="text-background/80 hover:text-background font-bold transition-colors">Log In</Link>
              <Link to="/signup" className="bg-primary-container text-on-primary-container px-6 py-2.5 rounded-full font-bold hover:brightness-110 active:scale-95 shadow-md transition-all">Sign Up</Link>
            </div>
          )}

          {/* Hamburger Mobile Menu Trigger */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="lg:hidden text-background/80 hover:text-background p-1 active:scale-90 transition-transform cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            <span className="material-symbols-outlined text-2xl">{isMobileMenuOpen ? 'close' : 'menu'}</span>
          </button>

        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[60px] bg-[#0B1226] z-40 border-t border-outline-variant/10 px-margin-mobile py-8 flex flex-col justify-between animate-fade-in-down">
          <div className="flex flex-col gap-6 font-label-caps text-sm tracking-widest font-bold">
            <Link to="/explore" onClick={() => setIsMobileMenuOpen(false)} className="text-background/80 hover:text-background py-2 border-b border-background/5">Explore Destinations</Link>
            <Link to="/planner" onClick={() => setIsMobileMenuOpen(false)} className="text-background/80 hover:text-background py-2 border-b border-background/5">Trip Planner</Link>
            <Link to="/my-trips" onClick={() => setIsMobileMenuOpen(false)} className="text-background/80 hover:text-background py-2 border-b border-background/5">My Trips</Link>
            <Link to="/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="text-background/80 hover:text-background py-2 border-b border-background/5">Wishlist</Link>
            <Link to="/price-tracker" onClick={() => setIsMobileMenuOpen(false)} className="text-background/80 hover:text-background py-2 border-b border-background/5">Price Alerts</Link>
            <Link to="/analytics" onClick={() => setIsMobileMenuOpen(false)} className="text-background/80 hover:text-background py-2 border-b border-background/5">Insights</Link>
            {user?.role === 'admin' && (
              <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="text-background/80 hover:text-background py-2 border-b border-background/5">Admin</Link>
            )}
            <Link to="/help" onClick={() => setIsMobileMenuOpen(false)} className="text-background/80 hover:text-background py-2 border-b border-background/5">Help Center</Link>
          </div>

          {!isAuthenticated && (
            <div className="flex flex-col gap-4 pt-8">
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full text-center py-3 border border-background/25 rounded-full text-background font-bold uppercase tracking-wider font-label-caps">Log In</Link>
              <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)} className="w-full text-center py-3 bg-primary-container text-on-primary-container rounded-full font-bold uppercase tracking-wider font-label-caps">Sign Up</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

// ─── Shared Footer for Landing / Auth Views ────────────────────────
export const Footer = () => {
  const navigate = useNavigate();
  return (
    <footer className="bg-inverse-surface w-full py-section-gap text-background mt-auto border-t border-outline-variant/10">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="md:col-span-6">
          <div className="flex items-center gap-3 cursor-pointer active:scale-95 transition-transform mb-6" onClick={() => navigate('/')}>
            <svg viewBox="0 0 100 100" className="w-8 h-8 flex-shrink-0" aria-label="Journeys Logo" role="img">
              <circle cx="50" cy="50" r="50" fill="#0B1226" />
              <path
                d="M33 67 L67 33 M47 33 H67 V53"
                stroke="#ffa630"
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
            <span className="font-display-lg text-lg text-primary-container block uppercase tracking-tighter">Journeys</span>
          </div>
          <p className="font-body-md text-background/70 mb-8 max-w-xs leading-relaxed">
            Crafting modern, feature-rich tools for the timeless spirit of travel and exploration.
          </p>
        </div>
        <div className="md:col-span-3">
          <h4 className="font-label-caps text-background font-bold mb-6 text-xs uppercase tracking-widest text-[#ffa630]">Company</h4>
          <ul className="space-y-4 text-xs font-semibold uppercase tracking-wider text-background/60">
            <li><Link to="/about" className="text-background/70 hover:text-background transition-colors">About Us</Link></li>
          </ul>
        </div>
        <div className="md:col-span-3">
          <h4 className="font-label-caps text-background font-bold mb-6 text-xs uppercase tracking-widest text-[#ffa630]">Support</h4>
          <ul className="space-y-4 text-xs font-semibold uppercase tracking-wider text-background/60">
            <li><Link to="/help" className="text-background/70 hover:text-background transition-colors">Help Center</Link></li>
            <li><Link to="/privacy" className="text-background/70 hover:text-background transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms" className="text-background/70 hover:text-background transition-colors">Terms of Service</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-background/10 mt-16 pt-8 text-center text-xs text-background/50">
        © 2026 Journeys Travel Co. All rights reserved.
      </div>
    </footer>
  );
};

// ─── Custom Layout Wrapper for Landing/Auth Views ───────────────────
const LandingLayout = ({ children }) => {
  return (
    <div className="bg-[#FAF6F0] text-[#0B1226] font-body-md selection:bg-primary-container/30 min-h-screen flex flex-col pt-[76px] travel-cursor">
      <Header />
      <main className="flex-grow flex flex-col">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default LandingLayout;
