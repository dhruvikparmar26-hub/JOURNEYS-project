import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { X, Navigation } from 'lucide-react';
import AccountMenu from './AccountMenu.jsx';
import useAuth from '../hooks/useAuth.js';

const MobileNav = ({ isOpen, onClose }) => {
  const { isAuthenticated } = useAuth();
  const drawerRef = useRef(null);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-bg-primary/80 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="fixed inset-y-0 left-0 w-4/5 max-w-sm bg-bg-surface border-r border-border flex flex-col p-6 z-50 transition-all duration-300 animate-slide-in"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-border">
          <a href="/" className="flex items-center gap-2 group" onClick={onClose}>
            <span className="text-xl font-bold tracking-tight text-accent-gold">
              JOURNEYS
            </span>
          </a>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary p-2 rounded hover:bg-bg-elevated transition-all cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-6 space-y-6">
          {/* Main Links */}
          <div className="flex flex-col gap-1.5">
            <Link
              to="/"
              onClick={onClose}
              className="px-3.5 py-3 rounded text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
            >
              Home
            </Link>
            <Link
              to="/planner"
              onClick={onClose}
              className="px-3.5 py-3 rounded text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
            >
              Trip Planner
            </Link>
            <Link
              to="/explore"
              onClick={onClose}
              className="px-3.5 py-3 rounded text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
            >
              Explore
            </Link>
            {isAuthenticated && (
              <Link
                to="/my-trips"
                onClick={onClose}
                className="px-3.5 py-3 rounded text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
              >
                My Trips
              </Link>
            )}
          </div>

          {/* Account Profile Area */}
          <div className="pt-4 border-t border-border/40">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-3 px-3">
              Account Control
            </h4>
            <AccountMenu inline={true} onNavigate={onClose} />
          </div>
        </div>

        {/* Footer */}
        <div className="text-[10px] text-text-muted font-semibold tracking-wider uppercase text-center mt-auto pt-4 border-t border-border/20">
          LANGGRAPH_AGENT_V1.0
        </div>
      </div>
    </div>
  );
};

export default MobileNav;
