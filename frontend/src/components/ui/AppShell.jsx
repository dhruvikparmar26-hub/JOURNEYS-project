import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Menu, Navigation, Search, Settings, Bell } from 'lucide-react';
import AccountMenu from '../AccountMenu.jsx';
import NotificationBell from '../NotificationBell.jsx';
import MobileNav from '../MobileNav.jsx';
import useAuth from '../../hooks/useAuth.js';

const AppShell = ({ children, className = '' }) => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const showSearch = location.pathname === '/explore' || location.pathname === '/my-trips';

  return (
    <div className={`min-h-screen bg-bg-primary text-text-primary flex flex-col ${className}`}>
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-bg-primary">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              {/* Mobile Hamburger menu */}
              <button
                onClick={() => setIsMobileNavOpen(true)}
                className="md:hidden text-text-secondary hover:text-text-primary p-2 rounded hover:bg-bg-elevated transition-all mr-1.5 cursor-pointer"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6" />
              </button>

              {/* Logo */}
              <Link to="/" className="flex items-center gap-2.5 group">
                <span className="text-xl font-bold tracking-tight text-accent-gold">
                  JOURNEYS
                </span>
              </Link>
            </div>

            {/* Navigation Bar */}
            <nav className="hidden md:flex items-center gap-6">
              <NavLink to="/" label="Dashboard" active={location.pathname === '/'} />
              <NavLink to="/explore" label="Explore" active={location.pathname === '/explore'} />
              {isAuthenticated && (
                <NavLink to="/my-trips" label="My Trips" active={location.pathname === '/my-trips'} />
              )}
            </nav>

            {/* Right Cluster */}
            <div className="flex items-center gap-4">
              {/* Search input on Explore/MyTrips - desktop only */}
              {showSearch && (
                <div className="hidden lg:flex items-center bg-[#0e0e0e] rounded pl-3 pr-4 py-2 border border-[#4d4635] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.6),inset_-1px_-1px_2px_rgba(255,255,255,0.05)]">
                  <Search className="w-4 h-4 text-[#8e9192] mr-2" />
                  <input
                    type="text"
                    placeholder={location.pathname === '/explore' ? "Where do you want to go?" : "Search itineraries..."}
                    className="bg-transparent border-none outline-none text-sm text-[#e5e2e1] placeholder:text-[#8e9192] w-48"
                  />
                </div>
              )}

              {/* Search icon on mobile for Explore/MyTrips */}
              {showSearch && (
                <button className="lg:hidden text-text-secondary hover:text-text-primary p-2 rounded hover:bg-bg-elevated transition-all cursor-pointer">
                  <Search className="w-6 h-6" />
                </button>
              )}

              {/* Notification Bell */}
              {isAuthenticated && <NotificationBell />}

              {/* Settings - desktop only */}
              <Link
                to="/settings"
                className="hidden md:flex text-text-secondary hover:text-text-primary p-2 rounded hover:bg-bg-elevated transition-all cursor-pointer"
              >
                <Settings className="w-5 h-5" />
              </Link>

              {/* Avatar */}
              <div id="header-auth-slot" className="flex items-center">
                <AccountMenu />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <MobileNav isOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />

      {/* Main Content */}
      <main className="flex-grow flex flex-col">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-auto bg-bg-surface">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-text-muted">
              © {new Date().getFullYear()} JOURNEYS. AI-powered travel planning.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-xs text-text-muted hover:text-text-secondary transition-colors">Privacy</a>
              <a href="#" className="text-xs text-text-muted hover:text-text-secondary transition-colors">Terms</a>
              <a href="#" className="text-xs text-text-muted hover:text-text-secondary transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const NavLink = ({ to, label, active = false }) => (
  <Link
    to={to}
    className={`
      px-3.5 py-1.5 rounded text-sm font-medium transition-all duration-300 cursor-pointer relative
      ${active
        ? 'text-accent-gold'
        : 'text-text-secondary hover:text-text-primary'
      }
    `}
  >
    {label}
    {active && (
      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-gold" />
    )}
  </Link>
);

export default AppShell;
