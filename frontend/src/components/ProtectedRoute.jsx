import React, { useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';
import { Navigation, Loader2 } from 'lucide-react';

/**
 * Wrapper for routes that require authentication.
 * Redirects to / if not authenticated and opens the AuthModal.
 * Shows a loading state during session restoration.
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, openAuthModal } = useAuth();
  const location = useLocation();
  const modalOpened = useRef(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !modalOpened.current) {
      modalOpened.current = true;
      openAuthModal('Please sign in to access this page.');
    }
  }, [isLoading, isAuthenticated, openAuthModal]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded bg-primary flex items-center justify-center">
              <Navigation className="w-5.5 h-5.5 text-on-primary" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              <span className="text-text-primary">JOUR</span>
              <span className="text-primary">NEYS</span>
            </span>
          </div>

          {/* Spinner */}
          <Loader2 className="w-6 h-6 text-secondary animate-spin" />
          <p className="text-sm text-text-muted font-semibold">Restoring your session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to home dashboard
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
