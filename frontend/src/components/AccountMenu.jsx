import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';
import Button from './ui/Button.jsx';
import { User, LogOut, Shield, Compass, ChevronDown } from 'lucide-react';

const AccountMenu = ({ inline = false, onNavigate }) => {
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setIsOpen(false);
    await logout();
    navigate('/');
    if (onNavigate) onNavigate();
  };

  const handleLinkClick = (path) => {
    setIsOpen(false);
    navigate(path);
    if (onNavigate) onNavigate();
  };

  if (!isAuthenticated) {
    return (
      <Button
        variant="primary"
        size="sm"
        onClick={() => navigate('/login')}
        className="font-bold cursor-pointer"
      >
        Sign In
      </Button>
    );
  }

  const userInitials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() || 'U';

  // Render inline version for mobile nav drawer
  if (inline) {
    return (
      <div className="space-y-4 py-2">
        <div className="flex items-center gap-3 px-3 py-2 border-b border-border-subtle">
          <div className="w-10 h-10 rounded-full bg-primary-fixed/25 text-primary font-bold flex items-center justify-center border border-primary/40 text-sm">
            {userInitials}
          </div>
          <div className="truncate">
            <div className="text-sm font-bold text-text-primary truncate">{user?.name || 'Explorer'}</div>
            <div className="text-xs text-text-muted truncate">{user?.email}</div>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => handleLinkClick('/my-trips')}
            className="w-full text-left px-3 py-2.5 rounded text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-bg-elevated flex items-center gap-3 transition-colors cursor-pointer"
          >
            <Compass className="w-4 h-4 text-secondary" />
            My Trips
          </button>
          <button
            onClick={() => handleLinkClick('/settings/2fa')}
            className="w-full text-left px-3 py-2.5 rounded text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-bg-elevated flex items-center gap-3 transition-colors cursor-pointer"
          >
            <Shield className="w-4 h-4 text-secondary" />
            2FA Security Settings
          </button>
          <button
            onClick={handleSignOut}
            className="w-full text-left px-3 py-2.5 rounded text-sm font-semibold text-danger hover:bg-danger/10 flex items-center gap-3 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-full hover:bg-bg-elevated border border-transparent hover:border-border-subtle transition-all cursor-pointer"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="w-8 h-8 rounded-full bg-primary-fixed/25 text-primary font-bold flex items-center justify-center border border-primary/40 text-xs">
          {userInitials}
        </div>
        <ChevronDown className={`w-4 h-4 text-text-secondary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-bg-surface border border-border-subtle rounded shadow-[0_8px_30px_rgba(0,91,175,0.08)] p-2 z-50 animate-modal-in">
          {/* User Profile Header */}
          <div className="px-3 py-2.5 border-b border-border-subtle mb-1.5">
            <div className="text-xs text-text-muted font-semibold mb-0.5">Signed in as</div>
            <div className="text-sm font-bold text-text-primary truncate">{user?.name || 'Explorer'}</div>
            <div className="text-xs text-text-secondary truncate">{user?.email}</div>
          </div>

          {/* Menu Options */}
          <div className="space-y-0.5">
            <button
              onClick={() => handleLinkClick('/my-trips')}
              className="w-full text-left px-3 py-2 rounded text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-bg-elevated flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <Compass className="w-4 h-4 text-secondary" />
              My Trips
            </button>
            <button
              onClick={() => handleLinkClick('/settings/2fa')}
              className="w-full text-left px-3 py-2 rounded text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-bg-elevated flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <Shield className="w-4 h-4 text-secondary" />
              2FA Settings
            </button>
            <div className="h-px bg-border-subtle my-1" />
            <button
              onClick={handleSignOut}
              className="w-full text-left px-3 py-2 rounded text-xs font-semibold text-danger hover:bg-danger/10 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountMenu;
